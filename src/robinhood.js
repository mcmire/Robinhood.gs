import { concat, mergeObjects } from "./util";

const BASE_URL = "https://api.robinhood.com";
// Source: <https://github.com/Jamonek/Robinhood/issues/176#issuecomment-487310801>
const CLIENT_ID = "c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS";
const ONE_DAY = 60 * 60 * 24;

// Source: <https://github.com/aurbano/robinhood-node/issues/100#issuecomment-491666787>
function generateDeviceToken() {
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

export function getAccessToken(
  deviceToken,
  username,
  password,
  { challengeResponseId = null } = {}
) {
  const headers = {};

  if (challengeResponseId != null) {
    headers["X-Robinhood-Challenge-Response-ID"] = challengeResponseId;
  }

  return makePostRequest("/oauth2/token/", {
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

export function respondToChallenge(challengeId, smsCode) {
  return makePostRequest(`/challenge/${challengeId}/respond`, {
    payload: { response: smsCode }
  });
}

function getResource(pathOrUrl, accessToken) {
  function getAuthenticatedResource() {
    return makeGetRequest(pathOrUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      errorMessage: "Could not fetch Robinhood resource."
    });
  }

  let response;
  try {
    response = getAuthenticatedResource();
  } catch (e) {
    Utilities.sleep(3000);
    response = getAuthenticatedResource();
  }

  if (response.body["next"] != null) {
    return concat(
      response.body["results"],
      getResource(response.body["next"], accessToken)
    );
  } else {
    return response.body["results"];
  }
}

function makeGetRequest(pathOrUrl, options = {}) {
  return makeRequest("get", pathOrUrl, options);
}

function makePostRequest(pathOrUrl, { payload, ...rest } = {}) {
  return makeRequest("post", pathOrUrl, {
    payload: JSON.stringify(payload),
    ...rest
  });
}

function makeRequest(
  method,
  pathOrUrl,
  { headers = {}, errorMessage = null, ...rest } = {}
) {
  method = method.toLowerCase();
  const url = makeAbsoluteUrl(pathOrUrl);

  const response = UrlFetchApp.fetch(url, {
    method: method,
    headers: mergeObjects(headers, { Accept: "application/json" }),
    muteHttpExceptions: true,
    followRedirects: true,
    ...rest
  });

  const status = response.getResponseCode();
  const rawBody = response.getContentText();
  const body = JSON.parse(rawBody);

  if (errorMessage == null || (status >= 200 && status < 300)) {
    return { status, body };
  } else {
    throw new Error(
      `${errorMessage} (${status} ${method.toUpperCase()} ${url}: ${rawBody})`
    );
  }
}

function makeAbsoluteUrl(pathOrUrl) {
  const regexp = new RegExp("^" + BASE_URL);
  return regexp.exec(pathOrUrl) ? pathOrUrl : BASE_URL + pathOrUrl;
}

export default { getAccessToken, respondToChallenge, getResource };
