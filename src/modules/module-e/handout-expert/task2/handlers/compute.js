const { send } = require('../utils');

function compute(_req, res, searchParams) {
    const expr = searchParams.get('expr') || '1+1';
    try {
        const result = eval(expr);          // !!!VULN-9 [A03 Injection] Remote code execution via eval
        return send(res, 200, { result });
    } catch (e) {
        return send(res, 500, { error: e.message });
    }
}

module.exports = { compute };
