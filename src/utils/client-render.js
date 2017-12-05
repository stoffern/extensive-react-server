import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";

import { createClientRouter, createClientResolver } from "./Router";

async function render(createRouter) {
  const resolver = createClientResolver();
  const Router = await createRouter(resolver);
  ReactDOM.hydrate(
    <AppContainer>
      <Router resolver={resolver} />
    </AppContainer>,
    document.getElementById("root")
  );
}

if (process.env.NODE_ENV === "development" && true) {
  module.hot.accept("./Router.js", () => {
    render(require("./Router").createClientRouter);
  });
}

render(createClientRouter);
