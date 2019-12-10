module.exports = function(grunt) {
  grunt.initConfig({
    exec: {
      build: "npm run build",
      test: "npm run test"
    },
    watch: {
      build: {
        files: [
          "src/*.js",
          "src/**/*.js",
          "rollup.config.js",
          "babel.config.js"
        ],
        tasks: ["exec:build"],
        options: { atBegin: true }
      },
      test: {
        files: ["build/*.js", "tests/*.js", "tests/**/*.js", "jest.config.js"],
        tasks: ["exec:test"],
        options: { atBegin: true }
      }
    }
  });
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-exec");
};
