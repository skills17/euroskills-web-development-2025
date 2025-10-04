const {
    api,
    login,
    bearer,
    expectProblem,
    problemTypeEndsWith,
} = require("./_helpers");

describe("Authentication & Access Control", () => {
    test('POST /auth/login with {"username":"alice","password":"alice12345"} ⇒ 200; token (≥32 chars) and role:"admin"', async () => {
        const res = await login("alice", "alice12345");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.token.length).toBeGreaterThanOrEqual(32);
        expect(res.body).toHaveProperty("role", "admin");
    });

    test("Login fails (bad password) ⇒ 401 and problem+json type ends /unauthorized", async () => {
        const res = await login("alice", "nope");
        expectProblem(res, 401);
        problemTypeEndsWith(res, "/unauthorized");
    });

    test('Token required on protected route: GET /alerts with no Authorization ⇒ 401', async () => {
        const res = await api.get("/alerts");
        expect(res.status).toBe(401);
    });

    test('Operator access allowed: bob token, then GET /alerts ⇒ 200', async () => {
        const bob = await login("bob", "bob12345");
        const res = await api.get("/alerts").set(bearer(bob.body.token));
        expect(res.status).toBe(200);
    });

    test('Operator access denied (role escalation): bob token on POST /auth/assign-role ⇒ 403', async () => {
        const bob = await login("bob", "bob12345");
        const res = await api
            .post("/auth/assign-role")
            .set(bearer(bob.body.token))
            .send({ username: "user", role: "operator" });
        expect(res.status).toBe(403);
    });

    test('Admin assigns role: alice token, POST /auth/assign-role {"username":"user","role":"operator"} ⇒ 204 and login as user returns operator role', async () => {
        const alice = await login("alice", "alice12345");
        const res = await api
            .post("/auth/assign-role")
            .set(bearer(alice.body.token))
            .send({ username: "user", role: "operator" });
        expect(res.status).toBe(204);

        const userLogin = await login("user", "user12345");
        expect(userLogin.status).toBe(200);
        expect(userLogin.body.role).toBe("operator");
    });

    test("Admin cannot drop own admin: alice tries role=operator for alice ⇒ 409", async () => {
        const alice = await login("alice", "alice12345");
        const res = await api
            .post("/auth/assign-role")
            .set(bearer(alice.body.token))
            .send({ username: "alice", role: "operator" });
        expectProblem(res, 409);
    });
});
