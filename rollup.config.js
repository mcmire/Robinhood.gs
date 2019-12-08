const nodeResolve = require("@rollup/plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const babel = require("rollup-plugin-babel");

module.exports = {
  input: "src/index.js",
  output: {
    file: "build/Robinhood.js",
    format: "iife",
    name: "Robinhood",
    banner: "/* This is the banner we want */"
  },
  plugins: [nodeResolve({ preferBuiltins: false }), babel(), commonjs()]
};
