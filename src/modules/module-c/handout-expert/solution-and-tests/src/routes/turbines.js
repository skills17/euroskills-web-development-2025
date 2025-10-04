import {Router} from 'express';
import {prisma} from '../db.js';
import {authenticate, requireRole} from '../auth.js';
import {fetchLogs, fetchTurbines, postStatus} from '../external.js';
import {evaluateHighRpmForTurbine} from '../alerts.js';
import {badRequest, conflict, internal, notFound} from '../problems.js';
import {parseLogs, upsertLogs} from '../logs.js';

const router = Router();

// Helper: build Freshness-wrapped value
function wrapValue(value, lastUpdated, freshness = "missing") {
    return {value, freshness: value == null ? "missing" : freshness, lastUpdated};
}

// GET /turbines (public)
router.get('/', async (_req, res) => {
    try {
        let turbines;
        try {
            const upstream = await fetchTurbines();
            turbines = upstream.data || [];
            // Cache/Upsert basic info
            const ts = new Date(upstream.timestamp);
            for (const t of turbines) {
                await prisma.turbineCache.upsert({
                    where: {turbineId: t.id},
                    update: {
                        name: t.name,
                        locationLat: t.location?.lat ?? 0,
                        locationLng: t.location?.lng ?? 0,
                        overallUpdated: ts,
                    },
                    create: {
                        turbineId: t.id,
                        name: t.name,
                        locationLat: t.location?.lat ?? 0,
                        locationLng: t.location?.lng ?? 0,
                        data: {},
                        propsUpdated: {},
                        overallUpdated: ts,
                    },
                });
            }
            // Map to summary
            const summary = turbines.map(t => ({id: t.id, name: t.name, location: t.location, status: t.status}));
            return res.json(summary);
        } catch (e) {
            // Fallback to cache
            const cached = await prisma.turbineCache.findMany();
            const summary = cached.map(c => ({
                id: c.turbineId,
                name: c.name,
                location: {lat: c.locationLat, lng: c.locationLng},
                status: (c.data?.status ?? {}).value || 'shutdown'
            }));
            return res.json(summary);
        }
    } catch (e) {
        return internal(res);
    }
});

