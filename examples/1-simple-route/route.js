var graphqlHTTP = require('koa-graphql');
var convert = require('koa-convert');

module.exports = async (router, app, config) => {
  router.get('/test', (ctx, next) => {
    ctx.status = 200;
    ctx.body = "hello world (GET request)"
    next()
  })

  router.post('/test', (ctx, next) => {
    ctx.status = 200;
    ctx.body = "hello world (POST request)"
    next()
  })
};
