const {
    api,
    expectProblem,
} = require("./_helpers");

describe("Organization", () => {
    test("API was implemented to follow spec: Base path — Correct base path", async () => {
        const res = await api.get("/turbines");
        expect(res.status).toBe(200);
    });

    test('API was implemented to follow spec: path extension — No trailing ".php" or required trailing "/"', async () => {
        const resPhp = await api.get("/turbines.php");
        expect(resPhp.status).not.toBe(200); // should NOT exist

        const resNoSlash = await api.get("/turbines"); // should work without "/"
        expect(resNoSlash.status).toBe(200);
    });

    test('API was implemented to follow spec: content type — success = "application/json", errors = "application/problem+json"', async () => {
        const ok = await api.post("/auth/login").send({ username: "alice", password: "alice12345" });
        expect(ok.status).toBe(200);
        expect(ok.headers["content-type"]).toMatch(/application\/json/i);

        const bad = await api.post("/auth/login").send({ username: "alice", password: "wrong" });
        expectProblem(bad, 401);
        expect(bad.headers["content-type"]).toMatch(/application\/problem\+json/i);
    });
});
