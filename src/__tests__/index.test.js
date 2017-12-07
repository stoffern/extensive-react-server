import "raf/polyfill";
import Server from "../index.js";

test("Test instance", () => {
  expect(new Server()).toBeInstanceOf(Server);
});
