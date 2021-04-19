import dotenv, { DotenvConfigOutput } from "dotenv";
jest.mock("dotenv");
describe("index", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  it("jwt key not set", () => {
    try {
      //   const dotenvMocked = jest.spyOn(dotenv, "config");
      //   dotenvMocked.mockImplementation(() => {
      //     console.log("hello");
      //     return { parsed: {} } as DotenvConfigOutput;
      //   });
      const backup = dotenv.config;
      dotenv.config = jest.fn().mockImplementation(() => {});
      const server = require("../index").server;
      dotenv.config = backup;
      console.log(dotenv.config);
      fail();
    } catch (error) {
      expect(error.message).toEqual("JWT_KEY not set.");
    }
  });
});
