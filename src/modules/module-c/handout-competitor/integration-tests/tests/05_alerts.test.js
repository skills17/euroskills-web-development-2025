const {
    api,
    adminReset,
    adminSetDelay,
    login,
    bearer,
    adminSetScenario,
} = require("./_helpers");

describe("Alerts Lifecycle", () => {
    let bobToken;

    beforeEach(async () => {
        await adminReset();
        await adminSetDelay(0);
        const bob = await login("bob", "bob12345");
        bobToken = bob.body.token;
    });

    test('High-RPM alert fires: mock rpm = 70; fetch status ⇒ /alerts contains alert type:"HighRPM", status:"firing"', async () => {
        await adminSetScenario('high_rpm');
        await api.get("/turbines/1/status"); // evaluation point
        const res = await api.get("/alerts").set(bearer(bobToken));
        expect(res.status).toBe(200);
        const found = res.body.find((a) => a.type === "HighRPM");
        expect(found).toBeTruthy();
        expect(found.status).toBe("firing");
    });

    test("Alert deduplication: repeat fetch while rpm still mocked to be 70 ⇒ still one HighRPM alert record (no duplicates)", async () => {
        await adminSetScenario('high_rpm');
        await api.get("/turbines/1/status");
        await api.get("/turbines/1/status");

        const res = await api.get("/alerts").set(bearer(bobToken));
        const all = res.body.filter((a) => a.type === "HighRPM");
        expect(all.length).toBe(1);
    });

    test('Alert resolves: rpm drops to 50; fetch status ⇒ alert for HighRPM with status:"resolved"', async () => {
        await adminSetScenario('high_rpm');
        await api.get("/turbines/1/status"); // trigger firing

        await adminSetScenario('normal'); // rpm back to normal
        await api.get("/turbines/1/status");

        const res = await api.get("/alerts").set(bearer(bobToken));
        // Accept either: alert toggled to resolved or separate record visible
        const resolved = res.body.find((a) => a.type === "HighRPM" && a.status === "resolved");
        expect(resolved).toBeTruthy();
    });

    test('Acknowledge: POST /alerts/{id}/ack as bob ⇒ 200 {status:"acknowledged"}; alert field acknowledged:"acknowledged"', async () => {
        // Re-trigger to ensure an active alert exists to ack
        await adminSetScenario('high_rpm');
        await api.get("/turbines/1/status");
        const list = await api.get("/alerts").set(bearer(bobToken));
        const firing = list.body.find((a) => a.type === "HighRPM" && a.status === "firing");
        expect(firing).toBeTruthy();

        const ack = await api.post(`/alerts/${firing.id}/ack`).set(bearer(bobToken));
        expect(ack.status).toBe(200);
        expect(ack.body).toEqual({ status: "acknowledged" });

        const after = await api.get("/alerts").set(bearer(bobToken));
        const updated = after.body.find((a) => a.id === firing.id);
        expect(updated).toBeTruthy();
        expect(updated.acknowledged).toBe("acknowledged");
    });
});
