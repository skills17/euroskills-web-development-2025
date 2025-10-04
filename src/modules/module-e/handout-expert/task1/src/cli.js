const {Turbine} = require("./Turbine");
const {WindFarm} = require("./WindFarm");
const {ExportLimiter} = require("./ExportLimiter");

// Do not cover this file in tests.

// Minimal demo scenario

const T1 = new Turbine("T1", {x: 0, y: 0}, 220, 14, 3, 12, 25, 0.98);
const T2 = new Turbine("T2", {x: 1000, y: 0}, 220, 14, 3, 12, 25, 0.97);
const T3 = new Turbine("T3", {x: 2000, y: 0}, 220, 14, 3, 12, 25, 0.99);


const farm = new WindFarm([T1, T2, T3]);


const freeSpeed = 11; // m/s
const wakeMap = {T1: [], T2: [1000], T3: [1000, 1000]};
const total = farm.totalPower(freeSpeed, wakeMap, 0.06);


const limiter = new ExportLimiter(35); // MW cable limit
const setpoints = limiter.distribute({T1: 12, T2: 12, T3: 12});


console.log(`Estimated farm output at ${freeSpeed} m/s: ${total.toFixed(2)} MW`);
console.log(`Setpoints after export limit: ${JSON.stringify(setpoints)}`);
