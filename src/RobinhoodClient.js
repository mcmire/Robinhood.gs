// Source: <https://github.com/Jamonek/Robinhood/issues/176#issuecomment-487310801>
const CLIENT_ID = "c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS";
const ONE_DAY = 60 * 60 * 24;

export default class RobinhoodClient {
  constructor(clientHelp) {
    this.clientHelp = clientHelp;
  }

  // Source: <https://github.com/aurbano/robinhood-node/issues/100#issuecomment-491666787>
  // TODO: Test
  generateDeviceToken() {
    const rands = [];
    for (let i = 0; i < 16; i++) {
      const r = Math.random();
      const rand = 4294967296.0 * r;
      rands.push((rand >> ((3 & i) << 3)) & 255);
    }

    let id = "";
    const hex = [];
    for (let i = 0; i < 256; ++i) {
      hex.push(
        Number(i + 256)
          .toString(16)
          .substring(1)
      );
    }

    for (let i = 0; i < 16; i++) {
      id += hex[rands[i]];
      if (i == 3 || i == 5 || i == 7 || i == 9) {
        id += "-";
      }
    }

    return id;
  }

  getAccessToken(
    deviceToken,
    username,
    password,
    { challengeResponseId = null } = {}
  ) {
    const headers = {};

    if (challengeResponseId != null) {
      headers["X-Robinhood-Challenge-Response-ID"] = challengeResponseId;
    }

    return this.clientHelp.makePostRequest("/oauth2/token/", {
      headers: headers,
      payload: {
        challenge_type: "sms",
        client_id: CLIENT_ID,
        device_token: deviceToken,
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
