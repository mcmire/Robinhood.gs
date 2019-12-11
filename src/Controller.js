import { sliceObject } from "./util";

import RobinhoodClientHelp from "./RobinhoodClientHelp";
import RobinhoodClient from "./RobinhoodClient";

// TODO: Test this
export default class Controller {
  constructor({
    credentials: { username, password },
    services: { CacheService, SpreadsheetApp, UrlFetchApp }
  }) {
    const clientHelp = new RobinhoodClientHelp({ services: { UrlFetchApp } });
    this.client = new RobinhoodClient(clientHelp);
    this.cache = CacheService.getScriptCache();
    this.ui = SpreadsheetApp.getUi();
  }

  getOrders() {
    this._connectToApi();
    // ...
  }

  // Source: <https://github.com/jmfernandes/robin_stocks/blob/master/robin_stocks/authentication.py>
  _connectToApi() {
    if (this.authorization == null) {
      // TODO: Instead of using cache, use the spreadsheet as the cache
      // That way we can hold onto it infinitely
      //
      // The first time a request is made we might still want to refresh the
      // access token anyway — but we can reuse the device token we generated
      // last time, at least — then we cache the access token in the spreadsheet
      // too
      const cachedAuthorization = this.cache.get("authorization");

      if (cachedAuthorization == null) {
        const authorization = this._getAccessToken();
        this.authorization = authorization;
        this.cache.put("authorization", JSON.stringify(authorization));
      } else {
        this.authorization = JSON.parse(cachedAuthorization);
      }
    }
  }

  _getAccessToken() {
    const deviceToken = this.client.generateDeviceToken();
    const response = this.client.getAccessToken(
      deviceToken,
      this.credentials.username,
      this.credentials.password
    );
    return this._handleAuthResponse(response.body, deviceToken);
  }

  _handleAuthResponse(data, deviceToken) {
    if ("mfa_required" in data) {
      return this._handleAuthResponse(
        this._authenticateUsingMfaCode(),
        deviceToken
      );
    } else if ("challenge" in data) {
      const challenge = data["challenge"];

      if (challenge["status"] === "issued") {
        return this._handleAuthResponse(
          this._authenticateUsingSmsCode(response.body["challenge"]["id"]),
          deviceToken
        );
      } else {
        throw new Error("Couldn't connect to Robinhood API: Invalid response.");
      }
    } else if ("access_token" in data) {
      return {
        accessType: data["access_type"],
        accessToken: data["access_token"],
        deviceToken: deviceToken
      };
    } else {
      throw new Error("Couldn't connect to Robinhood API: Invalid response.");
    }
  }

  _authenticateUsingMfaCode(isRetry = false) {
    const message = isRetry
      ? "Hmm, that code wasn't correct. Please try again:"
      : "Enter your MFA code:";
    const mfaCode = this.ui.prompt(message);
    const response = this.client.getAccessToken(
      this.credentials.username,
      this.credentials.password,
      { mfaCode }
    );

    if (response.isSuccessful) {
      return response.body;
    } else {
      return this._authenticateUsingMfaCode(true);
    }
  }

  _authenticateUsingSmsCode(challengeId, retry = null) {
    const message =
      retry == null
        ? "You should have gotten a text from Robinhood. Enter the code that you see there:"
        : `Hmm, that code wasn't correct. You have ${retry.remainingAttempts} more tries. Try another code?`;
    const smsCode = this.ui.prompt(message);
    const response = this.client.respondToChallenge(challengeId, smsCode);
    const data = response.body;

    if ("challenge" in data) {
      const challenge = data["challenge"];

      if (challenge["status"] === "validated") {
        return data;
      } else {
        const remainingAttempts = challenge["remaining_attempts"];

        if (remainingAttempts > 0) {
          return this._authenticateUsingSmsCode(challengeId, {
            remainingAttempts
          });
        } else {
          throw new Error(
            "Couldn't connect to Robinhood API: Invalid SMS code."
          );
        }
      }
    } else {
      throw new Error("Couldn't connect to Robinhood API: Invalid response.");
    }
  }
}
