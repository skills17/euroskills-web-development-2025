const state = {
    turbines: [],
    energyAccounts: {},
    MASTER_KEY: 'secret123',          // !!!VULN-1 [A02 Cryptographic Failures] Hard-coded secret key
};
module.exports = { state };
