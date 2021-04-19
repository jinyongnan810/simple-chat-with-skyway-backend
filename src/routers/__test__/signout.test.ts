import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
describe("signout", () => {
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
  beforeEach(async () => {
    // signup
    await request(app).post("/api/users/signup").send({
      email: "test@test.com",
      password: "test",
    });
  });

  it("normal signout", async () => {
    // sign in
    const signinRes = await request(app).post("/api/users/signin").send({
      email: "test@test.com",
      password: "test",
    });
    // sign out
    const res = await request(app)
      .post("/api/users/signout")
      .send()
      .expect(200);
    expect(res.get("Set-Cookie")).toEqual([
      "express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly",
    ]); // check cookie is set
  });

  it("signout without signin", async () => {
    // sign out
    const res = await request(app)
      .post("/api/users/signout")
      .send()
      .expect(200);
    expect(res.get("Set-Cookie")).toEqual([
      "express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly",
    ]); // check cookie is set
  });
});
