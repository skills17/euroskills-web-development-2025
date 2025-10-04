const { state } = require('./state');

function send(res, status, obj) {
    res.writeHead(status || 200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',   // !!!VULN-2 [A05 Security Misconfiguration] Wild-card CORS
        'X-Powered-By': 'WindFarm/Raw'
    });
    res.end(JSON.stringify(obj));
}

function body(req, cb) {
    let data = '';
    req.on('data', c => data += c);          // (No size limit → potential DoS but minor)
    req.on('end', () => {
        try { cb(data ? JSON.parse(data) : {}); }
        catch (_) { cb({}); }
    });
}

function makeToken(id) {
    return Buffer
        .from(`${id}:${Date.now()}:${state.MASTER_KEY}`)
        .toString('base64');                   // !!!VULN-3 [A02 Cryptographic Failures] Predictable, unsigned token
}

function tokenId(req) {
    const hdr = req.headers['authorization'];
    if (!hdr) return null;
    try {
        const [id, ts, key] = Buffer
            .from(hdr.split(' ')[1], 'base64')
            .toString()
            .split(':');
        if (key === state.MASTER_KEY) return id;   // !!!VULN-4 [A01 Broken Access Control] No expiry / revocation
    } catch (_) {}
    return null;
}

module.exports = { send, body, makeToken, tokenId };
