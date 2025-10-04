const { exec } = require('child_process');
const { send } = require('../utils');

function diagnose(_req, res, searchParams) {
    const ip = searchParams.get('ip') || '127.0.0.1';
    exec(`ping -c 1 ${ip}`, (err, stdout, stderr) => {
        send(res, 200, { output: stdout + stderr });
    });
}

module.exports = { diagnose };
