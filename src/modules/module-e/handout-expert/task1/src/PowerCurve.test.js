const {PowerCurve} = require("./PowerCurve");

describe("PowerCurve", () => {
    const curve = new PowerCurve(3, 12, 25, 14);

    test("below cut-in", () => {
        expect(curve.powerAt(2.9)).toBe(0);
    });

    test("at cut-in", () => {
        expect(curve.powerAt(3)).toBe(0);
    });

    test("at cut-out", () => {
        expect(curve.powerAt(25)).toBe(0);
    });

    test("cubic region between cut-in and rated", () => {
        const ws = 7.5;
        const expected = 14 * Math.pow(ws / 12, 3);
        expect(curve.powerAt(ws)).toBeCloseTo(expected, 10);
    });

    test("at rated = rated power", () => {
        expect(curve.powerAt(12)).toBe(14);
    });

    test("above cut-out = 0", () => {
        expect(curve.powerAt(25.1)).toBe(0);
    });
});
