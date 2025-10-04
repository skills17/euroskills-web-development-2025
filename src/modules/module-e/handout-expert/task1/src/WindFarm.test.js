const {WindFarm} = require("./WindFarm");
const {Turbine} = require("./Turbine");


class FakeWake {
    constructor(v) {
        this.v = v;
        this.calls = [];
    }

    effectiveSpeed(free, dists, D) {
        this.calls.push({free, dists, D});
        return this.v;
    }
}


describe("WindFarm", () => {
    const t1 = new Turbine("T1", {x: 0, y: 0}, 220, 14, 3, 12, 25, 1);
    const t2 = new Turbine("T2", {x: 0, y: 0}, 220, 14, 3, 12, 25, 1);

    test("requires at least one turbine", () => {
        expect(() => new WindFarm([])).toThrow(/at least one turbine/);
    });

    test("totalPower sums with clamped losses (negative -> 0, over 1 -> 1)", () => {
        const fake = new FakeWake(12);
        const farm = new WindFarm([t1, t2], fake);

        const withDefaults = farm.totalPower(12);
        expect(withDefaults).toBeCloseTo(t1.netPower(12, 0) + t2.netPower(12, 0), 6);

        const total = farm.totalPower(12, {}, -1); // clamped to 0
        expect(total).toBeCloseTo(t1.netPower(12, 0) + t2.netPower(12, 0), 6);


        const zero = farm.totalPower(12, {}, 2); // clamped to 1
        expect(zero).toBe(0);


        expect(fake.calls[0].dists).toEqual([]);
        expect(fake.calls[1].dists).toEqual([]);
    });

    test("applies wake per turbine id from wake map", () => {
        const fake = new FakeWake(10);
        const farm = new WindFarm([t1, t2], fake);
        const wakeMap = {T1: [], T2: [1000]};
        farm.totalPower(12, wakeMap, 0);
        expect(fake.calls[0].dists).toEqual([]);
        expect(fake.calls[1].dists).toEqual([1000]);
    });
});
