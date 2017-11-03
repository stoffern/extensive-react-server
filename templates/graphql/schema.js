var {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString
} = require('graphql');

var schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      hello: {
        type: GraphQLString,
        resolve: () => {
          return 'Hello world'
        }
      },
      serverTime: {
        type: GraphQLString,
        resolve: () => {
          return new Date()
        }
      }
    }
  })
});

module.exports = schema;