// GET /turbines/:id/status (public)
router.get('/:id/status', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return notFound(res);

    // Try live fetch first
    try {
        const upstream = await fetchTurbines();
        const ts = new Date(upstream.timestamp);
        const itm = (upstream.data || []).find(t => t.id === id);

        if (!itm) {
            // if we have cache, return cached; else 404
            const cache = await prisma.turbineCache.findUnique({where: {turbineId: id}});
            if (!cache) return notFound(res, 'Turbine not found');
            const data = cache.data || {};
            const propsUpdated = cache.propsUpdated || {};
            const out = {
                id: id,
                name: cache.name,
                freshness: 'cached',
                lastUpdated: cache.overallUpdated.toISOString(),
                rpm: wrapValue(data.rpm?.value ?? null, propsUpdated.rpm || cache.overallUpdated.toISOString(), 'cached'),
                powerMw: wrapValue(data.powerMw?.value ?? null, propsUpdated.powerMw || cache.overallUpdated.toISOString(), 'cached'),
                yaw: wrapValue(data.yaw?.value ?? null, propsUpdated.yaw || cache.overallUpdated.toISOString(), 'cached'),
                pitch: wrapValue(data.pitch?.value ?? null, propsUpdated.pitch || cache.overallUpdated.toISOString(), 'cached'),
                temperature: wrapValue(data.temperature?.value ?? null, propsUpdated.temperature || cache.overallUpdated.toISOString(), 'cached'),
                status: wrapValue(data.status?.value ?? 'shutdown', propsUpdated.status || cache.overallUpdated.toISOString(), 'cached'),
            };
            return res.json(out);
        }

        // Evaluate alerts on live data
        await evaluateHighRpmForTurbine(itm);

        // Update cache (do not overwrite with null values)
        const prev = await prisma.turbineCache.findUnique({where: {turbineId: id}});
        const prevData = prev?.data || {};
        const prevPropsUpdated = prev?.propsUpdated || {};

        const nowData = {
            rpm: {value: itm.rpm ?? prevData.rpm?.value ?? null},
            powerMw: {value: itm.powerMw ?? prevData.powerMw?.value ?? null},
            yaw: {value: itm.yaw ?? prevData.yaw?.value ?? null},
            pitch: {value: itm.pitch ?? prevData.pitch?.value ?? null},
            temperature: {value: itm.temperature ?? prevData.temperature?.value ?? null},
            status: {value: itm.status ?? prevData.status?.value ?? 'shutdown'},
        };

        const propsUpdated = {
            rpm: itm.rpm != null ? ts.toISOString() : (prevPropsUpdated.rpm || ts.toISOString()),
            powerMw: itm.powerMw != null ? ts.toISOString() : (prevPropsUpdated.powerMw || ts.toISOString()),
            yaw: itm.yaw != null ? ts.toISOString() : (prevPropsUpdated.yaw || ts.toISOString()),
            pitch: itm.pitch != null ? ts.toISOString() : (prevPropsUpdated.pitch || ts.toISOString()),
            temperature: itm.temperature != null ? ts.toISOString() : (prevPropsUpdated.temperature || ts.toISOString()),
            status: itm.status != null ? ts.toISOString() : (prevPropsUpdated.status || ts.toISOString()),
        };

        await prisma.turbineCache.upsert({
            where: {turbineId: id},
            update: {
                name: itm.name,
                locationLat: itm.location?.lat ?? 0,
                locationLng: itm.location?.lng ?? 0,
                data: nowData,
                propsUpdated,
                overallUpdated: ts,
            },
            create: {
                turbineId: id,
                name: itm.name,
                locationLat: itm.location?.lat ?? 0,
                locationLng: itm.location?.lng ?? 0,
                data: nowData,
                propsUpdated,
                overallUpdated: ts,
            },
        });

        const out = {
            id: id,
            name: itm.name,
            freshness: 'live',
            lastUpdated: ts.toISOString(),
            rpm: wrapValue(itm.rpm, propsUpdated.rpm, "live"),
            powerMw: wrapValue(itm.powerMw, propsUpdated.powerMw, "live"),
            yaw: wrapValue(itm.yaw, propsUpdated.yaw, "live"),
            pitch: wrapValue(itm.pitch, propsUpdated.pitch, "live"),
            temperature: wrapValue(itm.temperature, propsUpdated.temperature, "live"),
            status: wrapValue(itm.status, propsUpdated.status, "live"),
        };

        return res.json(out);
    } catch (_e) {
        // Fallback to cached on error/timeout
        const cache = await prisma.turbineCache.findUnique({where: {turbineId: id}});
        if (!cache) return notFound(res, 'Turbine not found');
        const data = cache.data || {};
        const propsUpdated = cache.propsUpdated || {};
        const out = {
            id: id,
            name: cache.name,
            freshness: 'cached',
            lastUpdated: cache.overallUpdated.toISOString(),
            rpm: wrapValue(data.rpm?.value ?? null, propsUpdated.rpm || cache.overallUpdated.toISOString(), 'cached'),
            powerMw: wrapValue(data.powerMw?.value ?? null, propsUpdated.powerMw || cache.overallUpdated.toISOString(), 'cached'),
            yaw: wrapValue(data.yaw?.value ?? null, propsUpdated.yaw || cache.overallUpdated.toISOString(), 'cached'),
            pitch: wrapValue(data.pitch?.value ?? null, propsUpdated.pitch || cache.overallUpdated.toISOString(), 'cached'),
            temperature: wrapValue(data.temperature?.value ?? null, propsUpdated.temperature || cache.overallUpdated.toISOString(), 'cached'),
            status: wrapValue(data.status?.value ?? 'shutdown', propsUpdated.status || cache.overallUpdated.toISOString(), 'cached'),
        };
        return res.json(out);
    }
});

