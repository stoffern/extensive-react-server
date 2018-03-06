import request from "supertest";

import Server from "../index.js";

describe("Server", async () => {
  let server;
  let app;

  beforeAll(async () => {
    server = new Server({
      port: 3000,
      options: {
        logging: false,
        logRequests: false
      }
    });
    app = await server.start();
  });
  afterAll(async () => {
    app.close();
  });

  test("Test instance", () => {
    expect(new Server()).toBeInstanceOf(Server);
  });

  test("Start Koa", async () => {
    await request(app)
      .get("/")
      .expect(404)
      .expect({});
  });
});
