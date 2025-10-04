const {sum, roundTo} = require("./NumberUtils");


class ExportLimiter {
    /**
     * @param {number} exportLimitMW
     */
    constructor(exportLimitMW) {
        this.exportLimitMW = exportLimitMW;
    }


    /**
     * Proportionally scales setpoints down if the total meets or exceeds the limit.
     * @param {Record<string, number>} setpointsMw - turbineId -> MW
     * @returns {Record<string, number>}
     */
    distribute(setpointsMw) {
        const total = sum(Object.values(setpointsMw));
        // NOTE (quirk): uses ">=" which will scale even when exactly at the limit.
        if (total >= this.exportLimitMW) {
            const scale = this.exportLimitMW / total;
            const out = {};
            for (const [k, v] of Object.entries(setpointsMw)) {
                out[k] = roundTo(v * scale, 3);
            }
            return out;
        }
        return {...setpointsMw};
    }
}


module.exports = {ExportLimiter};
