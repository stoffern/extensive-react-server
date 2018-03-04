const path = require("path");
const EReactServer = require("../../src");

var server = new EReactServer(); // create a new instance

const route = server.addReactRoute(
  "", //Route prefix
  path.resolve(process.cwd(), "app/Routes.js") //Path to react app, must return a found router..
);

const route2 = server.addReactRoute(
  "/another-app", //Route prefix
  path.resolve(process.cwd(), "app/Routes.js") //Path to react app, must return a found router..
);

server.start(); //start server
