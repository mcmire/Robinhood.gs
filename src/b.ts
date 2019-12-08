/// <reference path="util.ts" />

module Robinhood {
  export function greetSecondUser() {
    iCanSeeYou();
    log2("Hi, Grant");
  }

  function log2(message: string) {
    Logger.log(message);
  }
}

function anotherGlobalFunction() {
  Logger.log("do something");
}
