//
//Example custom route
//
module.exports = router => {
  router.get(
    '/hello',
    (ctx, next) => {
      ctx.body = `Hello world!`
      return next()
    }
  )
};
