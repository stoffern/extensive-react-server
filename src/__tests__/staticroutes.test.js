import request from "supertest";
import path from "path";
import Server from "../index.js";

describe("Static routes", async () => {
  let server;
  let app;

  test("Static file - development", async () => {
    server = new Server({
      port: 3010,
      options: {
        logging: false,
        logRequests: false
      }
    });
    server.addStaticFile("src/__mocks__/hello.txt", "/hello");
    app = await server.start();
    await request(app)
      .get("/hello")
      .expect(200)
      .expect("hello world");
    app.close();
  });
  test("Static file - production", async () => {
    server = new Server({
      port: 3011,
      environment: "production",
      options: {
        logging: false,
        logRequests: false
      }
    });
    server.addStaticFile("src/__mocks__/hello.txt", "/hello");
    app = await server.start();
    await request(app)
      .get("/hello")
      .expect(200)
      .expect("hello world");
    app.close();
  });

  test("Static folder - development", async () => {
    server = new Server({
      port: 3012,
      options: {
        logging: false,
        logRequests: false
      }
    });
    server.addStaticFolder(
      path.resolve(process.cwd(), "src/__mocks__/static"),
      "/public"
    );
    app = await server.start();
    await request(app)
      .get("/public/foo.txt")
      .expect(200)
      .expect("foo");
    await request(app)
      .get("/public/index.html")
      .expect(200)
      .expect(
        "<html>\n  <head>\n    <title>hello</title>\n  </head>\n  <body>\n    <strong>hello</strong> world in HTML\n  </body>\n</html>"
      );
    app.close();
  });
  test("Static folder - production", async () => {
    server = new Server({
      port: 3013,
      environment: "production",
      options: {
        logging: false,
        logRequests: false
      }
    });
    server.addStaticFolder(
      path.resolve(process.cwd(), "src/__mocks__/static"),
      "/public"
    );
    app = await server.start();
    await request(app)
      .get("/public/foo.txt")
      .expect(200)
      .expect("foo");
    await request(app)
      .get("/public/index.html")
      .expect(200)
      .expect(
        "<html>\n  <head>\n    <title>hello</title>\n  </head>\n  <body>\n    <strong>hello</strong> world in HTML\n  </body>\n</html>"
      );
    app.close();
  });
});
