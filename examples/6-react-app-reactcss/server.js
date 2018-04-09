const path = require("path");
const EReactServer = require("../../src");

var server = new EReactServer({});
const route = server.addReactRoute(
  "",
  path.resolve(process.cwd(), "app/Routes.js")
);

server.start();
