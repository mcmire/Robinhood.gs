const nodeResolve = require("@rollup/plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const babel = require("rollup-plugin-babel");

module.exports = {
  input: "src/index.js",
  output: {
    file: "build/Robinhood.js",
    format: "iife",
    name: "window",
    extend: true,
    banner: `/*
 * Robinhood.gs
 *
 * Copyright (c) 2019 Elliot Winkler.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * Source: <https://github.com/mcmire/Robinhood.gs>
 *
 * Last updated 12/10/2019.
 */

//--- Change these to match your username/password -----------------------------

window.ROBINHOOD_USERNAME_ = "<redacted>";
window.ROBINHOOD_PASSWORD_ = "<redacted>";

//--- Don't change anything below this line! -----------------------------------
`
  },
  plugins: [nodeResolve({ preferBuiltins: false }), commonjs(), babel()]
};
