import request from "supertest";
import { mocked } from "ts-jest/utils";
import { app } from "../../app";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
describe("user", () => {
  let mongo: any;

  beforeAll(async (done) => {
    // set env
    process.env.JWT_KEY = "secret";
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    done();
  });

  beforeEach(async (done) => {
    // get all collections
    const collections = await mongoose.connection.db.collections();
    // loop and delete all
    for (let collection of collections) {
      await collection.deleteMany({});
    }
    done();
  });

  afterAll(async (done) => {
    await mongo.stop();
    await mongoose.connection.close();
    done();
  });
  it("test un-expected error", async () => {
    console.log("hello");

    const jwtMocked = jest.spyOn(jwt, "sign");
    jwtMocked.mockImplementation(() => {
      throw new Error("Something failed!");
    });

    const res = await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "test123",
      })
      .expect(500);
    expect(mocked(jwt).sign.mock.calls.length).toEqual(1);
    expect(res.body.errors.length).toEqual(1);
    expect(res.body.errors[0].message).toEqual(
      "Unknown error!" + "Something failed!"
    );
  });
});
