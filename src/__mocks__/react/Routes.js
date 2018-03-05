import PropTypes from "prop-types";
import React from "react";
import { Link, Route, Redirect, makeRouteConfig } from "../../../src/router";

function LinkItem(props) {
  return (
    <li>
      <Link {...props} activeStyle={{ fontWeight: "bold" }} />
    </li>
  );
}

function App({ children }) {
  return (
    <div>
      <ul>
        <LinkItem to="/">Main</LinkItem>
        <ul>
          <LinkItem to="/foo">Foo</LinkItem>
          <LinkItem to="/foo2">Foo2</LinkItem>
        </ul>
      </ul>
      {children}
    </div>
  );
}

export default makeRouteConfig(
  <Route path="/" Component={App}>
    <Route Component={() => <div>Main</div>} />
    <Route path="foo" Component={() => <div>Foo</div>} />
    <Route path="foo2" Component={() => <div>Foo2</div>} />
  </Route>
);
