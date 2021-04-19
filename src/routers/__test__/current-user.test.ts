import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
describe("current-user", () => {
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
  it("get user after signed in", async () => {
    const cookie = await global.signup();
    const res = await request(app)
      .get("/api/users/currentuser")
      .set("Cookie", cookie)
      .send()
      .expect(200);
    expect(res.body.currentUser).toBeTruthy();
    expect(res.body.currentUser.email).toEqual("test@test.com");
  });

  it("get user without signed in", async () => {
    const res = await request(app)
      .get("/api/users/currentuser")
      .send()
      .expect(200);
    expect(res.body.currentUser).toBeNull();
  });

  it("get user with invalid cookie", async () => {
    const res = await request(app)
      .get("/api/users/currentuser")
      .set("Cookie", [
        "express:sess=kyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJall3TmpaaFltUTNaakJpWmprNE5EUTFNREUxWW1Oak5pSXNJbVZ0WVdsc0lqb2lkR1Z6ZEVCMFpYTjBMbU52YlNJc0ltbGhkQ0k2TVRZeE56TTBNVE01T1gwLkhHUVU2LVdCc05rRzN3VE11THVBMU5BX1hNblY1czRSZ1hzb3ZsRlRlbmMifQ==; path=/; httponly",
      ])
      .send()
      .expect(200);
    expect(res.body.currentUser).toBeNull();
  });
});
