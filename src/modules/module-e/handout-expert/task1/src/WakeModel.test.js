const {WakeModel} = require("./WakeModel");

describe("WakeModel", () => {
    test("invalid upstream distance", () => {
        const m = new WakeModel(0.1);
        const v = m.effectiveSpeed(12, undefined, 220);
        expect(v).toBe(12);
    });

    test("no upstream -> free speed", () => {
        const m = new WakeModel(0.1);
        expect(m.effectiveSpeed(12, [], 220)).toBe(12);
    });

    test("single upstream reduces but stays positive", () => {
        const m = new WakeModel(0.1);
        const v = m.effectiveSpeed(12, [1000], 220);
        expect(v).toBeLessThan(12);
        expect(v).toBeGreaterThan(0);
        const expected = 12 * (1 - 0.1 * (220 / (1000 + 220)));
        expect(v).toBeCloseTo(expected, 6);
    });

    test("multiple upstream reduces further", () => {
        const m = new WakeModel(0.1);
        const one = m.effectiveSpeed(12, [1000], 220);
        const two = m.effectiveSpeed(12, [1000, 1000], 220);
        expect(two).toBeLessThan(one);
    });

    test("clamps to [0, free] under extreme deficits", () => {
        const m = new WakeModel(1);
        const v = m.effectiveSpeed(12, [-200, -200, -200], 220);
        expect(v).toBe(0);
    });
});
