import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
//import compiler from "@ampproject/rollup-plugin-closure-compiler";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.js",
  output: {
    file: "build/Robinhood.js",
    format: "iife",
    name: "Robinhood",
    banner: "/* This is the banner we want */" //,
    //globals: { "lodash-es": "_", lodash: "_", underscore: "_" }
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
            //targets: "last 2 versions",
            targets: { ie: 6 },
            useBuiltIns: "usage",
            modules: false,
            corejs: 3,
            ignoreBrowserslistConfig: true
          }
        ]
      ]
    }),
    commonjs()
    /*
    terser({
      compress: false,
      mangle: false,
      keep_fnames: true,
      ie8: true,
      output: {
        beautify: true
        //comments: "all",
        //braces: true
      }
    })
    */
    //compiler({
    //compilation_level: "SIMPLE",
    ////assume_function_wrapper: true,
    //formatting: "PRETTY_PRINT"
    //})
  ]
};
