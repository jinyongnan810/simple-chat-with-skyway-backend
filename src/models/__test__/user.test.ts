import { Password } from "../../middlewares/services/password";
import { User } from "../user";
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
  it("test user password modified", async () => {
    const user = User.build({ email: "test@test.com", password: "test123" });
    await user.save();
    // change password
    user.password = "test123changed";
    await user.save();
    const res = await Password.compareHash("test123changed", user.password);
    expect(res).toBe(true);
  });
  it("test user password not modified", async () => {
    const user = User.build({ email: "test@test.com", password: "test123" });
    await user.save();
    // password not changed
    await user.save();
    const res = await Password.compareHash("test123", user.password);
    expect(res).toBe(true);
  });
});
