import graphqlHTTP from 'koa-graphql';
import convert from 'koa-convert';
import Schema from '../graphql';

//example
module.exports = router => {
  router.all(
    '/graphql',
    convert(
      graphqlHTTP((request, context, all) => {
        return {
          schema: Schema,
          graphiql: true,
          context: {
            // user: all.req.user,
          },
        };
      })
    )
  );
};
