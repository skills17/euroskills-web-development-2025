const request = require("supertest");
const fs = require("fs");
const path = require("path");

require('dotenv').config({quiet: true});

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:8080";
const MOCK_URL = process.env.TEST_MOCK_URL || "http://localhost:4000";
const DELAY_MS = Number(process.env.DELAY_MS || 10000);

const api = request(BASE_URL);

async function admin(pathname, init = {}) {
    const url = new URL(pathname, MOCK_URL).toString();
    const res = await fetch(url, {
        method: init.method || "GET",
        headers: init.headers || {},
        body: init.body ? JSON.stringify(init.body) : undefined,
    });
    if (!res.ok && res.status !== 204) {
        const text = await res.text().catch(() => "");
        throw new Error(`Admin call failed ${res.status} ${url}: ${text}`);
    }
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : res.text();
}

async function adminReset() {
    await admin("/__admin/reset", {method: "POST"});
}

async function adminSetTimestamp(ts) {
    const qs = ts ? `?timestamp=${encodeURIComponent(ts)}` : "?timestamp=";
    await admin(`/__admin/timestamp${qs}`, {method: "POST"});
}

async function adminSetScenario(scenario) {
    await admin("/__admin/scenario", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: {scenario},
    });
}

async function adminSetDelay(ms) {
    await admin(`/__admin/delay?delayMs=${ms}`, {method: "POST"});
}

async function login(username, password) {
    return await api.post("/auth/login").send({username, password});
}

async function competitorSolutionHealth() {
    try {
        return api.get("/");
    } catch (err) {
        throw new Error(`Competitor solution with url="${BASE_URL}" failed: ${JSON.stringify(err)}`);
    }
}

async function mockHealth() {
    const url = new URL('/__health', MOCK_URL).toString();
    const res = await fetch(url);
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Mock health call failed ${res.status} ${url}: ${text}`);
    }
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : res.text();
}

function bearer(token) {
    return {Authorization: `Bearer ${token}`};
}

function expectProblem(res, status) {
    expect(res.status).toBe(status);
    expect(res.body).toHaveProperty("type");
    expect(res.body).toHaveProperty("title");
    expect(res.body).toHaveProperty("status", status);
}

function problemTypeEndsWith(res, suffix) {
    expect(String(res.body.type || "")).toMatch(new RegExp(`${suffix}$`));
}

function assertTurbineSummary(item) {
    expect(item).toHaveProperty("id");
    expect(item).toHaveProperty("name");
    expect(item).toHaveProperty("location");
    expect(item.location).toHaveProperty("lat");
    expect(item.location).toHaveProperty("lng");
    expect(item).toHaveProperty("status");
}

function assertFreshnessObject(obj, expected) {
    expect(obj).toHaveProperty("freshness", expected);
    expect(new Date(obj.lastUpdated).toString()).not.toBe("Invalid Date");
}

function assertLiveStatusShape(body) {
    assertFreshnessObject(body, "live");
    const keys = ["rpm", "powerMw", "yaw", "pitch", "temperature", "status"];
    keys.forEach((k) => assertFreshnessObject(body[k], "live"));
}

function sortAscByTs(entries) {
    return [...entries].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
}

module.exports = {
    api,
    adminReset,
    adminSetTimestamp,
    adminSetScenario,
    adminSetDelay,
    login,
    bearer,
    competitorSolutionHealth,
    mockHealth,
    expectProblem,
    problemTypeEndsWith,
    assertTurbineSummary,
    assertFreshnessObject,
    assertLiveStatusShape,
    sortAscByTs,
    DELAY_MS,
};
