const path = require("path");
const Server = require("../../src");
var server = new Server(); // create a new instance

const mainRoute = server.addReactRoute(
  "",
  path.resolve(process.cwd(), "app/Routes.js")
);

server.start(); //start server
