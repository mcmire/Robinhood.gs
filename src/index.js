import Controller from "./Controller";

const controller = new Controller({
  credentials: {
    username: window.ROBINHOOD_USERNAME_,
    password: window.ROBINHOOD_PASSWORD_
  },
  services: { CacheService, SpreadsheetApp, UrlFetchApp }
});

export function ROBINHOOD_GET_ORDERS() {
  return controller.getOrders();
}

export function onOpen() {
  // ...
}
