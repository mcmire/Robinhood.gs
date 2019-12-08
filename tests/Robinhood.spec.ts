/// <reference path="../src/Robinhood.ts" />

import assert from "assert";

module Foo {
  export function bar() {}
}

Foo.bar();

test("hello", () => {
  assert.equal(42, Robinhood.foo);
});
