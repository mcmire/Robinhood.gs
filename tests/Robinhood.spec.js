const requireEntrypoint = require("./requireEntrypoint");

const Robinhood = requireEntrypoint("../src");

describe("Robinhood", () => {
  describe(".foo", () => {
    it("does stuff", () => {
      expect(Robinhood.foo()).toEqual(42);
    });
  });
});
