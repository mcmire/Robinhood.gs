import RobinhoodClient from "../src/RobinhoodClient";

describe("RobinhoodClient", () => {
  describe("#getAccessToken", () => {
    describe("when no challengeResponseId is given", () => {
      it("calls #makePostRequest on the given object correctly", () => {
        const clientHelp = makeClientHelp({
          makePostRequest: jest.fn(),
          generateDeviceToken: () => "some_device_token"
        });
        const robinhoodApi = new RobinhoodClient(clientHelp);

        robinhoodApi.getAccessToken(
          "some_device_token",
          "some_username",
          "some_password"
        );

        expect(clientHelp.makePostRequest).toHaveBeenCalledWith(
          "/oauth2/token/",
          {
            headers: {},
            payload: {
              challenge_type: "sms",
              client_id: "c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS",
              device_token: "some_device_token",
              expires_in: 86400,
              grant_type: "password",
              password: "some_password",
              scope: "internal",
              username: "some_username"
            }
          }
        );
      });
    });

    describe("when a challengeResponseId is given", () => {
      it("adds it to the list of headers", () => {
        const clientHelp = makeClientHelp({
          makePostRequest: jest.fn(),
          generateDeviceToken: () => "some_device_token"
        });
        const robinhoodApi = new RobinhoodClient(clientHelp);

        robinhoodApi.getAccessToken(
          "some_device_token",
          "some_username",
          "some_password",
          {
            challengeResponseId: "abc123"
          }
        );

        expect(clientHelp.makePostRequest).toHaveBeenCalledWith(
          "/oauth2/token/",
          {
            headers: {
              "X-Robinhood-Challenge-Response-ID": "abc123"
            },
            payload: {
              challenge_type: "sms",
              client_id: "c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS",
              device_token: "some_device_token",
              expires_in: 86400,
              grant_type: "password",
              password: "some_password",
              scope: "internal",
              username: "some_username"
            }
          }
        );
      });
    });
  });

  describe("#respondToChallenge", () => {
    it("calls UrlFetchApp.fetch correctly", () => {
      const clientHelp = makeClientHelp();
      const robinhoodApi = new RobinhoodClient(clientHelp);

      robinhoodApi.respondToChallenge("111-222-333", "123456");

      expect(clientHelp.makePostRequest).toHaveBeenCalledWith(
        "/challenge/111-222-333/respond",
        {
          payload: {
            response: "123456"
          },
          errorMessage: "Could not respond to Robinhood auth challenge."
        }
      );
    });

    function someChallengeId() {
      return "some_challenge_id";
    }

    function someSmsCode() {
      return "some_sms_code";
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

  function makeClientHelp({
    makePostRequest = jest.fn(),
    generateDeviceToken = jest.fn()
  } = {}) {
    return { makePostRequest, generateDeviceToken };
  }

  function someUsername() {
    return "some_username";
  }

  function somePassword() {
    return "some_password";
  }
});
