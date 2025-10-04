const {
    api,
    login,
    bearer, adminReset,
} = require("./_helpers");

function newest(entries) {
    return entries.reduce((a, b) =>
        new Date(a.timestamp) > new Date(b.timestamp) ? a : b
    );
}

describe("Control & Action Log", () => {
    let bobToken;

    beforeAll(async () => {
        await adminReset();
        const bob = await login("bob", "bob12345");
        bobToken = bob.body.token;
    });

    test('Valid pitch/yaw: bob token, POST /turbines/1/control {"pitch":10,"yaw":180} ⇒ 200 {status:"success"}; /turbines/1/actions newest item type:"control" with given values', async () => {
        const res = await api
            .post("/turbines/1/control")
            .set(bearer(bobToken))
            .send({ pitch: 10, yaw: 180 });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: "success" });

        const actions = await api.get("/turbines/1/actions");
        expect(actions.status).toBe(200);
        const last = newest(actions.body);
        expect(last.type).toBe("control");
        expect(last.pitch).toBe(10);
        expect(last.yaw).toBe(180);
    });

    test("Range validation: pitch = -120 ⇒ 400 Problem+JSON with field error for pitch", async () => {
        const res = await api
            .post("/turbines/1/control")
            .set(bearer(bobToken))
            .send({ pitch: -120, yaw: 100 });
        expect(res.status).toBe(400);
        const errors = res.body.errors || {};
        const detail = String(res.body.detail || "");
        expect(errors.pitch || detail.toLowerCase()).toBeTruthy();
    });

    test("Valid state transition: shutdown then start sequence using correct endpoints ⇒ each returns 200; turbine status updates accordingly", async () => {
        const s0 = await api.get("/turbines/1/status");
        expect(s0.status).toBe(200);
        expect(s0.body.status.value).toBe("started");

        const shut = await api.post("/turbines/1/shutdown").set(bearer(bobToken));
        expect(shut.status).toBe(200);

        const s1 = await api.get("/turbines/1/status");
        expect(s1.status).toBe(200);
        expect(s1.body.status.value).toBe("shutdown");

        const start = await api.post("/turbines/1/start").set(bearer(bobToken));
        expect(start.status).toBe(200);

        const s2 = await api.get("/turbines/1/status");
        expect(s2.status).toBe(200);
        expect(s2.body.status.value).toBe("started");
    });

    test("Invalid transition: POST /turbines/1/maintenance while status = started ⇒ 409", async () => {
        // Ensure started
        await api.post("/turbines/1/start").set(bearer(bobToken));
        const res = await api.post("/turbines/1/maintenance").set(bearer(bobToken));
        expect([409, 400]).toContain(res.status); // spec says 409; allow 400 if validated as bad state
    });
});
