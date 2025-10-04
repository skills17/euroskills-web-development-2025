import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticate, requireRole } from '../auth.js';
import { notFound } from '../problems.js';

const router = Router();

// GET /alerts (operator/admin)
router.get('/', authenticate, requireRole('operator', 'admin'), async (_req, res) => {
    const items = await prisma.alert.findMany({ orderBy: { id: 'asc' } });
    const out = items.map(a => ({ id: a.id, turbineId: a.turbineId, type: a.type, status: a.status, acknowledged: a.acknowledged, timestamp: a.timestamp.toISOString() }));
    return res.json(out);
});

// POST /alerts/:id/ack (operator/admin)
router.post('/:id/ack', authenticate, requireRole('operator', 'admin'), async (req, res) => {
    const id = Number(req.params.id);
    const item = await prisma.alert.findUnique({ where: { id } });
    if (!item) return notFound(res, 'Alert not found');
    await prisma.alert.update({ where: { id }, data: { acknowledged: 'acknowledged' } });
    return res.json({ status: 'acknowledged' });
});

export default router;
