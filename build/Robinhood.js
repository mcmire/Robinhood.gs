/*
 * Robinhood.gs
 *
 * Copyright (c) 2019 Elliot Winkler.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * Source: <https://github.com/mcmire/Robinhood.gs>
 *
 * Last updated 12/10/2019.
 */

//--- Change these to match your username/password -----------------------------

window.ROBINHOOD_USERNAME_ = "<redacted>";
window.ROBINHOOD_PASSWORD_ = "<redacted>";

//--- Don't change anything below this line! -----------------------------------

(function (exports) {
  'use strict';

  /*!
   * isobject <https://github.com/jonschlinkert/isobject>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   */
  function isObject(val) {
    return val != null && typeof val === 'object' && Array.isArray(val) === false;
  }

  /*!
   * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   */

  function isObjectObject(o) {
    return isObject(o) === true && Object.prototype.toString.call(o) === '[object Object]';
  }

  function isPlainObject(o) {
    var ctor, prot;
    if (isObjectObject(o) === false) return false; // If has modified constructor

    ctor = o.constructor;
    if (typeof ctor !== 'function') return false; // If has modified prototype

    prot = ctor.prototype;
    if (isObjectObject(prot) === false) return false; // If constructor does not have an Object-specific method

    if (prot.hasOwnProperty('isPrototypeOf') === false) {
      return false;
    } // Most likely a plain Object


    return true;
  }

  function isArray(value) {
    return Object.prototype.toString.call(value) === "[object Array]";
  }

  function each(value, fn) {
    if (isArray(value)) {
      for (var i = 0, len = value.length; i < len; i++) {
        fn(value[i], i);
      }
    } else if (isPlainObject(value)) {
      for (var key in value) {
        if (value.hasOwnProperty(key)) {
          fn(value[key], key);
        }
      }
    } else {
      throw new Error("Don't know how to iterate over value");
    }
  }

  function mergeObjects(object1, object2) {
    var _final = {};
    each(object1, function (value, key) {
      _final[key] = value;
    });
    each(object2, function (value, key) {
      _final[key] = value;
    });
    return _final;
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  var BASE_URL = "https://api.robinhood.com";

  function makePostRequest(pathOrUrl, _temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        payload = _ref.payload,
        rest = _objectWithoutPropertiesLoose(_ref, ["payload"]);

    return makeRequest("post", pathOrUrl, Object.assign({
      payload: JSON.stringify(payload)
    }, rest));
  } // Source: <https://github.com/aurbano/robinhood-node/issues/100#issuecomment-491666787>


  function generateDeviceToken() {
    var rands = [];

    for (var i = 0; i < 16; i++) {
      var r = Math.random();
      var rand = 4294967296.0 * r;
      rands.push(rand >> ((3 & i) << 3) & 255);
    }

    var id = "";
    var hex = [];

    for (var _i = 0; _i < 256; ++_i) {
      hex.push(Number(_i + 256).toString(16).substring(1));
    }

    for (var _i2 = 0; _i2 < 16; _i2++) {
      id += hex[rands[_i2]];

      if (_i2 == 3 || _i2 == 5 || _i2 == 7 || _i2 == 9) {
        id += "-";
      }
    }

    return id;
  }

  function makeRequest(method, pathOrUrl, _temp2) {
    var _ref2 = _temp2 === void 0 ? {} : _temp2,
        _ref2$headers = _ref2.headers,
        headers = _ref2$headers === void 0 ? {} : _ref2$headers,
        _ref2$errorMessage = _ref2.errorMessage,
        errorMessage = _ref2$errorMessage === void 0 ? null : _ref2$errorMessage,
        rest = _objectWithoutPropertiesLoose(_ref2, ["headers", "errorMessage"]);

    method = method.toLowerCase();
    var url = makeAbsoluteUrl(pathOrUrl);
    var response = UrlFetchApp.fetch(url, Object.assign({
      method: method,
      headers: mergeObjects(headers, {
        Accept: "application/json"
      }),
      muteHttpExceptions: true,
      followRedirects: true
    }, rest));
    var status = response.getResponseCode();
    var rawBody = response.getContentText();
    var body = JSON.parse(rawBody);

    if (errorMessage == null || status >= 200 && status < 300) {
      return {
        status: status,
        body: body
      };
    } else {
      throw new Error(errorMessage + " (" + status + " " + method.toUpperCase() + " " + url + ": " + rawBody + ")");
    }
  }

  function makeAbsoluteUrl(pathOrUrl) {
    var regexp = new RegExp("^" + BASE_URL);
    return regexp.exec(pathOrUrl) ? pathOrUrl : BASE_URL + pathOrUrl;
  }

  var CLIENT_ID = "c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS";
  var ONE_DAY = 60 * 60 * 24;

  var RobinhoodApi =
  /*#__PURE__*/
  function () {
    function RobinhoodApi(_ref) {
      var UrlFetchApp = _ref.UrlFetchApp;
      this.UrlFetchApp = UrlFetchApp;
    }

    var _proto = RobinhoodApi.prototype;

    _proto.getAccessToken = function getAccessToken(deviceToken, username, password, _temp) {
      var _ref2 = _temp === void 0 ? {} : _temp,
          _ref2$challengeRespon = _ref2.challengeResponseId,
          challengeResponseId = _ref2$challengeRespon === void 0 ? null : _ref2$challengeRespon;

      var headers = {};

      if (challengeResponseId != null) {
        headers["X-Robinhood-Challenge-Response-ID"] = challengeResponseId;
      }

      return makePostRequest("/oauth2/token/", {
        headers: headers,
        payload: {
          challenge_type: "sms",
          client_id: CLIENT_ID,
          device_token: generateDeviceToken(),
          expires_in: ONE_DAY,
          grant_type: "password",
          password: password,
          scope: "internal",
          username: username
        }
      });
    };

    _proto.respondToChallenge = function respondToChallenge(challengeId, smsCode) {
      return makePostRequest("/challenge/" + challengeId + "/respond", {
        payload: {
          response: smsCode
        },
        errorMessage: "Could not respond to Robinhood auth challenge."
      });
    };

    return RobinhoodApi;
  }();

  var Controller =
  /*#__PURE__*/
  function () {
    function Controller(_ref) {
      var _ref$credentials = _ref.credentials,
          username = _ref$credentials.username,
          password = _ref$credentials.password,
          _ref$services = _ref.services,
          CacheService = _ref$services.CacheService,
          SpreadsheetApp = _ref$services.SpreadsheetApp,
          UrlFetchApp = _ref$services.UrlFetchApp;
      this.api = new RobinhoodApi({
        services: {
          UrlFetchApp: UrlFetchApp
        }
      });
      this.cache = CacheService.getScriptCache();
      this.ui = SpreadsheetApp.getUi();
    } // Source: <https://github.com/jmfernandes/robin_stocks/blob/master/robin_stocks/authentication.py>


    var _proto = Controller.prototype;

    _proto.connectToApi = function connectToApi() {
      if (this.authorization == null) {
        this.authorization = this.cache.get("authorization") || this._getAccessToken();
      }
    };

    _proto.getOrders = function getOrders() {// ...
    };

    _proto._getAccessToken = function _getAccessToken() {
      var response = this.api.getAccessToken(this.credentials.username, this.credentials.password);
      return this._handleAuthResponse(response.body);
    };

    _proto._handleAuthResponse = function _handleAuthResponse(data) {
      if ("mfa_required" in data) {
        return this._handleAuthResponse(this._authenticateUsingMfaCode());
      } else if ("challenge" in data) {
        return this._handleAuthResponse(this._authenticateUsingSmsCode(response.body["challenge"]["id"]));
      } else if ("access_token" in data) {
        return [data["access_type"], data["access_token"]].join(" ");
      } else {
        throw new Error("Couldn't connect to Robinhood API: Invalid response.");
      }
    };

    _proto._authenticateUsingMfaCode = function _authenticateUsingMfaCode(isRetry) {
      if (isRetry === void 0) {
        isRetry = false;
      }

      var message = isRetry ? "Hmm, that code wasn't correct. Please try again:" : "Enter your MFA code:";
      var mfaCode = this.ui.prompt(message);
      var response = this.api.getAccessToken(this.credentials.username, this.credentials.password, {
        mfaCode: mfaCode
      });

      if (response.isSuccessful) {
        return response.body;
      } else {
        return this._authenticateUsingMfaCode(true);
      }
    };

    _proto._authenticateUsingSmsCode = function _authenticateUsingSmsCode(challengeId, retry) {
      if (retry === void 0) {
        retry = null;
      }

      var message = retry == null ? "You should have gotten a text from Robinhood. Enter the code that you see there:" : "Hmm, that code wasn't correct. You have " + retry.remainingAttempts + " more tries. Try another code?";
      var smsCode = this.ui.prompt(message);
      var response = this.api.respondToChallenge(challengeId, smsCode);
      var data = response.body;

      if ("challenge" in data) {
        var remainingAttempts = data["challenge"]["remaining_attempts"];

        if (remainingAttempts > 0) {
          return this._authenticateUsingSmsCode(challengeId, {
            remainingAttempts: remainingAttempts
          });
        } else {
          throw new Error("Couldn't connect to Robinhood API: Invalid SMS code.");
        }
      } else {
        return data;
      }
    };

    return Controller;
  }();

  var controller = new Controller({
    credentials: {
      username: window.ROBINHOOD_USERNAME_,
      password: window.ROBINHOOD_PASSWORD_
    },
    services: {
      CacheService: CacheService,
      SpreadsheetApp: SpreadsheetApp,
      UrlFetchApp: UrlFetchApp
    }
  });
  function ROBINHOOD_GET_ORDERS() {
    controller.connectToApi();
    return controller.getOrders();
  }
  function onOpen() {// ...
  }

  exports.ROBINHOOD_GET_ORDERS = ROBINHOOD_GET_ORDERS;
  exports.onOpen = onOpen;

}(this.window = this.window || {}));
