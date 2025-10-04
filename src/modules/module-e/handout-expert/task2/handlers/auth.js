const crypto = require('crypto');
const { state } = require('../state');
const { send, body, makeToken } = require('../utils');

function join(req, res) {
    return body(req, data => {
        const hash = crypto.createHash('md5')           // !!!VULN-5 [A02 Cryptographic Failures] Weak MD5 hash
            .update(data.key || '')
            .digest('hex');
        state.turbines.push({ id: data.id, passHash: hash });
        state.energyAccounts[data.id] = 5000;
        send(res, 200, { ok: true });
    });
}

function session(req, res) {
    return body(req, data => {
        const t = state.turbines.find(t => t.id === data.id);
        if (t && t.passHash === crypto.createHash('md5')  // MD5 reuse – see VULN-5
            .update(data.key || '')
            .digest('hex')) {
            return send(res, 200, { token: makeToken(data.id) });
        }
        return send(res, 403, { error: 'invalid credentials' });
    });
}

module.exports = { join, session };
