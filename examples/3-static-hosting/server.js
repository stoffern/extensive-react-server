const path = require("path");
const Server = require("../../src");

var server = new Server({
  environment: process.env.NODE_ENV || "development",
  hostname: process.env.HOSTNAME || "localhost",
  port: process.env.PORT || 3000
});

//just add a file or a folder
let route = server.addStaticFile(path.resolve(process.cwd(), "hello.txt"));

//serve same file at /hereto.txt
let route2 = server.addStaticFile(
  path.resolve(process.cwd(), "hello.txt"),
  "/hereto.txt"
);

//Serve folder on /public
let routeFolder = server.addStaticFolder(
  path.resolve(process.cwd(), "static"),
  "/public"
);

//start server
server.start();
