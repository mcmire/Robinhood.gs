import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";

export default {
  input: "src/index.js",
  output: {
    file: "build/Robinhood.js",
    format: "iife",
    name: "Robinhood",
    banner: "/* This is the banner we want */"
  },
  plugins: [
    nodeResolve({
      preferBuiltins: false
    }),
    babel({
      exclude: "node_modules/**",
      presets: [
        [
          "@babel/preset-env",
          {
            useBuiltIns: "usage",
            modules: false,
            corejs: 3,
            ignoreBrowserslistConfig: true
          }
        ]
      ]
    }),
    commonjs()
  ]
};
