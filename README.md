# Robinhood.gs [![CI status badge][badge]][actions]

[badge]: https://img.shields.io/github/workflow/status/mcmire/Robinhood.gs/Robinhood.gs
[actions]: https://github.com/mcmire/Robinhood.gs/actions

A set of Google Apps Script functions that allow you to insert data from your
Robinhood account into a Google spreadsheet.

## Usage

*(More to come later!)*

## Development

* `bin/setup` to install dependencies
* `npm run start-dev` to run the Rollup watcher
* `npm run start-test` to run the Jest watcher
* `npm run push` to deploy everything to Google Apps

## Prior art

A lot of the code here is taken from a set of [Google Apps Script functions
developed by rghuckins][rghuckins-script] (thank you!). I developed it further
by:

* refactoring the code into a more modern, ES6 syntax
* splitting it apart into different files for better maintainability
* adding a bunch of tests
* upgrading to Robinhood's new authentication mechanism (detailed
  [here][robinhood-auth])

[rghuckins-script]: https://github.com/rghuckins/robinhood-google-sheets
[robinhood-auth]: https://github.com/Jamonek/Robinhood/issues/176

## Colophon

© 2019 Elliot Winkler (<elliot.winkler@gmail.com>), eeleased under the [MIT
license](LICENSE.txt).
