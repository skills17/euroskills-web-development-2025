const { state } = require('../state');
const { send } = require('../utils');

function overview(_req, res) {
    return send(res, 200, {
        turbines: state.turbines,
        accounts: state.energyAccounts
    });
}

module.exports = { overview };
