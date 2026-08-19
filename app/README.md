# UI Application

Front-end application which provides UI to manage rules, mocks, SessionBooks, user profile and workspaces.

It currently supports three modes:

1. Browser Extension - when website is opened in a browser where Requestly extension is installed
2. Desktop Mode - when Requestly desktop application is launched
3. Remote - when account is connected to a mobile application

## Install

Please make sure that Node version >= 18.18.0 is installed on your system.

```sh
npm install
```

## Build & Run Locally

### Prerequisite - Build and Install Local Extension

Some features require the Requestly Extension to be installed. Follow the steps below to build and install the extension
https://github.com/requestly/interceptor/blob/master/browser-extension/mv3/README.md

### Build WebApp

```
npm run start
```

The application will start running at http://localhost:3000.

By default, the local application communicates to our dev Firebase server.

`npm run start` builds the shared package before starting Vite. Use `npm run start:watch` only when you are also editing `shared` and need its watch process.

The browser extension to be used should be built using local environment configuration. Follow [guide](/browser-extension/mv3/README.md).

### Local-only rule authoring

This fork enables `VITE_LOCAL_MODE=true` by default. In this mode, rule upload/import and rule saving use the browser extension's local storage without requiring a Requestly account. Account, workspace, plan, and invitation controls are hidden from the local Web App.

The mode does not fabricate a Firebase user or bypass authentication for cloud-only features. To use the local rule workflow on another computer:

1. Clone this fork and install the repository dependencies.
2. Build the browser extension with `ENV=local`.
3. Load `browser-extension/mv3/dist` as an unpacked Chrome extension.
4. Start the Web App with `npm run start` from `app`.
5. Open `http://localhost:3000`.
