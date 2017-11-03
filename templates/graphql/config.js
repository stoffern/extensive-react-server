const path = require('path');

module.exports ={
  url: '/graphql', 
  schema: path.resolve(process.cwd(), 'graphql','schema.js'),
  graphiql: true,
}