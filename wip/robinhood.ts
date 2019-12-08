/**
 * Google Apps Script custom functions that retrieve stock and options data from
 * the Robinhood API and return data in a tabular format for use in Google Sheets.
 *
 * Replace `robinhoodUsername` and `robinhoodPassword` with your own Robinhood credentials.
 *
 * Latest version: https://github.com/rghuckins/robinhood-google-sheets/blob/master/robinhood.gs
 */

// ---- NEW ----
var robinhoodUsername = 'mcmire';
var robinhoodPassword = 'l446o(m_zE4gu&Dd';
var accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJleHAiOjE1NzU4NTg0MTUsInRva2VuIjoiTThiVE1scHRndWJoNlVjT2dEVDRQSUpFdzRFbmtQIiwidXNlcl9pZCI6IjViZjJmODUyLWQ3ZWYtNDQ2ZC05ODU4LWJiNjE1ZGE3Y2ZjOCIsImRldmljZV9oYXNoIjoiYzA5NmExOGY2MjMwZTM5NmJmY2ZlZWQzMjg4Njc2N2QiLCJzY29wZSI6ImludGVybmFsIiwidXNlcl9vcmlnaW4iOiJVUyIsIm9wdGlvbnMiOmZhbHNlLCJsZXZlbDJfYWNjZXNzIjp0cnVlfQ.O_EryxImoczogYnae3YgkE5VUPo8egY9oaTV2dLEVoJ20_1s-6Ci5F1nBPlwAezXeMe_erSEU6b1Gv4m3OHAuYOcZ2zR6fbVq5kLayWW0q5fzUZJ9wvR0bmvinSopPz_9ob9opKRt964QES15FJWxbvqLSuDs_d5PEvOeHRNZcPGVfHJPIDS_VdaqEvmJ59jWxcXHgf4nfGsoMTDuQgmlbteUxgMF3btElocTpU6pDyvRDcHGr2OS0SpgZFv3yVYgCoHZosgabrmCT-5V8zCbzNeekJkOuovjGjclIVa_LMkHqnPrVurfjX8l3056V57KOQe1r0B4zac81DdnCvjHw";

var robinhoodApiBaseUrl = 'https://api.robinhood.com';
var robinhoodApiUriMap = {
  acats: '/acats/',  // ---- NEW ----
  accounts: '/accounts/',
  achTransfers: '/ach/transfers/',
  dividends: '/dividends/',
  documents: '/documents/',
  marketData: '/marketdata/options/?instruments=',
  optionsOrders: '/options/orders/',
  optionsPositions: '/options/positions/',
  orders: '/orders/',
  portfolios: '/portfolios/',
  positions: '/positions/',
  watchlist: '/watchlists/Default/'
};

function makeJsonRequest_(method, path, payload) {
  var response = UrlFetchApp.fetch(
    robinhoodApiBaseUrl + path,
    {
      method: method,
      payload: payload,
      muteHttpExceptions: true
    }
  );

  if (response.getResponseCode() >= 400) {
    throw new Error(
      "Error making " +
      method +
      " request to " +
      url +
      ": " +
      response.getContentText()
    );
  } else {
    return JSON.parse(response.getContentText());
  }
}

/**
 * Get a "classic" Robinhood auth token using your username and password.
 */

// NOTE: This is old and will not work
// See <https://github.com/Jamonek/Robinhood/issues/176> for how to do this
// Here are the curl commands:

// curl -v -X POST -H "Accept: application/json" -H "Content-Type: application/json" -d '{"username": "mcmire", "password": "l446o(m_zE4gu&Dd", "grant_type": "password", "scope": "internal", "client_id": "c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS", "expires_in": 86400, "device_token": "ec79ec78-a0e4-456a-9897-9a58ab8c6bee", "challenge_type": "sms"}' https://api.robinhood.com/oauth2/token/
// -> this will give you a challenge id and send you an SMS message
// curl -v -X POST -H "Accept: application/json" -H "Content-Type: application/json" -d '{"response": "182027"}' https://api.robinhood.com/challenge/a2c79e67-58bc-46ff-9643-42b53c1f7acc/respond/
// -> check status, if it's "validated" you're good to go — now reuse the challenge id
// curl -v -X POST -H "Accept: application/json" -H "Content-Type: application/json" -H "X-Robinhood-Challenge-Response-ID: a2c79e67-58bc-46ff-9643-42b53c1f7acc" -d '{"username": "mcmire", "password": "l446o(m_zE4gu&Dd", "grant_type": "password", "scope": "internal", "client_id": "c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS", "expires_in": 86400, "device_token": "ec79ec78-a0e4-456a-9897-9a58ab8c6bee", "challenge_type": "sms"}' https://api.robinhood.com/oauth2/token/
// -> this spits out an access_token, paste it above as accessToken

