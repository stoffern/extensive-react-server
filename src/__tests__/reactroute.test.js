import request from "supertest";
import path from "path";
import Server from "../index.js";

describe("React routes", async () => {
  let server;
  let app;

  test("React app - development", async () => {
    server = new Server({ port: 3010 });

    const mainRoute = server.addReactRoute(
      "",
      path.resolve(process.cwd(), "src/__mocks__/react/Routes.js")
    );

    app = await server.start();

    await request(app)
      .get("/")
      .expect(200)
      .expect("hello world");

    // await request(app).get("/foo")
    // 	.expect(200)
    // 	.expect("hello world");
    app.close();
  });

  // test("Multiple React apps - development", async () => {
  // 	server = new Server({ port: 3012 })
  // 	server.addStaticFolder(path.resolve(process.cwd(), "src/__mocks__/static"), "/public");
  // 	app = await server.start()
  //    await request(app).get("/public/foo.txt")
  //    	.expect(200)
  //    	.expect("foo");
  //    await request(app).get("/public/index.html")
  //    	.expect(200)
  //    	.expect("<html>\n  <head>\n    <title>hello</title>\n  </head>\n  <body>\n    <strong>hello</strong> world in HTML\n  </body>\n</html>");
  // 	app.close()
  // })
});
