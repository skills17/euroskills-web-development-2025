/* Offshore Wind-Farm External Turbine API — Express mock
 * - Single-file server with in-memory state (no datastore)
 * - Bearer auth via static token
 * - Control panel at /control to toggle scenarios
 * - Endpoints: GET /turbines, GET /turbines/:id/logs
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const PORT = process.env.PORT || 4000;
const AUTH_TOKEN = process.env.BEARER || 'SECRET_TOKEN_123';

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(morgan('dev'));

// ---------- In-memory state ----------
const defaultTurbines = () => ([
    {
        id: 1,
        name: 'Turbine A1',
        location: {lat: 56.4501, lng: 8.3465},
        rpm: 47,
        powerMw: 1.9,
        yaw: 270,
        pitch: 22,
        temperature: 35.2,
        status: 'started'
    },
    {
        id: 2,
        name: 'Turbine B7',
        location: {lat: 56.4512, lng: 8.3509},
        rpm: 39,
        powerMw: 1.5,
        yaw: 180,
        pitch: 18,
        temperature: 33.8,
        status: 'maintenance'
    },
    {
        id: 3,
        name: 'Turbine C3',
        location: {lat: 56.4494, lng: 8.3442},
        rpm: 0,
        powerMw: 0.0,
        yaw: 90,
        pitch: 0,
        temperature: 29.4,
        status: 'shutdown'
    },
    {
        id: 4,
        name: 'Turbine D2',
        location: {lat: 56.4521, lng: 8.3481},
        rpm: 51,
        powerMw: 2.2,
        yaw: 300,
        pitch: 25,
        temperature: 36.1,
        status: 'started'
    },
    {
        id: 5,
        name: 'Turbine E5',
        location: {lat: 56.4535, lng: 8.3520},
        rpm: 42,
        powerMw: 1.7,
        yaw: 210,
        pitch: 20,
        temperature: 34.7,
        status: 'started'
    }
]);

const state = {
    scenario: 'normal', // normal | empty | partial_turbines | partial_properties | high_rpm | error_500
    timestamp: new Date().toISOString(),
    delayMs: 0,
    turbines: defaultTurbines()
};

// ---------- Helpers ----------
const requireAuth = (req, res, next) => {
    const auth = req.headers.authorization || '';
    if (auth === `Bearer ${AUTH_TOKEN}`) return next();
    return res.status(401).json({error: 'Missing or invalid bearer token'});
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const makeSnapshot = () => {
    let data = state.turbines;

    if (state.scenario === 'empty') {
        data = [];
    } else if (state.scenario === 'high_rpm') {
        // force all turbines to report RPM=70 (other fields unchanged)
        data = state.turbines.map(t => ({...t, rpm: 70}));
    } else if (state.scenario === 'partial_turbines') {
        // return only first 2 turbines to simulate missing ones
        data = state.turbines.slice(0, 2);
    } else if (state.scenario === 'partial_properties') {
        // some properties missing (nullable by spec)
        const nullableProps = ['rpm', 'powerMw', 'yaw', 'pitch', 'temperature'];
        data = state.turbines.map((t, idx) => {
            const clone = {...t};
            // deterministically null out a couple props based on index
            const toNull = [nullableProps[idx % nullableProps.length], nullableProps[(idx + 2) % nullableProps.length]];
            toNull.forEach((p) => (clone[p] = null));
            return clone;
        });
    }

    return {
        timestamp: state.timestamp,
        data
    };
};

const logsForTurbine = (turbine) => {
    const lines = [
        `${new Date(Date.now() - 6 * 60_000).toISOString().split('.')[0] + 'Z'} [Info] Turbine ${turbine.name} (id=${turbine.id}) snapshot generated`,
        `${new Date(Date.now() - 5 * 60_000).toISOString().split('.')[0] + 'Z'} [Info] Turbine status: ${turbine.status}`,
        `${new Date(Date.now() - 4 * 60_000).toISOString().split('.')[0] + 'Z'} [Info] RPM=${turbine.rpm} Power=${turbine.powerMw}MW Yaw=${turbine.yaw}° Pitch=${turbine.pitch}°`,
        `${new Date(Date.now() - 3 * 60_000).toISOString().split('.')[0] + 'Z'} [Warning] Gust detected`,
        `${new Date(Date.now() - 2 * 60_000).toISOString().split('.')[0] + 'Z'} [Error] Satellite fallback connection lost. Details:`,
        `multi line error message belonging to the sensor failure`,
        `second line of the error message still belongs to the sensor failure. Keyword: wind`,
        `${new Date(Date.now() - 1 * 60_000).toISOString().split('.')[0] + 'Z'} [Info] Maintenance heartbeat OK`
    ];
    return lines.join('\n') + '\n';
};

// ---------- Health ----------
app.get('/__health', (req, res) => {
    return res.status(200).json({status: "healthy"})
});

// ---------- API routes ----------
app.get('/turbines', requireAuth, async (req, res) => {
    await sleep(state.delayMs);

    if (state.scenario === 'error_500') {
        return res.status(500).json({error: 'Simulated upstream 500 error'});
    }

    const payload = makeSnapshot();
    return res.status(200).json(payload);
});

app.post('/turbines/:id/status', requireAuth, async (req, res) => {
    await sleep(state.delayMs);
    const id = Number(req.params.id);

    const turbine = state.turbines.find((turbine) => turbine.id === id);
    if (!turbine) {
        return res.status(404).json({error: `Turbine ${id} not found`});
    }
    turbine.status = req.body.status;
    return res.status(200).type('text/plain').send('ok');
});

app.get('/turbines/:id/logs', requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const qDelay = Number(req.query.delay || 0);
    const delay = Number.isFinite(qDelay) && qDelay >= 0 ? qDelay : 0;

    await sleep(state.delayMs + delay);

    if (state.scenario === 'error_500') {
        res.status(500).type('text/plain').send('Simulated upstream 500 error\n');
        return;
    }

    const turbine = state.turbines.find((turbine) => turbine.id === id);
    if (!turbine) {
        return res.status(404).json({error: `Turbine ${id} not found`});
    }

    // reflect the scenario in the log line that prints RPM
    const turbineForLogs = state.scenario === 'high_rpm' ? {...turbine, rpm: 70} : turbine;

    const logs = logsForTurbine(turbineForLogs);
    res.status(200).type('text/plain').send(logs);
});

// ---------- Admin (no auth on purpose for easy toggling in local mocks) ----------
app.get('/__admin/state', (req, res) => {
    res.json({
        scenario: state.scenario,
        timestamp: state.timestamp,
        delayMs: state.delayMs,
        turbinesCount: state.turbines.length
    });
});

app.post('/__admin/scenario', (req, res) => {
    const allowed = ['normal', 'empty', 'partial_turbines', 'partial_properties', 'high_rpm', 'error_500'];
    const s = String((req.body && req.body.scenario) || req.query.scenario || '').trim();
    if (!allowed.includes(s)) {
        return res.status(400).json({error: `scenario must be one of ${allowed.join(', ')}`});
    }
    state.scenario = s;
    return res.json({ok: true, scenario: state.scenario});
});

app.post('/__admin/timestamp', (req, res) => {
    // Accept ISO string; if empty, set to now
    const ts = String((req.body && req.body.timestamp) || req.query.timestamp || '').trim();
    state.timestamp = ts || new Date().toISOString();
    return res.json({ok: true, timestamp: state.timestamp});
});

app.post('/__admin/delay', (req, res) => {
    const ms = Number((req.body && req.body.delayMs) || req.query.delayMs || 0);
    if (!Number.isFinite(ms) || ms < 0) return res.status(400).json({error: 'delayMs must be a non-negative number'});
    state.delayMs = ms;
    return res.json({ok: true, delayMs: state.delayMs});
});

app.post('/__admin/reset', (req, res) => {
    state.scenario = 'normal';
    state.timestamp = new Date().toISOString();
    state.delayMs = 0;
    state.turbines = defaultTurbines();
    res.json({ok: true, state});
});

// ---------- Control panel (HTML) ----------
app.get('/control', (req, res) => {
    res.type('html').send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Turbine API Mock – Control Panel</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 2rem; }
  h1 { margin-bottom: .5rem; }
  section { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
  label { display: block; margin: .25rem 0; }
  input[type="text"], input[type="number"] { width: 320px; max-width: 100%; padding: .4rem; }
  button { padding: .5rem .9rem; cursor: pointer; }
  code { background: #f6f8fa; padding: .2rem .35rem; border-radius: 4px; }
  .row { display: flex; gap: 1rem; flex-wrap: wrap; align-items: end; }
  .status { background: #f6f8fa; padding: .5rem .75rem; border-radius: 6px; }
</style>
</head>
<body>
  <h1>Offshore Turbine API – Control Panel</h1>

  <section>
    <div class="row">
      <div>
        <strong>Bearer token:</strong> <code>Bearer ${AUTH_TOKEN}</code>
      </div>
      <div class="status" id="status"></div>
      <div><button id="refresh">Refresh status</button></div>
    </div>
  </section>

  <section>
    <h2>Scenarios</h2>
    <div class="row">
      <button data-s="normal">Normal</button>
      <button data-s="empty">Empty data</button>
      <button data-s="partial_turbines">Partial turbines</button>
      <button data-s="partial_properties">Partial properties</button>
      <button data-s="high_rpm">High RPM (70)</button>
      <button data-s="error_500">500 errors</button>
    </div>
  </section>

  <section>
    <h2>Timestamp</h2>
    <label>ISO 8601 timestamp (leave blank for "now")</label>
    <input type="text" id="ts" placeholder="2025-06-21T10:12:00Z" />
    <button id="apply-ts">Apply</button>
  </section>

  <section>
    <h2>Delay / Timeout</h2>
    <label>Global delay (ms) for all API responses</label>
    <input type="number" id="delay" min="0" step="100" value="0" />
    <button id="apply-delay">Apply</button>
    <p>Tip: set a large delay (e.g., 60000) to simulate a client timeout.</p>
  </section>

  <section>
    <button id="reset">Reset to defaults</button>
  </section>

<script>
async function refresh() {
  const r = await fetch('/__admin/state');
  const j = await r.json();
  document.getElementById('status').textContent =
    'scenario=' + j.scenario + ' | timestamp=' + j.timestamp + ' | delayMs=' + j.delayMs;
}
document.getElementById('refresh').onclick = refresh;
refresh();

document.querySelectorAll('button[data-s]').forEach(btn => {
  btn.onclick = async () => {
    await fetch('/__admin/scenario', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({scenario: btn.dataset.s})});
    refresh();
  }
});

document.getElementById('apply-ts').onclick = async () => {
  const ts = document.getElementById('ts').value;
  await fetch('/__admin/timestamp?timestamp=' + encodeURIComponent(ts), { method: 'POST' });
  refresh();
};

document.getElementById('apply-delay').onclick = async () => {
  const d = document.getElementById('delay').value || '0';
  await fetch('/__admin/delay?delayMs=' + encodeURIComponent(d), { method: 'POST' });
  refresh();
};

document.getElementById('reset').onclick = async () => {
  await fetch('/__admin/reset', { method: 'POST' });
  refresh();
};
</script>
</body>
</html>`);
});

// ---------- Boot ----------
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Mock listening on http://localhost:${PORT}  (control panel: /control)`);
    });
}

module.exports = {app, state, AUTH_TOKEN};
