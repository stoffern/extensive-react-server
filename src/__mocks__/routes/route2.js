module.exports = async (router, app, config) => {
  router.get("/test2", (ctx, next) => {
    ctx.status = 200;
    ctx.body = { res: "ok" };
    next();
  });
};
