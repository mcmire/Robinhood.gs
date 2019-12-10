module.exports = api => {
  const isTest = api.env("test");
  return {
    exclude: "node_modules/**",
    presets: [
      [
        "@babel/preset-env",
        {
          useBuiltIns: "entry",
          modules: isTest ? "cjs" : false,
          corejs: 3,
          loose: true
        }
      ]
    ],
    plugins: ["@babel/plugin-proposal-export-default-from"]
  };
};
