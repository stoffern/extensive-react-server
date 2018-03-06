import request from "supertest";
import path from "path";
import Server from "../index.js";

describe("Passport tests", async () => {
  let server;
  let app;

  test("Static file - development", async () => {
    server = new Server({
      port: 3001,
      options: {
        logging: false,
        logRequests: false
      }
    });
    server.addRoute("src/__mocks__/route.js");
    app = await server.start();
    const response = await request(app).get("/test");
    expect(response.status).toEqual(200);
    expect(response.body.res).toEqual("ok");
    app.close();
  });

  test("Route static - development", async () => {
    server = new Server({
      port: 3001,
      options: {
        logging: false,
        logRequests: false
      }
    });
    server.addRoute("src/__mocks__/route.js");
    app = await server.start();
    const response = await request(app).get("/test");
    expect(response.status).toEqual(200);
    expect(response.body.res).toEqual("ok");
    app.close();
  });
});