function getAccessToken_() {
  var url = robinhoodApiBaseUrl + '/oauth2/token/';
  var payload = {
    'grant_type': "password",
    'scope': "internal",
    'client_id': "c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS",
    'username': robinhoodUsername,
    'password': robinhoodPassword
  };
  var options = {
    'method': 'post',
    'payload': payload,
    'muteHttpExceptions': true
  };
  var response = UrlFetchApp.fetch(url, options);
  var responseJson = JSON.parse(response.getContentText());
  var accessToken = responseJson.access_token;
  return accessToken;
}

/**
 * Get an OAuth2 short-lived access token from the script cache, or fetch
 * from the Robinhood API and add the token to the cache.
 */
function getOAuthToken_() {
  var cache = CacheService.getScriptCache();
  var accessToken = cache.get('accessToken');
  if (accessToken !== "undefined") {
    Logger.log('Retrieving old access token: ' + accessToken);
    return accessToken;
  }
  var accessToken = getAccessToken_();

  if (accessToken == null) {
    throw "Couldn't authenticate Robinhood: Couldn't find an access token?";
  }

  cache.put('accessToken', accessToken);
  return accessToken;
}

/**
 * Robinhood API client.
 *
 * If the Robinhood API is made public, this client will
 * handle the OAuth2 dance and refresh token flow appropriately.
 */
function apiClient_() {
  this.get = function(url) {
    var options = {
      'method': 'get',
      'muteHttpExceptions': true,
      'headers': {
        'Authorization': 'Bearer ' + accessToken
      }
    };
    try {
      var response = UrlFetchApp.fetch(url, options);
    } catch (err) {
      Utilities.sleep(3000);
      var response = UrlFetchApp.fetch(url, options);
      // Try again after 3 seconds. If sleeping doesn't help, don't catch the error
    }
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();
    if (responseCode !== 200) {
      throw new Error('Robinhood API request (' + url + ') failed. ' + responseCode + ': ' + responseText);
    }
    var responseJson = JSON.parse(responseText);
    return responseJson;
  };

  this.pagedGet = function(url) {
    var responseJson = this.get(url);
    var results = responseJson.results;
    var nextUrl = responseJson.next;
    while (nextUrl) {
      responseJson = this.get(nextUrl);
      results.push.apply(results, responseJson.results);
      nextUrl = responseJson.next;
    }
    return results;
  };
}

/**
 * Recursively unpack/flatten a (potentially) nested result from a Robinhood API endpoint list response.
 *
 * e.g. GET https://api.robinhood.com/positions/
 * "results": [
 *    {
 *       "shares_held_for_stock_grants": "0.0000",
 *       "account": "https://api.robinhood.com/accounts/<foo>/",
 *       "pending_average_buy_price": "0.0000",
 *       "shares_held_for_options_events": "0.0000",
 *       "intraday_average_buy_price": "0.0000",
 *       "url": "https://api.robinhood.com/positions/<foo>/e6a6e495-3db9-4129-8baf-50d4247b1d9c/",
 *       "shares_held_for_options_collateral": "0.0000",
 *       "created_at": "2016-05-13T05:47:26.756367Z",
 *       "updated_at": "2017-01-26T19:02:49.066776Z",
 *       "shares_held_for_buys": "0.0000",
 *       "average_buy_price": "89.4400",
 *       "instrument": "https://api.robinhood.com/instruments/e6a6e495-3db9-4129-8baf-50d4247b1d9c/",
 *       "intraday_quantity": "0.0000",
 *       "shares_held_for_sells": "0.0000",
 *       "shares_pending_from_options_events": "0.0000",
 *       "quantity": "0.0000"
 *    },
 *    ...
 * ]
 *
 * Additionally, this function recursively gets hyperlinked related entities (e.g. `instrument` in the
 * above example) and adds keys/values of the related result to the final flattened object until our
 * stop condition is met -- all hyperlinked related entities specified are already fetched.
 *
 * This function does not return but modifies the final flattened object passed to the function in place.
 */
