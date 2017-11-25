# extensive-react-server

[![Greenkeeper badge](https://badges.greenkeeper.io/stoffern/extensive-react-server.svg)](https://greenkeeper.io/)
[![Travis](https://img.shields.io/travis/stoffern/extensive-react-server.svg)](https://travis-ci.org/stoffern/extensive-react-server)
[![npm](https://img.shields.io/npm/dt/extensive-react-server.svg)](https://www.npmjs.com/package/extensive-react-server)
[![npm](https://img.shields.io/npm/v/extensive-react-server.svg)](https://www.npmjs.com/package/extensive-react-server)

Extensible server for hosting a React universal app(Isomorpic) with support for [Graphql](https://github.com/facebook/graphql), [Relay](https://github.com/facebook/relay), [Passport](https://github.com/jaredhanson/passport), and the option to customize own routes, and setup.

## Why?
All these boilerplates, starter-kits and different ways to setup, no standards for forlder structuring, file setups etc.
Here is a all in one package for hosting [hot](https://github.com/glenjamin/webpack-hot-middleware) development and a productionready environment on a single command. Shared React state, Redux state, Relay Environement is also available.


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


## Features
- [Koa](https://github.com/koajs/koa) - Koa server, 
- [Koa Compress](https://github.com/koajs/compress) - zlib compressing
- Koa etag
- Koa helmet
- Koa json
- Koa logger
- Koa passport
- [x] Add support for custom routes
- [ ] 


## Todo:
- [x] Add support for custom routes
- [x] Add support for multiple React apps with serverside render (SSR)
- [ ] Allow middleware for react paths (example: authentication)
- [ ] Add support for Relay
- [ ] Add support for custom index.html file for SSR
- [ ] Add
- [ ] Create more examples
- [ ] Better documentation


## Thanks to:
- [jkettmann](https://github.com/jkettmann) for a good startupkit