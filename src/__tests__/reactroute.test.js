import request from "supertest";
import path from "path";
import Server from "../index.js";

jest.setTimeout(20000);

describe("React routes", async () => {
  let server;
  let app;

  test("React app - development", async () => {
    server = new Server({
      port: 3020,
      options: {
        logging: false,
        logRequests: false
      }
    });
    const route2 = server.addReactRoute(
      "",
      path.resolve(process.cwd(), "src/__mocks__/react/Routes.js")
    );
    app = await server.start();
    await request(app)
      .get("/foo")
      .expect(200);

    app.close();
  });
  test("React app - production", async () => {
    server = new Server({
      port: 3021,
      environment: "production",
      options: {
        logging: false,
        logRequests: false
      }
    });
    const route2 = server.addReactRoute(
      "",
      path.resolve(process.cwd(), "src/__mocks__/react/Routes.js")
    );
    app = await server.start();

    await request(app)
      .get("/foo")
      .expect(200);

    app.close();
  });

  test("React app with prefix - development", async () => {
    server = new Server({
      port: 3022,
      environment: "development",
      options: {
        logging: false,
        logRequests: false
      }
    });
    const route2 = server.addReactRoute(
      "/prefix",
      path.resolve(process.cwd(), "src/__mocks__/react/Routes.js")
    );
    app = await server.start();
    await request(app)
      .get("/foo")
      .expect(200);

    app.close();
  });

  test("React app with prefix - development", async () => {
    server = new Server({
      port: 3023,
      environment: "production",
      options: {
        logging: false,
        logRequests: false
      }
    });
    const route2 = server.addReactRoute(
      "/prefix",
      path.resolve(process.cwd(), "src/__mocks__/react/Routes.js")
    );
    app = await server.start();
    await request(app)
      .get("/prefix/foo")
      .expect(200);

    app.close();
  });
});
