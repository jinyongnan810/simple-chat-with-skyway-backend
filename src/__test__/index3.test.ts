import wsRequest from "superwstest";
import request from "supertest";
describe("index", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  it("production mode", async () => {
    try {
      // change mode to production
      process.env.NODE_ENV = "production";
      // start server
      const server = require("../index").server;
      // websocket test
      await wsRequest(server).ws("").expectConnectionError(401);
      // rest test
      // const restRes = await request(server)
      //   .get("/api/users/currentuser")
      //   .expect(200);
      // expect(restRes.body.currentUser).toBeNull();
      // close server
      server.close();
      // recover mode
      process.env.NODE_ENV = "test";
    } catch (error) {
      expect(error.message).toEqual("JWT_KEY not set.");
    }
  });
});
