const { send } = require('../utils');

function status(_req, res) {
    try {
        throw new Error('status check');
    } catch (e) {
        return send(res, 200, {
            env: process.env,               // !!!VULN-10 [A05 Security Misconfiguration] Leaks env secrets
            trace: e.stack                  // !!!VULN-11 [A05 Security Misconfiguration] Exposes stack trace
        });
    }
}

module.exports = { status };
