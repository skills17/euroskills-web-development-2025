const { state } = require('../state');
const { send } = require('../utils');

function overview(_req, res) {
    return send(res, 200, {            // !!!VULN-6 [A01 Broken Access Control]
        turbines: state.turbines,                 // Exposes internal state to any caller (minor)
        accounts: state.energyAccounts
    });
}

module.exports = { overview };
