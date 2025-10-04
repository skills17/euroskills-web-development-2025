const {clamp, sum, roundTo} = require("./NumberUtils");

describe("NumberUtils", () => {
    test("clamp bounds", () => {
        expect(clamp(-1, 0, 10)).toBe(0);
        expect(clamp(11, 0, 10)).toBe(10);
        expect(clamp(5, 0, 10)).toBe(5);
    });

    test("sum handles negatives and decimals", () => {
        expect(sum([1, 2, 3])).toBe(6);
        expect(sum([0, -1, 1])).toBe(0);
        expect(sum([0.1, 0.2])).toBeCloseTo(0.3, 10);
    });


    test("roundTo works with default and decimals", () => {
        expect(roundTo(1.23456, 3)).toBe(1.235);
        expect(roundTo(1.23456)).toBe(1);
        expect(roundTo(-1.5)).toBe(-1);
    });
});
