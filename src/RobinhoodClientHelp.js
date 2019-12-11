import { concat, mergeObjects } from "./util";

const BASE_URL = "https://api.robinhood.com";

export default class RobinhoodClientHelp {
  constructor({ UrlFetchApp, Utilities }) {
    this.UrlFetchApp = UrlFetchApp;
    this.Utilities = Utilities;
  }

  getResource(pathOrUrl, accessToken) {
    const getAuthenticatedResource = () => {
      return this.makeGetRequest(pathOrUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        errorMessage: "Could not fetch Robinhood resource."
      });
    };

    let response;
    try {
      response = getAuthenticatedResource();
    } catch (e) {
      this.Utilities.sleep(3000);
      response = getAuthenticatedResource();
    }

    if (response.body["next"] != null) {
      return concat(
        response.body["results"],
        this.getResource(response.body["next"], accessToken)
      );
    } else {
      return response.body["results"];
    }
  }

  makeGetRequest(pathOrUrl, options = {}) {
    return this._makeRequest("get", pathOrUrl, options);
  }

  makePostRequest(pathOrUrl, { payload, ...rest } = {}) {
    return this._makeRequest("post", pathOrUrl, {
      payload: JSON.stringify(payload),
      ...rest
    });
  }

  // Source: <https://github.com/aurbano/robinhood-node/issues/100#issuecomment-491666787>
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

  _makeRequest(
    method,
    pathOrUrl,
    { headers = {}, errorMessage = null, ...rest } = {}
  ) {
    method = method.toLowerCase();
    const url = this._makeAbsoluteUrl(pathOrUrl);

    const response = this.UrlFetchApp.fetch(url, {
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

  _makeAbsoluteUrl(pathOrUrl) {
    const regexp = new RegExp("^" + BASE_URL);
    return regexp.exec(pathOrUrl) ? pathOrUrl : BASE_URL + pathOrUrl;
  }
}
