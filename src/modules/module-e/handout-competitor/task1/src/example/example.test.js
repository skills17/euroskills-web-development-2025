// This file is not used in the project, it is just for demonstration purposes.
// This file shall not be marked.

const {sum} = require("./example");

describe("example", () => {
    test("adds 1 + 2 to equal 3", () => {
        expect(sum(1, 2)).toBe(3);
    });
});