function flattenResult_(result, flattenedResult, hyperlinkedFields, endpoint) {
  for (var key in result) {
    if (result.hasOwnProperty(key)) {
      var value = result[key];
      if (hyperlinkedFields.indexOf(key) >= 0) {
        if (key === 'option') {
          endpoint = 'marketData';
          var url = robinhoodApiBaseUrl + robinhoodApiUriMap[endpoint] + value;
          var responseJson = apiClient.get(url);
          flattenResult_(responseJson.results[0], flattenedResult, hyperlinkedFields, endpoint);
        }
        var responseJson = apiClient.get(value);
        hyperlinkedFields.splice(hyperlinkedFields.indexOf(key), 1);
        flattenResult_(responseJson, flattenedResult, hyperlinkedFields, key);
      } else if (value === Object(value) && !Array.isArray(value)) {
        flattenResult_(value, flattenedResult, hyperlinkedFields, endpoint);
      } else if (Array.isArray(value) && key !== 'executions') {
        // TODO: Handle field values that are arrays longer than one and "executions" fields.
        // It is hard to unpack these fields due to their unknown length. e.g. the `/options/orders/`
        // endpoint returns a "legs" field that likely contains multiple components and executions
        // if an options strategy contains multiple contracts.
        flattenResult_(value[0], flattenedResult, hyperlinkedFields, endpoint);
      } else {
        // Append our endpoint identifier to make duplicate keys unique
        var modifiedKey = key + '_' + endpoint;
        flattenedResult[modifiedKey] = value;
      }
    }
  }
}

/**
 * Iterate through all results of a Robinhood API endpoint list response and build
 * a two-dimensional array. Apps Script will use this array of values to populate
 * cells in a tabular format.
 */
function getRobinhoodData_(endpoint, hyperlinkedFields) {
  var data = [];
  var url = robinhoodApiBaseUrl + robinhoodApiUriMap[endpoint];
  var results = apiClient.pagedGet(url);
  for (var i = 0;  i < results.length; i++) {
    var flattenedResult = {};
    var hyperlinkedFieldsCopy = hyperlinkedFields.slice();
    flattenResult_(results[i], flattenedResult, hyperlinkedFieldsCopy, endpoint);
    if (!data.length) {
      // Add header column names (object keys) only once
      var keys = Object.keys(flattenedResult);
      data.push(keys);
    }
    // Add all object values
    var values = Object.keys(flattenedResult).map(function(key) { return flattenedResult[key]; });
    data.push(values);
  }
  return data;
}

/**
 * Instantiate Robinhood API client
 */
var apiClient = new apiClient_();

/**
 * Get `ACH transfers` data.
 * @customfunction
 */
function ROBINHOOD_GET_ACH_TRANSFERS(datetime) {
  return getRobinhoodData_('achTransfers', ['ach_relationship']);
}

/**
 * Get `dividends` data.
 * @customfunction
 */
function ROBINHOOD_GET_DIVIDENDS(datetime) {
  return getRobinhoodData_('dividends', ['instrument']);
}

/**
 * Get `documents` data. Download URLs for trade confirmations, account statements, and 1099s.
 * @customfunction
 */
function ROBINHOOD_GET_DOCUMENTS(datetime) {
  return getRobinhoodData_('documents', []);
}

/**
 * Get `options orders` data.
 * @customfunction
 */
function ROBINHOOD_GET_OPTIONS_ORDERS(datetime) {
  return getRobinhoodData_('optionsOrders', ['option']);
}

/**
 * Get current and past `options positions` data.
 * @customfunction
 */
function ROBINHOOD_GET_OPTIONS_POSITIONS(datetime) {
  return getRobinhoodData_('optionsPositions', ['option']);
}

/**
 * Get `stock orders` data.
 * @customfunction
 */
function ROBINHOOD_GET_ORDERS(datetime) {
  //return getRobinhoodData_('orders', ['instrument', 'position']);
  return getRobinhoodData_('orders', ['instrument']);
}

/**
 * Get `portfolios` data. Only one portfolio is returned (for now?).
 * @customfunction
 */
function ROBINHOOD_GET_PORTFOLIOS(datetime) {
  return getRobinhoodData_('portfolios', []);
}

/**
 * Get current and past `stocks positions` data.
 * @customfunction
 */
function ROBINHOOD_GET_POSITIONS(datetime) {
  return getRobinhoodData_('positions', ['instrument', 'fundamentals', 'quote']);
}

/**
 * Get `watchlist` data.
 * @customfunction
 */
function ROBINHOOD_GET_WATCHLIST(datetime) {
  return getRobinhoodData_('watchlist', ['instrument', 'fundamentals', 'quote']);
}

function refreshLastUpdate_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  spreadsheet.getSheetByName('Refresh').getRange('A1').setValue(new Date().toTimeString());
}

