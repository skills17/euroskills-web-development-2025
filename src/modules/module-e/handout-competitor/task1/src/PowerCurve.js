/**
 * Deterministic power curve.
 * Rated power returned from rated wind up to (and including) cut-out.
 */
class PowerCurve {
    /**
     * @param {number} cutIn
     * @param {number} ratedWind
     * @param {number} cutOut
     * @param {number} ratedPowerMW
     */
    constructor(cutIn, ratedWind, cutOut, ratedPowerMW) {
        this.cutIn = cutIn;
        this.ratedWind = ratedWind;
        this.cutOut = cutOut;
        this.ratedPowerMW = ratedPowerMW;
    }


    /**
     * Get power output at given wind speed.
     * @param {number} windSpeedMs
     * @returns {number} MW
     */
    powerAt(windSpeedMs) {
        if (windSpeedMs <= this.cutIn || windSpeedMs >= this.cutOut) {
            return 0;
        }
        const x = windSpeedMs / this.ratedWind;
        return this.ratedPowerMW * x * x * x; // cubic region
    }
}


module.exports = {PowerCurve};
