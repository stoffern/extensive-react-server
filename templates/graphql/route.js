var graphqlHTTP = require('koa-graphql');
var convert = require('koa-convert');

module.exports = async (app, router, config) => {
  var graphql = 
    convert(
      graphqlHTTP((request, context, all) => {
        return {
          schema: require(config.graphql.schema),
          graphiql: config.graphql.graphiql,
        };
      })
    )
  router.post( config.graphql.url, graphql);
  router.get( config.graphql.url, graphql);
};
