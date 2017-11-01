# universal-app
[![Travis](https://img.shields.io/travis/stoffern/universal-app.svg)](https://travis-ci.org/stoffern/universal-app)

Universal app - used with universal-app-cli

### Getting started
```js
$ npm i -g universal-app-cli
$ ua new myApp
$ ua run
```


### Todo:
- [ ] Add Graphql module
- [x] Add passport module
-[] Add Relay module


### Adding GraphQL
```js
$ ua add graphql
```
Files that is added and need edit:
```js
config/graphql.js
routes/graphql.js
```

### Adding Passport
```js
$ ua add passport
```
Files that is added and need edit:
```js
config/passport.js
routes/passport/index.js
```