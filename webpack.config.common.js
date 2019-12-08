const path = require("path");
const ClosurePlugin = require("closure-webpack-plugin");
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");

module.exports = {
  entry: {
    Robinhood: "./src/index.js"
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build"),
    libraryTarget: "umd"
  },
  optimization: {
    moduleIds: "named",
    minimizer: [
      new ClosurePlugin(
        {
          //mode: "AGGRESSIVE_BUNDLE"
          mode: "STANDARD"
        },
        {
          //compilation_level: "ADVANCED",
          formatting: "PRETTY_PRINT",
          language_in: "ECMASCRIPT_2019",
          //language_out: "ECMASCRIPT3"
          language_out: "ECMASCRIPT_2019"
        }
      )
    ]
  },
  plugins: [new LodashModuleReplacementPlugin()]
};
