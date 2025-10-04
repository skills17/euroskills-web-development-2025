function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
}


function sum(arr) {
    return arr.reduce((a, b) => a + b, 0);
}


function roundTo(n, decimals = 0) {
    const f = Math.pow(10, decimals);
    return Math.round(n * f) / f;
}


module.exports = {clamp, sum, roundTo};
