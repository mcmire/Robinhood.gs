const requireBundle = require("./requireBundle");

const Robinhood = requireBundle();

describe("Robinhood", () => {
  describe(".foo", () => {
    it("does stuff", () => {
      expect(Robinhood.foo()).toEqual([4]);
    });
  });
});
