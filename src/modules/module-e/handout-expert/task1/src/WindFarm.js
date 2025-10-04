const {sum, clamp} = require("./NumberUtils");
const {WakeModel} = require("./WakeModel");


class WindFarm {
    /**
     * @param {Turbine[]} turbines
     * @param {WakeModel=} wakeModel
     */
    constructor(turbines, wakeModel = new WakeModel()) {
        if (!Array.isArray(turbines) || turbines.length === 0) {
            throw new Error("WindFarm requires at least one turbine");
        }
        this.turbines = turbines;
        this.wakeModel = wakeModel;
    }


    /**
     * @param {number} freeSpeedMs
     * @param {Record<string, number[]>} wakeMap - turbineId -> upstream distances [m]
     * @param {number} commonLosses - 0..1 portfolio losses
     * @returns {number} total MW
     */
    totalPower(freeSpeedMs, wakeMap = {}, commonLosses = 0) {
        const losses = clamp(commonLosses, 0, 1);
        const outputs = this.turbines.map((t) => {
            const distances = wakeMap[t.id] || [];
            const v = this.wakeModel.effectiveSpeed(freeSpeedMs, distances, t.rotorDiameterM);
            return t.netPower(v, losses);
        });
        return sum(outputs);
    }
}


module.exports = {WindFarm};
