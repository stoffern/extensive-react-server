//
//Example custom route
//
module.exports = (app, router, config) => {
  router.get(
    '/hello',
    (ctx, next) => {
      ctx.body = `Hello world!`
      return next()
    }
  )
};
