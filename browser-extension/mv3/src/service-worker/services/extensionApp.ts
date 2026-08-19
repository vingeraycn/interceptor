const LOCAL_APP_ROUTE = "index.html#/home";

export const initExtensionApp = (): void => {
  chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL(LOCAL_APP_ROUTE) });
  });
};
