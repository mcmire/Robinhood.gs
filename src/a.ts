/// <reference path="util.ts" />

module Robinhood {
  export function greetFirstUser() {
    iCanSeeYou();
    log1("Hi, Grant");

    ["x"].reduce((a: string[], b: string) => {
      a.push(b);
      Logger.log("hey hey");
      return a;
    }, []);
  }

  function log1(message: string) {
    Logger.log(message);
  }
}

function someGlobalFunction() {
  Logger.log("do something");
}
