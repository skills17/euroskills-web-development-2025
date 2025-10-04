const {ExportLimiter} = require("./ExportLimiter");

describe("ExportLimiter", () => {
    test("returns copy when total is zero", () => {
        const lim = new ExportLimiter(10);
        const input = {A: 0, B: 0};
        const out = lim.distribute(input);
        expect(out).toEqual(input);
        expect(out).not.toBe(input);
    });

    test("passes through when under limit", () => {
        const lim = new ExportLimiter(10);
        const out = lim.distribute({A: 4, B: 5});
        expect(out).toEqual({A: 4, B: 5});
    });

    test("scales when exactly at limit (>= quirk) and rounds to 3dp", () => {
        const lim = new ExportLimiter(15);
        const out = lim.distribute({A: 7.12345, B: 7.87655}); // total = 15
        expect(out).toEqual({A: 7.123, B: 7.877});
    });

    test("scales proportionally when over limit", () => {
        const lim = new ExportLimiter(10);
        const out = lim.distribute({A: 9, B: 6}); // total 15 -> scale 2/3
        expect(out.A / out.B).toBeCloseTo(9 / 6, 6);
        expect(out.A + out.B).toBeCloseTo(10, 2); // rounding to 3dp may induce tiny error
    });
});
