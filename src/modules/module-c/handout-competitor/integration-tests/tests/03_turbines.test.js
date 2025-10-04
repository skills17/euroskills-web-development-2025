const {
    api,
    adminReset,
    adminSetTimestamp,
    adminSetScenario,
    adminSetDelay,
    login,
    assertTurbineSummary,
    assertFreshnessObject,
    assertLiveStatusShape,
    DELAY_MS,
} = require("./_helpers");

describe("Turbine Data & Freshness", () => {
    beforeEach(async () => {
        await adminReset();
        await adminSetTimestamp("2025-06-21T10:12:00Z");
        await adminSetScenario("normal");
        await adminSetDelay(0);
    });

    test("List turbines public: GET /turbines ⇒ 200; items include id,name,location,status", async () => {
        const res = await api.get("/turbines");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(3);
        assertTurbineSummary(res.body[0]);
    });

    test('Live status: Upstream healthy; GET /turbines/1/status ⇒ freshness:"live" at root and for every property', async () => {
        await adminSetDelay(0);
        const res = await api.get("/turbines/1/status");
        expect(res.status).toBe(200);
        assertLiveStatusShape(res.body);
    });

    test('Cached fallback: Simulate upstream timeout; GET /turbines/1/status ⇒ freshness:"cached"; values unchanged from previous live call', async () => {
        await adminSetDelay(0);
        const live = await api.get("/turbines/1/status");
        expect(live.status).toBe(200);
        const prev = live.body;

        await adminSetDelay(DELAY_MS); // force the backend to time out on upstream
        const cached = await api.get("/turbines/1/status");
        expect(cached.status).toBe(200);
        assertFreshnessObject(cached.body, "cached");

        // values unchanged
        const keys = ["rpm", "powerMw", "yaw", "pitch", "temperature", "status"];
        keys.forEach((k) => {
            const a = prev[k]?.value ?? null;
            const b = cached.body[k]?.value ?? null;
            expect(b).toEqual(a);
            expect(cached.body[k]?.freshness).toBe("cached");
        });
    });

    test('Missing property handling: Upstream returns temperature:null; GET /turbines/1/status ⇒ temperature.freshness:"missing" and value:null', async () => {
        await adminSetScenario("partial_properties");
        const res = await api.get("/turbines/1/status");
        expect(res.status).toBe(200);
        expect(res.body.rpm).toBeDefined();
        expect(res.body.rpm.freshness).toBe("missing");
        expect(res.body.rpm.value).toBeNull();
    });

    test("Unknown turbine: GET /turbines/999/status ⇒ 404", async () => {
        const res = await api.get("/turbines/999/status");
        expect(res.status).toBe(404);
    });
});