// GET /turbines/:id/actions (public)
router.get('/:id/actions', async (req, res) => {
    const id = Number(req.params.id);
    const items = await prisma.action.findMany({where: {turbineId: id}, orderBy: {timestamp: 'asc'}});
    const out = items.map(a => ({
        type: a.type,
        pitch: a.pitch,
        yaw: a.yaw,
        timestamp: a.timestamp.toISOString(),
        user: a.user
    }));
    return res.json(out);
});

// POST /turbines/:id/control (operator/admin)
router.post('/:id/control', authenticate, requireRole('operator', 'admin'), async (req, res) => {
    const id = Number(req.params.id);
    const {pitch, yaw} = req.body || {};
    const errors = {};
    if (!Number.isInteger(pitch) || pitch < -90 || pitch > 90) errors.pitch = 'must be integer between -90 and 90';
    if (!Number.isInteger(yaw) || yaw < 0 || yaw > 360) errors.yaw = 'must be integer between 0 and 360';
    if (Object.keys(errors).length) return badRequest(res, 'Validation failed', {...errors});

    await prisma.action.create({data: {turbineId: id, type: 'control', pitch, yaw, user: req.user.username}});
    return res.json({status: 'success'});
});

// POST /turbines/:id/:action (start|shutdown|maintenance)
router.post('/:id/start', authenticate, requireRole('operator', 'admin'), actionHandler('start'));
router.post('/:id/shutdown', authenticate, requireRole('operator', 'admin'), actionHandler('shutdown'));
router.post('/:id/maintenance', authenticate, requireRole('operator', 'admin'), actionHandler('maintenance'));

function actionHandler(action) {
    return async (req, res) => {
        const id = Number(req.params.id);

        const cache = await prisma.turbineCache.findUnique({where: {turbineId: id}});
        const currentStatus = (cache?.data?.status?.value) || 'shutdown';

        if (action === 'start' && currentStatus !== 'shutdown') {
            return conflict(res, `Cannot start turbine from status '${currentStatus}'`);
        }
        if (action === 'shutdown' && currentStatus !== 'started') {
            return conflict(res, `Cannot shutdown turbine from status '${currentStatus}'`);
        }
        if (action === 'maintenance' && currentStatus !== 'shutdown') {
            return conflict(res, `Cannot put turbine into maintenance from status '${currentStatus}'`);
        }

        const newStatus = action === 'start' ? 'started' : action;
        await postStatus(id, newStatus);
        await prisma.action.create({data: {turbineId: id, type: action, user: req.user.username}});

        return res.json({status: 'success'});
    };
}

// GET /turbines/:id/logs (operator/admin)
router.get('/:id/logs', authenticate, requireRole('operator', 'admin'), async (req, res) => {
    const id = Number(req.params.id);
    const {levels, message} = req.query;

    try {
        const text = await fetchLogs(id);
        console.log(`Fetched logs for turbine ${id}, length ${text.length}`);
        const parsed = parseLogs(text);
        console.log(`Parsed logs for turbine ${id}, entries ${parsed.length}`);
        await upsertLogs(id, parsed);
    } catch (_e) {
        console.error(`Failed to fetch or upsert logs for turbine ${id}:`, _e);
    }

    // Read from DB (cached or freshly upserted)
    const where = {turbineId: id};
    if (levels) {
        const set = String(levels).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        where.level = {in: set};
    }
    if (message) {
        where.message = {contains: String(message)};
    }

    const entries = await prisma.logEntry.findMany({where, orderBy: {timestamp: 'asc'}, take: 1000});
    return res.json({
        turbineId: id,
        entries: entries.map(e => ({timestamp: e.timestamp.toISOString(), level: e.level, message: e.message}))
    });
});

export default router;
