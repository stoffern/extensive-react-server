const path = require("path");
const Server = require("../../src");
const { BasicStrategy, DigestStrategy } = require("passport-http");

var server = new Server({
  environment: "development"
});

/**
 * ADD STRATEGY
 */
server.addPassportStrategy(
  new BasicStrategy((username, password, done) => {
    if (username == "test" && password == "tester")
      done(null, { username: username, password: password });
    else done(null, false);
  })
);

/**
 * ADD ROUTES
 */
const route = server.addReactRoute(
  "", //Route prefix
  path.resolve(process.cwd(), "app/Routes.js") //Path to react app, must return a found router..
);

var staticRoute = server.addStaticFile(
  path.resolve(process.cwd(), "static", "hello.txt")
);
var staticRoute2 = server.addStaticFolder(
  path.resolve(process.cwd(), "static"),
  "/public"
);

/**
 * ADD AUTHENTICATION
 */
route.addAuthentication((passport, ctx, next) => {
  passport.authenticate("basic", (err, user, info) => {
    if (user) ctx.login(user);
    else ctx.logout();
  })(ctx, next);

  if (!ctx.isAuthenticated()) {
    ctx.status = 404;
    ctx.body = "USER NOT FOUND";
  }
});

staticRoute2.addAuthentication((passport, ctx, next) => {
  return passport.authenticate("basic", { session: false })(ctx, next);
});

server.start();
