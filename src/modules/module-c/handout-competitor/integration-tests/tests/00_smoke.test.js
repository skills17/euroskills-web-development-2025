const {
    competitorSolutionHealth,
    mockHealth,
} = require("./_helpers");

describe("Smoke", () => {
    test('Can reach competitor solution', async () => {
        await competitorSolutionHealth();
    });

    test("Can reach mock", async () => {
        const res = await mockHealth();
        expect(res.status).toBe("healthy");
    });
});
