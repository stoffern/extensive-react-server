import request from "supertest";
import Server from "../index.js";

describe("Custom routes", async () => {
  let server;
  let serverP;
  let app;
  let appP;

  test("Route file - development", async () => {
    server = new Server({ port: 3001 });
    server.addRoute("src/__mocks__/route.js");
    app = await server.start();
    const response = await request(app).get("/test");
    expect(response.status).toEqual(200);
    expect(response.body.res).toEqual("ok");
    app.close();
  });
  test("Route file - production", async () => {
    server = new Server({ port: 3002, environement: "production" });
    server.addRoute("src/__mocks__/route.js");
    app = await server.start();
    const response = await request(app).get("/test");
    expect(response.status).toEqual(200);
    expect(response.body.res).toEqual("ok");
    app.close();
  });

  test("Route folder - development", async () => {
    server = new Server({ port: 3003 });
    server.addRouteFolder("src/__mocks__/routes");
    app = await server.start();
    const response = await request(app).get("/test");
    expect(response.status).toEqual(200);
    expect(response.body.res).toEqual("ok");
    const response2 = await request(app).get("/test2");
    expect(response2.status).toEqual(200);
    expect(response2.body.res).toEqual("ok");
    app.close();
  });

  test("Route folder - production", async () => {
    server = new Server({ port: 3004, environement: "production" });
    server.addRouteFolder("src/__mocks__/routes");
    app = await server.start();
    const response = await request(app).get("/test");
    expect(response.status).toEqual(200);
    expect(response.body.res).toEqual("ok");
    const response2 = await request(app).get("/test2");
    expect(response2.status).toEqual(200);
    expect(response2.body.res).toEqual("ok");

    app.close();
  });
});
