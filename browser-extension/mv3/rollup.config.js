import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import terser from "@rollup/plugin-terser";
import nodeResolve from "@rollup/plugin-node-resolve";
import { version } from "./package.json";
import { browser, WEB_URL, OTHER_WEB_URLS } from "../config/dist/config.build.json";

const OUTPUT_DIR = "dist";
const isProductionBuildMode = process.env.BUILD_MODE === "production";
const isEmbeddedAppBuild = process.env.EMBED_APP === "true";

const generateUrlPattern = (urlString, includePort = true) => {
  try {
    const webUrlObj = new URL(urlString);
    if (includePort) {
      return `${webUrlObj.protocol}//${webUrlObj.host}/*`;
    } else {
      // host must not include port number for firefox, safari
      // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
      return `${webUrlObj.protocol}//${webUrlObj.hostname}/*`;
    }
  } catch (error) {
    console.error(`Invalid URL: ${urlString}`, error);
    return null;
  }
};

const processManifest = (content) => {
  const manifestJson = JSON.parse(content);

  manifestJson.version = version;
  manifestJson.version_name = version;

  const { content_scripts: contentScripts } = manifestJson;

  const webURLPatterns = [WEB_URL, ...OTHER_WEB_URLS]
    .map((pattern) => generateUrlPattern(pattern, browser === "chrome"))
    .filter((pattern) => !!pattern); // remove null entries

  contentScripts[0].matches = webURLPatterns;
  contentScripts[1].exclude_matches = webURLPatterns;

  if (isEmbeddedAppBuild) {
    delete manifestJson.action.default_popup;
    manifestJson.content_security_policy.extension_pages = manifestJson.content_security_policy.extension_pages.replace(
      "script-src 'self'",
      "script-src 'self' 'wasm-unsafe-eval'"
    );
  }

  if (!isProductionBuildMode) {
    manifestJson.commands = {
      ...manifestJson.commands,
      reload: {
        description: "Reload extension in development mode",
        suggested_key: {
          default: "Alt+T",
        },
      },
    };

    if (manifestJson.externally_connectable?.matches) {
      // Dev/beta-only LTS test origins — never shipped to production (this whole block is gated on
      // !isProductionBuildMode). The local harness and the local LTS page connect over http.
      manifestJson.externally_connectable.matches.push("http://localhost:3099/*");
      manifestJson.externally_connectable.matches.push("http://load-local.bsstag.com/*");
    }
  }

  return JSON.stringify(manifestJson, null, 2);
};

const commonPlugins = [typescript(), json()];
const copyTargets = [
  { src: "resources", dest: OUTPUT_DIR },
  { src: "_locales", dest: OUTPUT_DIR },
  {
    src: `src/manifest.${browser}.json`,
    dest: OUTPUT_DIR,
    rename: "manifest.json",
    transform: processManifest,
  },
  {
    src: "node_modules/@requestly/web-sdk/dist/requestly-web-sdk.js",
    dest: `${OUTPUT_DIR}/libs`,
  },
  { src: "../common/dist/devtools", dest: OUTPUT_DIR },
  { src: "../common/dist/popup", dest: OUTPUT_DIR },
  { src: "../common/dist/sidepanel", dest: OUTPUT_DIR },
  { src: "../common/dist/lib/customElements.js", dest: `${OUTPUT_DIR}/libs` },
];

if (isEmbeddedAppBuild) {
  copyTargets.push(
    {
      src: "../../app/build/index.html",
      dest: OUTPUT_DIR,
      transform: (content) =>
        content
          .toString()
          .replace('href="/manifest.json"', 'href="/app-manifest.json"')
          .replace('href="./manifest.json"', 'href="./app-manifest.json"'),
    },
    { src: "../../app/build/assets", dest: OUTPUT_DIR },
    { src: "../../app/build/desktop", dest: OUTPUT_DIR },
    { src: "../../app/build/firefox", dest: OUTPUT_DIR },
    { src: "../../app/build/favicon.png", dest: OUTPUT_DIR },
    { src: "../../app/build/manifest.json", dest: OUTPUT_DIR, rename: "app-manifest.json" },
    { src: "../../app/build/sessionBearFavicon.png", dest: OUTPUT_DIR },
    { src: "../../app/build/sessionBear_lg.svg", dest: OUTPUT_DIR },
    { src: "../../app/build/tree-sitter-bash.wasm", dest: OUTPUT_DIR },
    { src: "../../app/build/tree-sitter.wasm", dest: OUTPUT_DIR }
  );
}

const commonConfig = {
  // https://github.com/vitejs/vite-plugin-react/pull/144
  onwarn(warning, defaultHandler) {
    // console.log({warning});
    if (warning.code === "MODULE_LEVEL_DIRECTIVE" && warning.message.includes("use client")) {
      return;
    } else {
      defaultHandler(warning);
    }
  },
};

if (isProductionBuildMode) {
  commonPlugins.push(terser());
}

export default [
  {
    ...commonConfig,
    input: "src/service-worker/index.ts",
    output: {
      file: `${OUTPUT_DIR}/serviceWorker.js`,
      format: "iife",
    },
    plugins: [
      nodeResolve(),
      ...commonPlugins,
      copy({
        targets: copyTargets,
      }),
    ],
  },
  {
    ...commonConfig,
    input: "src/content-scripts/app/index.ts",
    output: {
      file: `${OUTPUT_DIR}/app.cs.js`,
      format: "iife",
    },
    plugins: commonPlugins,
  },
  {
    ...commonConfig,
    input: "src/content-scripts/client/index.ts",
    output: {
      file: `${OUTPUT_DIR}/client.cs.js`,
      format: "iife",
    },
    plugins: commonPlugins,
  },
  {
    ...commonConfig,
    input: "src/page-scripts/sessionRecorderHelper.js",
    output: {
      file: `${OUTPUT_DIR}/page-scripts/sessionRecorderHelper.ps.js`,
      format: "iife",
    },
    plugins: commonPlugins,
  },
  {
    ...commonConfig,
    input: "src/page-scripts/ajaxRequestInterceptor/index.js",
    output: {
      file: `${OUTPUT_DIR}/page-scripts/ajaxRequestInterceptor.ps.js`,
      format: "iife",
    },
    plugins: commonPlugins,
  },
  {
    ...commonConfig,
    // Network Interceptor v2 body capture. Uses the global Requestly.Network (web-sdk UMD injected
    // separately), so no npm deps to resolve — commonPlugins (no nodeResolve) is sufficient.
    input: "src/page-scripts/networkBodyRecorder.js",
    output: {
      file: `${OUTPUT_DIR}/page-scripts/networkBodyRecorder.ps.js`,
      format: "iife",
    },
    plugins: commonPlugins,
  },
];
