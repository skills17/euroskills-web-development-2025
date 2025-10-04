const {
    api,
    adminSetScenario,
    login,
    bearer,
    sortAscByTs,
} = require("./_helpers");

describe("Log Retrieval & Search", () => {
    let aliceToken;

    beforeEach(async () => {
        const alice = await login("alice", "alice12345");
        aliceToken = alice.body.token;
        await adminSetScenario("normal");
    });

    test("Initial fetch & parse: alice token, GET /turbines/1/logs ⇒ 200; entries ≤ 1000, sorted oldest→newest, each entry has level,timestamp,message", async () => {
        const res = await api.get("/turbines/1/logs").set(bearer(aliceToken));
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("turbineId", 1);
        expect(Array.isArray(res.body.entries)).toBe(true);
        expect(res.body.entries.length).toBeGreaterThanOrEqual(1);
        expect(res.body.entries.length).toBeLessThanOrEqual(1000);

        const sorted = sortAscByTs(res.body.entries);
        expect(res.body.entries.map(e => e.timestamp)).toEqual(sorted.map(e => e.timestamp));

        for (const enty of res.body.entries) {
            expect(["info", "warning", "error"]).toContain(enty.level);
            expect(new Date(enty.timestamp).toString()).not.toBe("Invalid Date");
            expect(typeof enty.message).toBe("string");
        }
    });

    test("No duplicates on second fetch: GET /turbines/1/logs repeatedly ⇒ entry count unchanged; first entry timestamps identical", async () => {
        const res = await api.get("/turbines/1/logs").set(bearer(aliceToken));
        const baseline = res.body.entries;
        expect(baseline.length).toBeGreaterThanOrEqual(1);

        const resSecond = await api.get("/turbines/1/logs").set(bearer(aliceToken));
        expect(resSecond.status).toBe(200);
        expect(resSecond.body.entries.length).toBe(baseline.length);
        expect(resSecond.body.entries[0].timestamp).toBe(baseline[0].timestamp);
    });

    test("Level filter: GET /turbines/1/logs?levels=error,warning ⇒ every entry level ∈ {error,warning}", async () => {
        const res = await api
            .get("/turbines/1/logs")
            .query({levels: "error,warning"})
            .set(bearer(aliceToken));
        expect(res.status).toBe(200);
        expect(res.body.entries.length).toBeGreaterThan(0);
        for (const entry of res.body.entries) {
            expect(["error", "warning"]).toContain(entry.level);
            expect(entry.level).not.toBe("info");
        }
    });

    test('Message substring filter: GET /turbines/1/logs?message=wind ⇒ every message contains "wind" (case-insensitive)', async () => {
        const res = await api
            .get("/turbines/1/logs")
            .query({message: "wind"})
            .set(bearer(aliceToken));
        expect(res.status).toBe(200);
        expect(res.body.entries.length).toBeGreaterThan(0);
        for (const entry of res.body.entries) {
            expect(entry.message.toLowerCase()).toContain("wind");
        }
    });

    test("Upstream failure fallback: simulate 500 from external logs; request logs ⇒ 200 with cached entries", async () => {
        const res = await api.get("/turbines/1/logs").set(bearer(aliceToken));
        const baseline = res.body.entries;
        expect(baseline.length).toBeGreaterThanOrEqual(1);

        await adminSetScenario("error_500");

        const resCache = await api.get("/turbines/1/logs").set(bearer(aliceToken));
        expect(resCache.status).toBe(200);
        expect(resCache.body.entries.length).toBe(baseline.length);
        expect(resCache.body.entries[0].timestamp).toBe(baseline[0].timestamp);
    });
});
