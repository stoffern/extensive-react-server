# velop-server

[![Greenkeeper badge](https://badges.greenkeeper.io/velop-io/server.svg?style=flat-square)](https://greenkeeper.io/)
[![Travis](https://img.shields.io/travis/velop-io/server.svg?style=flat-square)](https://travis-ci.org/velop-io/server)
[![npm](https://img.shields.io/npm/dt/%40velop-pkg%2Fserver.svg?style=flat-square)](https://www.npmjs.com/package/server)
[![npm](https://img.shields.io/npm/v/%40velop-pkg%2Fserver.svg?style=flat-square)](https://www.npmjs.com/package/server)
[![Coverage Status](https://coveralls.io/repos/github/velop-io/server/badge.svg?style=flat-square&branch=master)](https://coveralls.io/github/velop-io/server?branch=master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)


__Serve one or more React apps with one simple call.__ _Supports [Universal rendering](https://frontendmasters.com/courses/react-intro/what-is-universal-rendering/), [Webpack](https://webpack.js.org/), [HotReloading](https://webpack.js.org/concepts/hot-module-replacement/), [Relay](https://github.com/facebook/relay), [Passport](https://github.com/jaredhanson/passport), [FoundRouter](https://github.com/4Catalyzer/found), [Graphql](https://github.com/facebook/graphql) out of the box!
Fully editable setup with a simple set of functions and commands.
You can also add custom routes or static paths at your needs.
Even add a authentication layer on top of the routes or apps you what!
All this is possible with a simple set of functions._

## Why?
___This is not a standardization nor a boilerplate or startupkit.___ _This is a engine that can serve the js for you in the way you want. A developer should not put resources into setting up core server, only provide details of what they want to serve and how to do it. The rest will @velop/server take care of!_

## Why not Next.js?
NextJS is a great tool for creating a boilerplate setup that you can edit for your needs. Full cretid to [Zeit](https://github.com/zeit) for some awesome work! __But it has some core problems like [serving multiple apps](https://github.com/zeit/next.js/issues/257), [custom static folders](https://github.com/zeit/next.js/issues/3027), [authentication to routes](https://github.com/zeit/next.js/issues/153), or just serving other then react apps.__ @velop/server aims to solve these problems and with a more simple solution. Calling functions and not configuring files.

## Table of Contents
- [Installation](#installation)
- [Getting started](#getting-started)
- [TODO](#todo)
- [Thanks to](#thanks-to)


## Installation
```js
$ npm i -S @velop-pkg/server
or
$ yarn add @velop-pkg/server
```

## Getting started
Create a awsome react app `app/Routes.js` with [found](https://github.com/4Catalyzer/found) routing/navigation
Remember you must return a found `makeRouteConfig`.

Create a new file `server.js` with contents:
```js
const Server = require('@velop-pkg/server')

var server = new Server({
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
    "react",
    "stage-0"
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
- [graphql]() - GraphQL
- [relay]() - Relay
- [found]() - Found router
- [react-hot-loader](https://github.com/gaearon/react-hot-loader) - Tweak React components in real time
- [webpack-hot-middleware](https://github.com/glenjamin/webpack-hot-middleware) - Webpack hot reloading
- [winston]() - Winston logger


## Todo:
- [x] Add support for custom routes
- [x] Add support for multiple React apps with serverside render (SSR)
- [ ] Allow middleware for react paths (example: authentication)
- [x] Add support for Passport
- [x] Add support for Relay
- [x] Add support for custom index.html file for SSR
- [x] Create examples
- [x] Better documentation


## Thanks to:
- [taion](https://github.com/taion) for found router
- [sokra](https://github.com/sokra) for webpack
- [glenjamin](https://github.com/glenjamin) for webpack hot middleware
- [richardscarrott](https://github.com/richardscarrott) for webpack hot server middleware
- [jkettmann](https://github.com/jkettmann) for a good startupkit
and many more ++