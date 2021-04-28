import { createServer } from "http";
import WebSocket from "ws";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import cookieSesion from "cookie-session";
import * as types from "./websocket/types";
const mongod = new MongoMemoryServer();

import dotenv from "dotenv";
dotenv.config();
import { app } from "./app";
import { extractUser } from "./middlewares/current-user";

import { wss } from "./websocket/ws-server";

console.log("Backend starting...");
if (!process.env.JWT_KEY) {
  throw new Error("JWT_KEY not set.");
}

mongod.getUri().then((uri) => {
  mongoose
    .connect(
      // `mongodb+srv://jinyongnan:${process.env.MONGO_PWD}@cluster0.xk5om.gcp.mongodb.net/electron-full-demo?retryWrites=true&w=majority`,
      uri,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      }
    )
    .then(() => {
      console.log("DB connected.");
    })
    .catch((error) => {
      console.error(error.message);
    });
});
const server = createServer(app);

server.on("upgrade", (request, socket, head) => {
  cookieSesion({
    signed: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : undefined,
  })(request, socket, () => {
    extractUser(request);
    if (!request.currentUser) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }
    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit("connection", ws, request);
    });
  });
});
const port = process.env.PORT || 5000;
server.listen(port, async () => {
  console.log(`Backend listening on port ${port}.`);
});
export { server };
