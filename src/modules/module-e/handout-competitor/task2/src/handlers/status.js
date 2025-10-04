const { send } = require('../utils');

function status(_req, res) {
    try {
        throw new Error('status check');
    } catch (e) {
        return send(res, 200, {
            env: process.env,
            trace: e.stack
        });
    }
}

module.exports = { status };
