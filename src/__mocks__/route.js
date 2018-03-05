module.exports = async (router, app, config) => {
  router.get("/test", (ctx, next) => {
    ctx.status = 200;
    ctx.body = { res: "ok" };
    next();
  });
};
