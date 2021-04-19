import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
describe("singup", () => {
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
  it("normal signup", async () => {
    const res = await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "test",
      })
      .expect(201);
    expect(res.get("Set-Cookie")).toBeDefined(); // check cookie is set
    expect(res.body.email).toEqual("test@test.com");
    expect(res.body.id).toBeTruthy();
  });

  it("abnormal signup", async () => {
    const res = await request(app)
      .post("/api/users/signup")
      .send({
        email: "testtest.com",
        password: "tes",
      })
      .expect(400);

    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]["field"]).toEqual("email");
  });

  it("empty request", async () => {
    const res1 = await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
      })
      .expect(400);
    expect(res1.body).toHaveProperty("errors");
    expect(res1.body.errors).toHaveLength(1);
    expect(res1.body.errors[0]["field"]).toEqual("password");
    const res2 = await request(app)
      .post("/api/users/signup")
      .send({
        password: "test",
      })
      .expect(400);
    expect(res2.body).toHaveProperty("errors");
    expect(res2.body.errors).toHaveLength(1);
    expect(res2.body.errors[0]["field"]).toEqual("email");
  });

  it("duplicate signup", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "test",
      })
      .expect(201);
    const res2 = await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "test",
      })
      .expect(400);
    expect(res2.body).toHaveProperty("errors");
    expect(res2.body.errors).toHaveLength(1);
    expect(res2.body.errors[0]).toEqual({ message: "Email in use." });
  });
});
