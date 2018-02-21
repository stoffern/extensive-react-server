const path = require("path");
const Server = require("../../src");
const { BasicStrategy, DigestStrategy } = require("passport-http");

var server = new Server({
  environment: "production"
});

server.addPassportStrategy(
  new BasicStrategy((username, password, done) => {
    if (username == "test" && password == "tester")
      done(null, { username: username, password: password });
    else done(null, false);
  })
);

const route = server.addReactRoute(
  "", //Route prefix
  path.resolve(process.cwd(), "app/Routes.js"), //Path to react app, must return a found router..
  {
    entry: [
      "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=false&quiet=false&noInfo=false",
      "react-hot-loader/patch",
      path.resolve(process.cwd(), "../../src/utils/client-render")
    ]
  }, // YOU DONT NEED THIS (ONLY IN USE FOR THIS EXAMPLE TO RUN)
  { entry: path.resolve(process.cwd(), "../../src/utils/server-render") } // YOU DONT NEED THIS (ONLY IN USE FOR THIS EXAMPLE TO RUN)
);

route.addAuthentication((passport, ctx, next) => {
  console.log("auth");
  console.log(passport);
  console.log(ctx);

  passport.authenticate("basic", (err, user, info) => {
    console.log("auth2");
    console.log(user);
    if (user) ctx.login(user);
    else ctx.logout();
  })(ctx, next);

  if (!ctx.isAuthenticated()) {
    ctx.status = 404;
    ctx.body = "USER NOT FOUND";
  }
});

server.start();
