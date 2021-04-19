import request from "supertest";
import { app } from "../../app";
import { BadRequestError } from "../bad-request-error";
import { CustomError } from "../custom-error";

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
  it("check not found error", async () => {
    const res = await request(app)
      .get("/api/users/not-exist")
      .send()
      .expect(404);
    expect(res.body.errors.length).toEqual(1);
    expect(res.body.errors[0].message).toEqual("The path does not exist.");
  });
  it("BadRequestError no message", () => {
    const error = new BadRequestError();
    expect(error.message).toEqual("Bad request error occurred.");
  });
});
