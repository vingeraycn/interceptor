// @ts-ignore
import config from "../../config/dist/config.build.json";

export interface ExtensionConfig {
  browser: "chrome" | "firefox" | "edge";
  storageType: "sync" | "local";
  contextMenuContexts: chrome.contextMenus.ContextType[];
  env: "local" | "beta" | "prod";
  WEB_URL: string;
  OTHER_WEB_URLS?: string[];
  logLevel: "debug" | "info";
  LANDING_PAGE_BASE_URL: string;
}

const isEmbeddedAppRuntime = (): boolean => {
  if (config.browser !== "chrome" || typeof chrome === "undefined" || !chrome.runtime?.getManifest) {
    return false;
  }

  return !chrome.runtime.getManifest().action?.default_popup;
};

export const getAppUrl = (path = ""): string => {
  if (!isEmbeddedAppRuntime()) {
    return `${config.WEB_URL}${path}`;
  }

  const routePath = path.startsWith("/") ? path : `/${path}`;
  return `${chrome.runtime.getURL("index.html")}#${routePath}`;
};

export const getAppOrigin = (): string => {
  return new URL(getAppUrl()).origin;
};

export default config as ExtensionConfig;
