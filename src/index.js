const map = require("lodash/map");

module.exports = {
  foo() {
    map([], () => {
      return "whatever";
    });
    return 42;
  }
};
