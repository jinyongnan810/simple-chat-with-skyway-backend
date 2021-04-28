import mongoose, { Mongoose } from "mongoose";
jest.mock("mongoose");
describe("index", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // jest.resetModules();
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  it("mongoose connect error", async () => {
    const errorMsg = "Some connection error!";
    const cerMock = jest.spyOn(console, "error");
    mongoose.connect = jest.fn().mockImplementation(() => {
      return Promise.reject(new Error(errorMsg));
    });
    //   const mongooseMocked = jest.spyOn<Mongoose, "connect">(
    //     mongoose,
    //     "connect"
    //   );
    //   mongooseMocked.mockImplementation(() => {
    //     console.log("hello");
    //     return Promise.reject(new Error(errorMsg));
    //   });
    const server = require("../index").server;

    // wait for a while
    console.log("hello1");
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
    console.log("hello2");
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
    console.log("hello3");
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
    console.log("hello4");
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
    console.log("hello5");
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
    console.log("hello6");

    server.close();
    expect(cerMock.mock.calls.length).toEqual(1);
    expect(cerMock.mock.calls[0][0]).toEqual(errorMsg);
  });
});