/**
 * TL;DR: Calling a `ROBINHOOD_GET` function _without_ changing the argument passed to function will _not_ return new data.
 * A `Refresh Data` custom menu item is created so that data can be refreshed.
 *
 * Apps Script custom functions are deterministic and will only recalculate if their arguments change. All `ROBINHOOD_GET`
 * functions have an optional `datetime` parameter so that the current datetime can be passed to the function in order to
 * force recalculation. A Google Sheets custom menu with a `Refresh Data` item is implemented so that a current datetime value
 * can be set in cell `Refresh!$A$1`. `ROBINHOOD_GET` functions that reference this cell will return non-cached, fresh results
 * when `Refresh Data` is clicked.
 * Stolen from https://stackoverflow.com/a/17347290.
 *
 * Example:
 * =ROBINHOOD_GET_POSITIONS(Refresh!$A$1)
 */
function onOpen() {
  var cache = CacheService.getScriptCache();
  cache.remove('accessToken');
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var refreshSheet = spreadsheet.getSheetByName('Refresh');
  if (refreshSheet === null) {
   refreshSheet = spreadsheet.insertSheet('Refresh');
  }
  var entries = [{ name: 'Refresh Data', functionName: 'refreshLastUpdate_' }];
  spreadsheet.addMenu('Refresh Data', entries);
}

// ---- ADDITIONS ----

function ROBINHOOD_GET_ACATS(datetime) {
  return getRobinhoodData_('acats', []);
}

function flattenValue_(value, links, outerKey) {
  if (Array.isArray(value)) {
    return flattenArray_(value, links, outerKey);
  } else if (isPlainObject_(value)) {
    return flattenObject_(value, links, outerKey);
  } else {
    return [value];
  }
}

function flattenArray_(array, links, outerKey) {
  return array.reduce(function (newArray, value, index) {
    var newKey = outerKey == null ? null : outerKey + "_" + index;
    return array.concat(flattenValue_(value, links, newKey));
  }, []);
}

function flattenObject_(object, outerKey) {
  var results = reduce_(object, function (result, value, key) {
    var newKey = outerKey == null ? key : outerKey + "_" + key;
    var flattenedValue = flattenValue_(value, links, newKey);

    /*
    if (hyperlinkedFields.indexOf(key) >= 0) {
        if (key === 'option') {
          endpoint = 'marketData';
          var url = robinhoodApiBaseUrl + robinhoodApiUriMap[endpoint] + value;
          var responseJson = apiClient.get(url);
          flattenResult_(responseJson.results[0], flattenedResult, hyperlinkedFields, endpoint);
        }
        var responseJson = apiClient.get(value);
        hyperlinkedFields.splice(hyperlinkedFields.indexOf(key), 1);
        flattenResult_(responseJson, flattenedResult, hyperlinkedFields, key);
    */

    if (Array.isArray(flattenedValue)) {
      result.collections.push({ key: newKey, value: flattenedValue });
    } else {
      return withKeyAndValue_(result.newObject, newKey, flattenedValue);
    }
  }, { arrayPairs: [], newObject: {} });

  // explode the object into a bunch of objects based on the collections inside
  return flatMap_(results.collections, function (collection) {
    return mergeObjects_(
      result.newObject,
      collection.value.slice(0, 10).reduce(function (o, value, index) {
        return withKeyAndValue_(
          o,
          collection.key + "_" + index,
          flattenValue_(value)
        );
      }, {})
    );
  });
}

function withKeyAndValue_(object, newKey, newValue) {
  var tmp = {};
  tmp[newKey] = newValue;
  return mergeObjects_(object, tmp);
}

function mergeObjects_(object1, object2) {
  var final = {};

  each_(object1, function (value, key) {
    final[key] = value;
  });

  each_(object2, function (value, key) {
    final[key] = value;
  });

  return final;
}

function reduce_(value, fn, memo) {
  each_(value, function (v, k) {
    memo[k] = fn(v, k);
  });
  return memo;
}

function each_(value, fn) {
  if (Array.isArray(value)) {
    for (var i = 0, len = value.length; i < len; i++) {
      fn(value, i);
    }
  } else if (isPlainObject_(value)) {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        fn(object[key], key);
      }
    }
  } else {
    throw new Error("Don't know how to iterate over value");
  }
}

function isPlainObject_(value) {
  return value === Object(value) && !Array.isArray(value);
}

// ---- TESTS ----

// See: <https://www.tothenew.com/blog/how-to-test-google-apps-script-using-qunit/>

QUnit.helpers(this);

function doGet(e) {
  QUnit.urlParams(e.parameter);
  QUnit.config({
    title: "QUnit for Google Apps Script - Test suite"
  });
  QUnit.load(function () {
    testFlattenObject_();
  });

  return QUnit.getHtml();
}

function testFlattenObject_() {
  QUnit.test("flattenObject", function () {
    expect(1);
    deepEqual({}, flattenObject_({}));
  })
}
