const path = require("path");
// const Server = require("@velop/server");
const Server = require("@velop/server");

var server = new Server();
server.addRoute("routes");
const route = server.addReactRoute(
  "",
  path.resolve(process.cwd(), "app/Routes.js")
);
route.setGraphqlEnpoint("http://localhost:3000/graphql");

server.start();
