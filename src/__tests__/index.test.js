import request from "supertest";

import Server from "../index.js";

describe("Server", async () => {
  let server;
  let app;

  beforeAll(async () => {
    server = new Server({
      port: 3000
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
    const response = await request(app).get("/");
    expect(response.status).toEqual(404);
    expect(response.body).toEqual({});
  });
});
