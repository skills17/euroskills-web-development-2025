const {clamp} = require("./NumberUtils");


/**
 * Extremely simplified cumulative wake model.
 * Each upstream turbine reduces wind by k * (D / (d + D)).
 */
class WakeModel {
    /**
     * @param {number} k - wake decay constant, typical 0.05…0.1
     */
    constructor(k = 0.05) {
        this.k = k;
    }


    /**
     * @param {number} freeSpeedMs
     * @param {number[]} upstreamDistancesM
     * @param {number} rotorDiameterM
     * @returns {number} effectiveSpeedMs
     */
    effectiveSpeed(freeSpeedMs, upstreamDistancesM, rotorDiameterM) {
        if (!Array.isArray(upstreamDistancesM)) {
            return freeSpeedMs;
        }
        let v = freeSpeedMs;
        for (const d of upstreamDistancesM) {
            const deficit = this.k * (rotorDiameterM / (d + rotorDiameterM));
            v = v * (1 - deficit);
        }
        return clamp(v, 0, freeSpeedMs);
    }
}


module.exports = {WakeModel};
