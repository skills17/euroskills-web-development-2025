module.exports = {
    testEnvironment: "node",
    testTimeout: 60000,
    setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],
    maxConcurrency: 1,
};
