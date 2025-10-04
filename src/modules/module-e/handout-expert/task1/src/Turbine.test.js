const {Turbine} = require("./Turbine");

describe("Turbine", () => {
    const t = new Turbine("T", {x: 0, y: 0}, 220, 14, 3, 12, 25, 0.5);

    test("with default availability and losses", () => {
        const tDefault = new Turbine("T", {x: 0, y: 0}, 220, 14, 3, 12, 25);
        expect(t.netPower(12)).toBeCloseTo(14 * 0.5, 6);
    });

    test("netPower at rated applies availability", () => {
        expect(t.netPower(12, 0)).toBeCloseTo(14 * 0.5, 6);
    });

    test("losses reduce output and clamp at 0 for >100% losses", () => {
        expect(t.netPower(12, 0.2)).toBeCloseTo(14 * 0.5 * 0.8, 6);
        expect(t.netPower(12, 2)).toBe(0);
    });

    test("below cut-in and above cut-out give 0", () => {
        expect(t.netPower(2, 0)).toBe(0);
        expect(t.netPower(26, 0)).toBe(0);
    });
});
