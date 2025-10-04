const {PowerCurve} = require("./PowerCurve");
const {clamp} = require("./NumberUtils");


class Turbine {
    /**
     * @param {string} id
     * @param {{x:number,y:number}} positionM
     * @param {number} rotorDiameterM
     * @param {number} ratedPowerMW
     * @param {number} cutIn
     * @param {number} ratedWind
     * @param {number} cutOut
     * @param {number} availability - 0..1
     */
    constructor(id, positionM, rotorDiameterM, ratedPowerMW, cutIn, ratedWind, cutOut, availability = 1) {
        this.id = id;
        this.position = positionM;
        this.rotorDiameterM = rotorDiameterM;
        this.curve = new PowerCurve(cutIn, ratedWind, cutOut, ratedPowerMW);
        this.availability = availability;
    }


    /**
     * @param {number} windSpeedMs
     * @param {number} losses - e.g., electrical losses 0..1
     * @returns {number} MW
     */
    netPower(windSpeedMs, losses = 0) {
        const raw = this.curve.powerAt(windSpeedMs);
        const net = raw * this.availability * (1 - losses);
        return clamp(net, 0, this.curve.ratedPowerMW);
    }
}


module.exports = {Turbine};
