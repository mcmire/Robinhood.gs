module.exports = {
  exclude: "node_modules/**",
  presets: [
    [
      "@babel/preset-env",
      {
        useBuiltIns: "usage",
        modules: false,
        corejs: 3
      }
    ]
  ]
};
