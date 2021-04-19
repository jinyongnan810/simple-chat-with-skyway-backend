import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";

declare global {
  namespace NodeJS {
    interface Global {
      signup(email?: string, pwd?: string): Promise<string[]>;
    }
  }
}

global.signup = async (email?: string, pwd?: string) => {
  const signInRes = await request(app)
    .post("/api/users/signup")
    .send({
      email: email ?? "test@test.com",
      password: pwd ?? "test",
    })
    .expect(201);
  const cookie = signInRes.get("Set-Cookie");
  return cookie;
};
