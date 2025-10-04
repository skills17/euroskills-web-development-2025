const request = require('supertest');
const { app, state, AUTH_TOKEN } = require('./server');

const auth = { Authorization: `Bearer ${AUTH_TOKEN}` };

describe('External Turbine API Mock', () => {
    beforeEach(async () => {
        await request(app).post('/__admin/reset');
    });

    test('401 when missing bearer token', async () => {
        const res = await request(app).get('/turbines');
        expect(res.status).toBe(401);
    });

    test('GET /turbines returns timestamp and data[]', async () => {
        const res = await request(app).get('/turbines').set(auth);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('timestamp');
        expect(Array.isArray(res.body.data)).toBe(true);
        // shape check of an item
        const t = res.body.data[0];
        expect(t).toHaveProperty('id');
        expect(t).toHaveProperty('name');
        expect(t).toHaveProperty('location');
        expect(t).toHaveProperty('status');
    });

    test('partial_turbines scenario reduces data size', async () => {
        await request(app).post('/__admin/scenario').send({ scenario: 'partial_turbines' });
        const res = await request(app).get('/turbines').set(auth);
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(2);
    });

    test('partial_properties sets nullable fields to null for some items', async () => {
        await request(app).post('/__admin/scenario').send({ scenario: 'partial_properties' });
        const res = await request(app).get('/turbines').set(auth);
        expect(res.status).toBe(200);
        const foundNull = res.body.data.some(
            (t) => t.temperature === null || t.rpm === null || t.powerMw === null || t.yaw === null || t.pitch === null
        );
        expect(foundNull).toBe(true);
    });

    test('empty scenario returns empty array', async () => {
        await request(app).post('/__admin/scenario').send({ scenario: 'empty' });
        const res = await request(app).get('/turbines').set(auth);
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });

    test('error_500 scenario returns 500 on /turbines', async () => {
        await request(app).post('/__admin/scenario').send({ scenario: 'error_500' });
        const res = await request(app).get('/turbines').set(auth);
        expect(res.status).toBe(500);
    });

    test('GET /turbines/:id/logs returns text/plain', async () => {
        const res = await request(app).get('/turbines/1/logs').set(auth);
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/text\/plain/);
        expect(res.text).toMatch(/Turbine A1/);
    });

    test('404 logs when turbine not found', async () => {
        const res = await request(app).get('/turbines/999/logs').set(auth);
        expect(res.status).toBe(404);
    });

    test('global delay applies', async () => {
        await request(app).post('/__admin/delay').send({ delayMs: 200 });
        const start = Date.now();
        const res = await request(app).get('/turbines').set(auth);
        expect(res.status).toBe(200);
        expect(Date.now() - start).toBeGreaterThanOrEqual(190);
    });
});
