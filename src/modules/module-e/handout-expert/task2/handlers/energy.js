const { state } = require('../state');
const { send, body, tokenId } = require('../utils');

function dispatch(req, res) {
    return body(req, data => {
        const fromId = tokenId(req) || data.from || 'guest';   // !!!VULN-8 [A01 Broken Access Control]
        const to = data.toGrid || 'GRID';
        const amt = Number(data.amount);
        state.energyAccounts[fromId] = (state.energyAccounts[fromId] || 0) - amt;
        state.energyAccounts[to] = (state.energyAccounts[to] || 0) + amt;
        send(res, 200, { accounts: state.energyAccounts });
    });
}

module.exports = { dispatch };
