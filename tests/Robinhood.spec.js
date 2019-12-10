import robinhood from "../src/robinhood";

const gasMocks = require("./support/gasMocks");

describe("robinhood", () => {
  beforeEach(() => {
    gasMocks.enable();
  });

  afterEach(() => {
    gasMocks.disable();
  });

  describe("#getAccessToken", () => {
    const SOME_TOKEN = "SOME_TOKEN";
    const SOME_USERNAME = "some_username";
    const SOME_PASSWORD = "some_password";

    describe("regardless of the response status", () => {
      describe("when no challengeResponseId is given", () => {
        it("calls UrlFetchApp.fetch correctly", () => {
          jest.spyOn(UrlFetchApp, "fetch").mockImplementation(() => {
            return makeSuccessfulResponse();
          });

          robinhood.getAccessToken(
            "SOME_TOKEN",
            "some_username",
            "some_password"
          );

          expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
            "https://api.robinhood.com/oauth2/token/",
            {
              method: "post",
              headers: {
                Accept: "application/json"
              },
              payload: JSON.stringify({
                challenge_type: "sms",
                client_id: "c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS",
                device_token: "SOME_TOKEN",
                expires_in: 86400,
                grant_type: "password",
                password: "some_password",
                scope: "internal",
                username: "some_username"
              }),
              muteHttpExceptions: true,
              followRedirects: true
            }
          );
        });
      });

      describe("when a challengeResponseId is given", () => {
        it("adds it to the list of headers", () => {
          jest.spyOn(UrlFetchApp, "fetch").mockImplementation(() => {
            return makeSuccessfulResponse();
          });

          robinhood.getAccessToken(
            "SOME_TOKEN",
            "some_username",
            "some_password",
            { challengeResponseId: "abc123" }
          );

          expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
            "https://api.robinhood.com/oauth2/token/",
            {
              method: "post",
              headers: {
                Accept: "application/json",
                "X-Robinhood-Challenge-Response-ID": "abc123"
              },
              payload: JSON.stringify({
                challenge_type: "sms",
                client_id: "c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS",
                device_token: "SOME_TOKEN",
                expires_in: 86400,
                grant_type: "password",
                password: "some_password",
                scope: "internal",
                username: "some_username"
              }),
              muteHttpExceptions: true,
              followRedirects: true
            }
          );
        });
      });
    });

    describe("when the response status is 2xx", () => {
      it("returns the response", () => {
        const expectedBody = { some: "body" };

        jest.spyOn(UrlFetchApp, "fetch").mockImplementation(() => {
          return makeSuccessfulResponse(expectedBody);
        });

        const response = robinhood.getAccessToken(
          SOME_TOKEN,
          SOME_USERNAME,
          SOME_PASSWORD
        );

        expect(response).toEqual({ status: 200, body: expectedBody });
      });
    });

    describe("when the response status is 4xx", () => {
      it("doesn't throw an error, but returns the response instead", () => {
        const expectedBody = { some: "body" };

        jest.spyOn(UrlFetchApp, "fetch").mockImplementation(() => {
          return makeResponse(400, expectedBody);
        });

        const response = robinhood.getAccessToken(
          SOME_TOKEN,
          SOME_USERNAME,
          SOME_PASSWORD
        );

        expect(response).toEqual({ status: 400, body: expectedBody });
      });
    });

    describe("when the response status is 5xx", () => {
      it("doesn't throw an error, but returns the response instead", () => {
        const expectedBody = { some: "body" };

        jest.spyOn(UrlFetchApp, "fetch").mockImplementation(() => {
          return makeResponse(500, expectedBody);
        });

        const response = robinhood.getAccessToken(
          SOME_TOKEN,
          SOME_USERNAME,
          SOME_PASSWORD
        );

        expect(response).toEqual({ status: 500, body: expectedBody });
      });
    });
  });

  describe("#respondToChallenge", () => {
    const SOME_CHALLENGE_ID = "some_challenge_id";
    const SOME_SMS_CODE = "some_sms_code";

    describe("regardless of the response status", () => {
      it("calls UrlFetchApp.fetch correctly", () => {
        jest.spyOn(UrlFetchApp, "fetch").mockImplementation(() => {
          return makeSuccessfulResponse();
        });

        robinhood.respondToChallenge("111-222-333", "123456");

        expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
          "https://api.robinhood.com/challenge/111-222-333/respond",
          {
            method: "post",
            headers: {
              Accept: "application/json"
            },
            payload: JSON.stringify({
              response: "123456"
            }),
            muteHttpExceptions: true,
            followRedirects: true
          }
        );
      });
    });

    describe("when the response status is 2xx", () => {
      it("returns the response", () => {
        const expectedBody = { some: "body" };

        jest.spyOn(UrlFetchApp, "fetch").mockImplementation(() => {
          return makeSuccessfulResponse(expectedBody);
        });

        const response = robinhood.respondToChallenge(
          SOME_CHALLENGE_ID,
          SOME_SMS_CODE
        );

        expect(response).toEqual({ status: 200, body: expectedBody });
      });
    });

    describe("when the response status is 4xx", () => {
      it("doesn't throw an error, but returns the response instead", () => {
        const expectedBody = { some: "body" };

        jest.spyOn(UrlFetchApp, "fetch").mockImplementation(() => {
          return makeResponse(400, expectedBody);
        });

        const response = robinhood.respondToChallenge(
          SOME_CHALLENGE_ID,
          SOME_SMS_CODE
        );

        expect(response).toEqual({ status: 400, body: expectedBody });
      });
    });

    describe("when the response status is 5xx", () => {
      it("doesn't throw an error, but returns the response instead", () => {
        const expectedBody = { some: "body" };

        jest.spyOn(UrlFetchApp, "fetch").mockImplementation(() => {
          return makeResponse(500, expectedBody);
        });

        const response = robinhood.respondToChallenge(
          SOME_CHALLENGE_ID,
          SOME_SMS_CODE
        );

        expect(response).toEqual({ status: 500, body: expectedBody });
      });
    });
  });

  describe("#getResource", () => {
    const SOME_ACCESS_TOKEN = "SOME_ACCESS_TOKEN";

    describe("regardless of whether the fetch call throws an error or not", () => {
      it("calls UrlFetchApp.fetch correctly", () => {
        jest.spyOn(UrlFetchApp, "fetch").mockImplementation(() => {
          return makeSuccessfulResponse();
        });

        robinhood.getResource("/some/path", "SOME_ACCESS_TOKEN");

        expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
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
            jest
              .spyOn(UrlFetchApp, "fetch")
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
              });

            const results = robinhood.getResource(
              "/some/path",
              "SOME_ACCESS_TOKEN"
            );

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

          jest.spyOn(UrlFetchApp, "fetch").mockImplementation(() => {
            return makeSuccessfulResponse({ results: expectedResults });
          });

          const actualResults = robinhood.getResource(
            "/some/path",
            "SOME_ACCESS_TOKEN"
          );

          expect(actualResults).toEqual(expectedResults);
        });
      });

      describe("when the response status is 4xx", () => {
        it("throws an error", () => {
          jest.spyOn(UrlFetchApp, "fetch").mockImplementation(() => {
            return makeResponse(400, { some: "error" });
          });

          expect(() => {
            robinhood.getResource("/some/path", "SOME_ACCESS_TOKEN");
          }).toThrow(
            "Could not fetch Robinhood resource. " +
              `(400 GET https://api.robinhood.com/some/path: {"some":"error"})`
          );
        });
      });

      describe("when the response status is 5xx", () => {
        it("throws an error", () => {
          jest.spyOn(UrlFetchApp, "fetch").mockImplementation(() => {
            return makeResponse(500, { some: "error" });
          });

          expect(() => {
            robinhood.getResource("/some/path", SOME_ACCESS_TOKEN);
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
          jest
            .spyOn(UrlFetchApp, "fetch")
            .mockImplementationOnce(() => {
              throw new Error("oops!");
            })
            .mockImplementationOnce(() => {
              return makeSuccessfulResponse();
            });
          jest.spyOn(Utilities, "sleep");

          robinhood.getResource("/some/path", SOME_ACCESS_TOKEN);

          expect(Utilities.sleep).toHaveBeenCalledWith(3000);
          expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(2);
        });
      });

      describe("if that's already happened once", () => {
        it("doesn't catch the error", () => {
          jest
            .spyOn(UrlFetchApp, "fetch")
            .mockImplementationOnce(() => {
              throw new Error("first error");
            })
            .mockImplementationOnce(() => {
              throw new Error("second error");
            });

          expect(() => {
            robinhood.getResource("/some/path", SOME_ACCESS_TOKEN);
          }).toThrow("second error");
        });
      });
    });

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
