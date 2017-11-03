# universal-app

[![Greenkeeper badge](https://badges.greenkeeper.io/stoffern/universal-app.svg)](https://greenkeeper.io/)
[![Travis](https://img.shields.io/travis/stoffern/universal-app.svg)](https://travis-ci.org/stoffern/universal-app)

Extensible server for hosting a React universal app(Isomorpic) with support for [Graphql](https://github.com/facebook/graphql), [Relay](https://github.com/facebook/relay), [Passport](https://github.com/jaredhanson/passport), and the option to customize own routes, and setup.

## Why?
All these boilerplates, starter-kits and different ways to setup, no standards for forlder structuring, file setups etc.
Here is a all in one package for hosting [hot](https://github.com/glenjamin/webpack-hot-middleware) development and a productionready environment on a single command. Shared React state, Redux state, Relay Environement is also available.


## Table of Contents
- [Getting started](#getting-started)
- [Folder structure](#folder-structure)
- [Adding modules](#api)
  * [Adding GraphQL](#adding-graphQL)
  * [Adding Passport](#adding-passport)
- [TODO](#todo)


## Getting started
```js
$ npm i -g universal-app-cli
$ ua new myApp
$ ua run
```

## Folder structure
```js
app/        //React application
config/     //Configuration files that are loaded, feel free to create own.
routes/     //Add custom routes
```

## Adding modules
There is possible to add predefined setups for different modules.
Right now only GraphQL and Passport is possible. Read more about how to add them and edit them here:
- [Adding GraphQL](#adding-graphQL)
- [Adding Passport](#adding-passport)


## Adding GraphQL
```js
$ ua add graphql
```
Files that is added and need edit:
```js
config/graphql.js
routes/graphql.js
```

## Adding Passport
```js
$ ua add passport
```
Files that is added and need edit:
```js
config/passport.js
routes/passport/index.js
```

## Todo:
- [x] Move installation as a dependency installation
- [x] Add Graphql module
- [x] Add passport module
- [ ] Add Relay module