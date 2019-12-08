const fs = require("fs");
const path = require("path");
const { NodeVM } = require("vm2");

module.exports = function requireEntrypoint(sourceDirectoryPath, globalObject) {
  const entryPointPath = path.resolve(
    __dirname,
    sourceDirectoryPath,
    "index.js"
  );
  const code = fs.readFileSync(entryPointPath);
  const vm = new NodeVM({
    require: {
      external: {
        modules: ["lodash", ""]
      },
      root: [sourceDirectoryPath, path.resolve(__dirname, "../node_modules")]
    }
  });
  return vm.run(code, entryPointPath);
};
