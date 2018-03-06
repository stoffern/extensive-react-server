import request from "supertest";
import path from "path";
import Server from "../index.js";
const { BasicStrategy, DigestStrategy } = require("passport-http");

jest.setTimeout(40000);

describe("Passport tests", async () => {
  let server;
  let app;

  test("Static file - development", async () => {
    server = new Server({
      port: 3030,
      options: {
        logging: false,
        logRequests: false
      }
    });

    server.addPassportStrategy(
      new BasicStrategy((username, password, done) => {
        if (username == "test" && password == "tester")
          done(null, { username: username, password: password });
        else done(null, false);
      })
    );

    let route = server.addStaticFile("src/__mocks__/hello.txt", "/hello");

    route.addAuthentication((passport, ctx, next) => {
      return passport.authenticate("basic", { session: false })(ctx, next);
    });
    app = await server.start();

    await request(app)
      .get("/hello")
      .expect(401)
      .expect("Unauthorized");

    await request(app)
      .get("/hello")
      .set("Authorization", "Basic dGVzdDp0ZXN0ZXI=")
      .expect(200)
      .expect("hello world");

    app.close();
  });

  test("Static file - production", async () => {
    server = new Server({
      environment: "production",
      port: 3030,
      options: {
        logging: false,
        logRequests: false
      }
    });

    server.addPassportStrategy(
      new BasicStrategy((username, password, done) => {
        if (username == "test" && password == "tester")
          done(null, { username: username, password: password });
        else done(null, false);
      })
    );

    let route = server.addStaticFile("src/__mocks__/hello.txt", "/hello");

    route.addAuthentication((passport, ctx, next) => {
      return passport.authenticate("basic", { session: false })(ctx, next);
    });
    app = await server.start();

    await request(app)
      .get("/hello")
      .expect(401)
      .expect("Unauthorized");

    await request(app)
      .get("/hello")
      .set("Authorization", "Basic dGVzdDp0ZXN0ZXI=")
      .expect(200)
      .expect("hello world");

    app.close();
  });

  test("Static folder - development", async () => {
    server = new Server({
      environment: "development",
      port: 3031,
      options: {
        logging: false,
        logRequests: false
      }
    });

    server.addPassportStrategy(
      new BasicStrategy((username, password, done) => {
        if (username == "test" && password == "tester")
          done(null, { username: username, password: password });
        else done(null, false);
      })
    );

    let route = server.addStaticFolder(
      path.resolve(process.cwd(), "src/__mocks__/static"),
      "/public"
    );

    route.addAuthentication((passport, ctx, next) => {
      return passport.authenticate("basic", { session: false })(ctx, next);
    });

    app = await server.start();
    await request(app)
      .get("/public/foo.txt")
      .expect(401)
      .expect("Unauthorized");

    await request(app)
      .get("/public/foo.txt")
      .set("Authorization", "Basic dGVzdDp0ZXN0ZXI=")
      .expect(200)
      .expect("foo");

    app.close();
  });

  test("Static folder - production", async () => {
    server = new Server({
      environment: "production",
      port: 3031,
      options: {
        logging: false,
        logRequests: false
      }
    });

    server.addPassportStrategy(
      new BasicStrategy((username, password, done) => {
        if (username == "test" && password == "tester")
          done(null, { username: username, password: password });
        else done(null, false);
      })
    );

    let route = server.addStaticFolder(
      path.resolve(process.cwd(), "src/__mocks__/static"),
      "/public"
    );

    route.addAuthentication((passport, ctx, next) => {
      return passport.authenticate("basic", { session: false })(ctx, next);
    });

    app = await server.start();
    await request(app)
      .get("/public/foo.txt")
      .expect(401)
      .expect("Unauthorized");

    await request(app)
      .get("/public/foo.txt")
      .set("Authorization", "Basic dGVzdDp0ZXN0ZXI=")
      .expect(200)
      .expect("foo");

    app.close();
  });

  test("React app - development", async () => {
    server = new Server({
      environment: "development",
      port: 3031,
      options: {
        logging: false,
        logRequests: false
      }
    });

    server.addPassportStrategy(
      new BasicStrategy((username, password, done) => {
        if (username == "test" && password == "tester")
          done(null, { username: username, password: password });
        else done(null, false);
      })
    );

    let route = server.addReactRoute(
      "",
      path.resolve(process.cwd(), "src/__mocks__/react/Routes.js")
    );

    route.addAuthentication((passport, ctx, next) => {
      passport.authenticate("basic", (err, user, info) => {
        if (user) ctx.login(user);
        else ctx.logout();
      })(ctx, next);

      if (!ctx.isAuthenticated()) {
        ctx.status = 401;
        ctx.body = "Unauthorized";
      }
    });

    app = await server.start();
    await request(app)
      .get("/foo")
      .expect(401)
      .expect("Unauthorized");

    await request(app)
      .get("/foo")
      .set("Authorization", "Basic dGVzdDp0ZXN0ZXI=")
      .expect(200);

    app.close();
  });
});
