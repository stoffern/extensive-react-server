# extensive-react-server

[![Greenkeeper badge](https://badges.greenkeeper.io/stoffern/extensive-react-server.svg)](https://greenkeeper.io/)
[![Travis](https://img.shields.io/travis/stoffern/extensive-react-server.svg)](https://travis-ci.org/stoffern/extensive-react-server)
[![npm](https://img.shields.io/npm/dt/extensive-react-server.svg)](https://www.npmjs.com/package/extensive-react-server)
[![npm](https://img.shields.io/npm/v/extensive-react-server.svg)](https://www.npmjs.com/package/extensive-react-server)

Extensible server for hosting a React universal apps(Isomorpic). Host one or more apps, with or without authentication. Supports: [Graphql](https://github.com/facebook/graphql), [Relay](https://github.com/facebook/relay), [Passport](https://github.com/jaredhanson/passport), Webpack, HotReloading, custom webpack configs for every route, custom routes ++

## Why?
Boilerplates, startup-kits, setup server, webpack, hot reloading +++ its a jungle!!

`extensive-react-server` has support for everything out of the box, and you can get up and running with 3 lines of code.


## Table of Contents
- [Installation](#installation)
- [Getting started](#getting-started)
- [TODO](#todo)
- [Thanks to](#thanks-to)


## Installation
```js
$ npm i -S extensive-react-server
or
$ yarn add extensive-react-server
```

## Getting started
Create a awsome react app `app/Routes.js`: 
```js
import makeRouteConfig from "found/lib/makeRouteConfig";

export default makeRouteConfig(
  <Route
    path="/"
    Component={() => <div>Main</div>)}
  >
    <Route
      path="cool"
      Component={() => <div>Cool</div>} 
    />
    <Route
      path="foo"
      Component={() => <div>Foo</div>} 
    />
    <Redirect
      from="baz"
      to="/foo" />
  </Route>
);
```
Remember you must return a found `makeRouteConfig`.

Create a new file `server.js` with contents:
```js
const ExtensiveReactServer = require('extensive-react-server')

var server = new ExtensiveReactServer({
  environment: 'development',
  hostname: 'localhost',
  port: 3000,
});

//To add a file or a folder with routes?
server.addRoute('routes/');

//To add a React app with serverside render support
server.addReactRoute(
  '',   // URI prefix
  path.resolve(process.cwd(), 'app/Routes.js'), //path to APP file
);

//Start server!
server.start();
```

Create a `.babelrc` file for your needs:
```js
{
  "presets": [
    "env",
    "react",
    "stage-0",
    "stage-2"
  ],
  "plugins": [
    "transform-runtime"
  ],
  "env": {
    "development": {
      "plugins": ["react-hot-loader/babel"]
    }
  }
}
```

Run the server:`node server.js`
Good luck!


## Features
- [koa](https://github.com/koajs/koa) - Koa server, why? its [faster than express](https://raygun.com/blog/node-js-performance-2017/) 
- [koa-compress](https://github.com/koajs/compress) - zlib compressing
- [koa-etags](https://github.com/koajs/etag) - support for etags
- [koa-helmet](https://www.npmjs.com/package/koa-helmet) - header/content security
- [koa-logger](https://github.com/koajs/logger) - development logging
- [kcors](https://github.com/koajs/cors) - Cross-Origin Resource Sharing(CORS)
- [passport](http://www.passportjs.org/) - authentication layer
- [ddos](https://github.com/rook2pawn/node-ddos) - dos/ddos protection
- [webpack](https://webpack.js.org/) - module bundler
- [react-hot-loader](https://github.com/gaearon/react-hot-loader) - Tweak React components in real time
- [webpack-hot-middleware](https://github.com/glenjamin/webpack-hot-middleware) - Webpack hot reloading


## Todo:
- [x] Add support for custom routes
- [x] Add support for multiple React apps with serverside render (SSR)
- [ ] Allow middleware for react paths (example: authentication)
- [ ] Add support for Relay
- [ ] Add support for custom index.html file for SSR
- [ ] Create more examples
- [ ] Better documentation


## Thanks to:
- [jkettmann](https://github.com/jkettmann) for a good startupkit