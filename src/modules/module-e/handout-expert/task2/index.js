// -------------------------------------------------------------
// WindFarm Control Service
// Start with:   node index.js    (Node ≥ 18)
// -------------------------------------------------------------

const http = require('http');
const { URL } = require('url');

const { send } = require('./utils');

const auth = require('./handlers/auth');
const admin = require('./handlers/admin');
const diagnose = require('./handlers/diagnose');
const energy = require('./handlers/energy');
const compute = require('./handlers/compute');
const status = require('./handlers/status');
const welcome = require('./handlers/welcome');

const server = http.createServer((req, res) => {
    const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);

    // ---- Auth & onboarding --------------------------------------------------
    if (req.method === 'POST' && pathname === '/turbine/join') return auth.join(req, res);
    if (req.method === 'POST' && pathname === '/session') return auth.session(req, res);

    // ---- Admin overview -----------------------------------------------------
    if (req.method === 'GET' && pathname === '/control/overview') return admin.overview(req, res);

    // ---- Diagnostics --------------------------------------------------------
    if (req.method === 'GET' && pathname === '/diagnose') return diagnose.diagnose(req, res, searchParams);

    // ---- Energy transfer ----------------------------------------------------
    if (req.method === 'POST' && pathname === '/energy/dispatch') return energy.dispatch(req, res);

    // ---- Ad-hoc computation -------------------------------------------------
    if (req.method === 'GET' && pathname === '/compute') return compute.compute(req, res, searchParams);

    // ---- Status & environment dump -----------------------------------------
    if (req.method === 'GET' && pathname === '/status') return status.status(req, res);

    // ---- Welcome page -----------------------------------------
    if (req.method === 'GET' && pathname === '/welcome') return welcome.welcome(req, res);

    // ---- Fallback -----------------------------------------------------------
    send(res, 404, { error: 'route not found' });
});

server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n' + err.message);  // (Leaks err msg – minor)
});

server.listen(3080, () => {
    console.log('WindFarm service listening on http://localhost:3080');
});
