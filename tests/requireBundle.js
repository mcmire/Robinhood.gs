const fs = require("fs");
const path = require("path");

const { NodeVM } = require("vm2");

const buildDirectoryPath = path.resolve(__dirname, "../build");

module.exports = function requireBundle() {
  const bundleFilePath = path.join(buildDirectoryPath, "Robinhood.js");
  const code = fs.readFileSync(bundleFilePath);
  const vm = new NodeVM();
  return vm.run(code + "\n\nmodule.exports = Robinhood;");
};
