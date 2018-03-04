const path = require("path");
const Server = require("../../src");
console.log(Server);
var server = new Server({
  // environment: "production"
}); // create a new instance

const mainRoute = server.addReactRoute(
  "",
  path.resolve(process.cwd(), "app/Routes.js")
);

server.start(); //start server
