function enable() {
  global.UrlFetchApp = {
    fetch(url, opts) {
      return {
        getResponseCode() {
          return 200;
        },
        getContentText() {
          return JSON.stringify({});
        }
      };
    }
  };

  global.Utilities = {
    sleep(duration) {}
  };
}

function disable() {
  delete global.UrlFetchApp;
  delete global.Utilities;
}

module.exports = { enable, disable };
