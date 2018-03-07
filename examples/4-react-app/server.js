const path = require("path");
const Server = require("../../src");
var server = new Server({
  environment: "development"
}); // create a new instance

async function start() {
  const mainRoute = server.addReactRoute(
    "",
    path.resolve(process.cwd(), "app/Routes.js")
  );

  await server.start(); //start server
  console.log("started");
}

start();
