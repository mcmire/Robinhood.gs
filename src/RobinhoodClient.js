// Source: <https://github.com/Jamonek/Robinhood/issues/176#issuecomment-487310801>
const CLIENT_ID = "c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS";
const ONE_DAY = 60 * 60 * 24;

export default class RobinhoodClient {
  constructor(clientHelp) {
    this.clientHelp = clientHelp;
  }

  getAccessToken(username, password, { challengeResponseId = null } = {}) {
    const headers = {};

    if (challengeResponseId != null) {
      headers["X-Robinhood-Challenge-Response-ID"] = challengeResponseId;
    }

    return this.clientHelp.makePostRequest("/oauth2/token/", {
      headers: headers,
      payload: {
        challenge_type: "sms",
        client_id: CLIENT_ID,
        device_token: this.clientHelp.generateDeviceToken(),
        expires_in: ONE_DAY,
        grant_type: "password",
        password: password,
        scope: "internal",
        username: username
      }
    });
  }

  respondToChallenge(challengeId, smsCode) {
    return this.clientHelp.makePostRequest(
      `/challenge/${challengeId}/respond`,
      {
        payload: { response: smsCode },
        errorMessage: "Could not respond to Robinhood auth challenge."
      }
    );
  }
}
