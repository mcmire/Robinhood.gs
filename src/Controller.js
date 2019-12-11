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

  // Source: <https://github.com/jmfernandes/robin_stocks/blob/master/robin_stocks/authentication.py>
  connectToApi() {
    if (this.authorization == null) {
      this.authorization =
        this.cache.get("authorization") || this._getAccessToken();
    }
  }

  getOrders() {
    // ...
  }

  _getAccessToken() {
    const response = this.client.getAccessToken(
      this.credentials.username,
      this.credentials.password
    );
    return this._handleAuthResponse(response.body);
  }

  _handleAuthResponse(data) {
    if ("mfa_required" in data) {
      return this._handleAuthResponse(this._authenticateUsingMfaCode());
    } else if ("challenge" in data) {
      return this._handleAuthResponse(
        this._authenticateUsingSmsCode(response.body["challenge"]["id"])
      );
    } else if ("access_token" in data) {
      return [data["access_type"], data["access_token"]].join(" ");
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
      const remainingAttempts = data["challenge"]["remaining_attempts"];

      if (remainingAttempts > 0) {
        return this._authenticateUsingSmsCode(challengeId, {
          remainingAttempts
        });
      } else {
        throw new Error("Couldn't connect to Robinhood API: Invalid SMS code.");
      }
    } else {
      return data;
    }
  }
}
