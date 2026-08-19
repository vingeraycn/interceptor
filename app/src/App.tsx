import { RouterProvider, createBrowserRouter, createHashRouter } from "react-router-dom";
import { routesV2 } from "routes";
import * as Sentry from "@sentry/react";

declare global {
  namespace globalThis {
    var globalUnhandledRejectionHandlers: Set<(event: PromiseRejectionEvent) => void>;
  }
}

/** Common things which do not depend on routes for App **/
const App = () => {
  const router =
    window.location.protocol === "chrome-extension:"
      ? Sentry.wrapCreateBrowserRouterV6(createHashRouter)(routesV2)
      : Sentry.wrapCreateBrowserRouterV6(createBrowserRouter)(routesV2);

  return <RouterProvider router={router} />;
};

export default App;
