import makeRouteConfig from 'found/lib/makeRouteConfig';
import Route from 'found/lib/Route';
import React from 'react';
import { graphql } from 'react-relay';

import Dashboard from './pages/Dashboard'

export default makeRouteConfig(
  <Route
    path="/"
    Component={Dashboard}
  >
  </Route>,
);