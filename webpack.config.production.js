const config = require("./webpack.config.common");
const webpackMerge = require("webpack-merge");

module.exports = webpackMerge(config, {
  mode: "production",
  optimization: {
    concatenateModules: false
  }
});
