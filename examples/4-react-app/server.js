const path = require("path");
const Server = require("../../src");
console.log(Server);
var server = new Server(); // create a new instance

const mainRoute = server.addReactRoute(
  "", //Route prefix
  path.resolve(process.cwd(), "app/Routes.js"), // path to app file
  {
    entry: [
      "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=false&quiet=false&noInfo=false",
      "react-hot-loader/patch",
      path.resolve(process.cwd(), "../../src/utils/client-render")
    ]
  }, // YOU DONT NEED THIS (ONLY IN USE FOR THIS EXAMPLE TO RUN)
  { entry: path.resolve(process.cwd(), "../../src/utils/server-render") } // YOU DONT NEED THIS (ONLY IN USE FOR THIS EXAMPLE TO RUN)
);

server.start(); //start server
