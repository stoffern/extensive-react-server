const path = require("path");
const EReactServer = require("../../src");

var server = new EReactServer(); // create a new instance

server.addRoute("routes"); //add routes folder containing graphql

const route = server.addReactRoute(
  "", //Route prefix
  path.resolve(process.cwd(), "app/Routes.js") //Path to react app, must return a found router..
);

route.setGraphqlEnpoint("http://localhost:3000/graphql");

server.start(); //start server
