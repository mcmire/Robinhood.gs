import RobinhoodClientHelp from "../src/RobinhoodClientHelp";

describe("RobinhoodClientHelp", () => {
  describe("#getResource", () => {
    const SOME_ACCESS_TOKEN = "SOME_ACCESS_TOKEN";

    describe("regardless of whether the fetch call throws an error or not", () => {
      it("calls UrlFetchApp.fetch correctly", () => {
        const services = makeServices({
          UrlFetchApp: {
            fetch: jest.fn().mockImplementation(() => {
              return makeSuccessfulResponse();
            })
          }
        });
        const help = new RobinhoodClientHelp(services);

        help.getResource("/some/path", "SOME_ACCESS_TOKEN");

        expect(services.UrlFetchApp.fetch).toHaveBeenCalledWith(
          "https://api.robinhood.com/some/path",
          {
            method: "get",
            headers: {
              Accept: "application/json",
              Authorization: "Bearer SOME_ACCESS_TOKEN"
            },
            muteHttpExceptions: true,
            followRedirects: true
          }
        );
      });
    });

    describe("as long as the fetch call does not throw an error", () => {
      describe("when the response status is 2xx", () => {
        describe("when the response data has a next property", () => {
          it("returns all of the pages of data", () => {
            const services = makeServices({
              UrlFetchApp: {
                fetch: jest
                  .fn()
                  .mockImplementationOnce(() => {
                    return makeSuccessfulResponse({
                      results: ["one", "two", "three"],
                      next: "/some/path?page=2"
                    });
                  })
                  .mockImplementationOnce(() => {
                    return makeSuccessfulResponse({
                      results: ["four", "five", "six"],
                      next: "/some/path?page=3"
                    });
                  })
                  .mockImplementationOnce(() => {
                    return makeSuccessfulResponse({
                      results: ["seven", "eight", "nine"],
                      next: null
                    });
                  })
              }
            });
            const help = new RobinhoodClientHelp(services);

            const results = help.getResource("/some/path", "SOME_ACCESS_TOKEN");

            expect(results).toEqual([
              "one",
              "two",
              "three",
              "four",
              "five",
              "six",
              "seven",
              "eight",
              "nine"
            ]);
          });
        });

        it("returns the results", () => {
          const expectedResults = [{ some: "results" }];
          const services = makeServices({
            UrlFetchApp: {
              fetch: jest.fn().mockImplementation(() => {
                return makeSuccessfulResponse({ results: expectedResults });
              })
            }
          });
          const help = new RobinhoodClientHelp(services);

          const actualResults = help.getResource(
            "/some/path",
            "SOME_ACCESS_TOKEN"
          );
          expect(actualResults).toEqual(expectedResults);
        });
      });

      describe("when the response status is 4xx", () => {
        it("throws an error", () => {
          const services = makeServices({
            UrlFetchApp: {
              fetch: jest.fn().mockImplementation(() => {
                return makeResponse(400, { some: "error" });
              })
            }
          });
          const help = new RobinhoodClientHelp(services);

          expect(() => {
            help.getResource("/some/path", "SOME_ACCESS_TOKEN");
          }).toThrow(
            "Could not fetch Robinhood resource. " +
              `(400 GET https://api.robinhood.com/some/path: {"some":"error"})`
          );
        });
      });

      describe("when the response status is 5xx", () => {
        it("throws an error", () => {
          const services = makeServices({
            UrlFetchApp: {
              fetch: jest.fn().mockImplementation(() => {
                return makeResponse(500, { some: "error" });
              })
            }
          });
          const help = new RobinhoodClientHelp(services);

          expect(() => {
            help.getResource("/some/path", SOME_ACCESS_TOKEN);
          }).toThrow(
            "Could not fetch Robinhood resource. " +
              `(500 GET https://api.robinhood.com/some/path: {"some":"error"})`
          );
        });
      });
    });

    describe("when the fetch call throws an error", () => {
      describe("if that hasn't already happened", () => {
        it("fetches data again after 3 seconds", () => {
          const services = makeServices({
            UrlFetchApp: {
              fetch: jest
                .fn()
                .mockImplementationOnce(() => {
                  throw new Error("oops!");
                })
                .mockImplementationOnce(() => {
                  return makeSuccessfulResponse();
                })
            },
            Utilities: {
              sleep: jest.fn()
            }
          });
          const help = new RobinhoodClientHelp(services);

          help.getResource("/some/path", SOME_ACCESS_TOKEN);

          expect(services.Utilities.sleep).toHaveBeenCalledWith(3000);
          expect(services.UrlFetchApp.fetch).toHaveBeenCalledTimes(2);
        });
      });

      describe("if that's already happened once", () => {
        it("doesn't catch the error", () => {
          const services = makeServices({
            UrlFetchApp: {
              fetch: jest
                .fn()
                .mockImplementationOnce(() => {
                  throw new Error("first error");
                })
                .mockImplementationOnce(() => {
                  throw new Error("second error");
                })
            }
          });
          const help = new RobinhoodClientHelp(services);

          expect(() => {
            help.getResource("/some/path", SOME_ACCESS_TOKEN);
          }).toThrow("second error");
        });
      });
    });

    function makeServices({
      UrlFetchApp = { fetch: jest.fn() },
      Utilities = { sleep: jest.fn }
    }) {
      return { UrlFetchApp, Utilities };
    }

    function makeSuccessfulResponse(body = [{ results: ["something"] }]) {
      return makeResponse(200, body);
    }

    function makeResponse(status, body = [{ results: ["something"] }]) {
      return {
        getResponseCode() {
          return status;
        },
        getContentText() {
          return JSON.stringify(body);
        }
      };
    }
  });

  function makeSuccessfulResponse(body = {}) {
    return makeResponse(200, body);
  }

  function makeResponse(status, body = {}) {
    return {
      getResponseCode() {
        return status;
      },
      getContentText() {
        return JSON.stringify(body);
      }
    };
  }
});
