import WebSocket from "ws";
import * as types from "./types";
/* Types */
interface UserInfo {
  id: string;
  ws: WebSocket;
  email: string;
  status: "idle" | "host" | "guest";
  with: UserInfo[];
}
interface MsgType {
  type: string;
  data: Object;
}
/* Types END */
/* Vriables */
const clients: Map<string, UserInfo> = new Map();
/* Vriables END */
/* Common Functions */
const sendToClient = (ws: WebSocket, msg: MsgType) => {
  ws.send(JSON.stringify(msg));
};
const sendErrors = (ws: WebSocket, errors: string[]) => {
  const data = { type: types.ERROR, data: errors };
  sendToClient(ws, data);
};
const leaveRoom = (id: string) => {
  const me = clients.get(id);
  // i am a host
  if (me!.status === "host") {
    const guests = me!.with;
    const newHostInfo = guests[0];
    const newHost = clients.get(newHostInfo.id);
    // only you and me
    if (guests.length === 1) {
      newHost!.status = "idle";
      newHost!.with = [];
    } else {
      // more than 2 people
      // update new host
      newHost!.status = "host";
      const newGuests = guests.filter(
        (g) => g.id !== id && g.id !== newHostInfo.id
      );
      newHost!.with = newGuests;
      // update other guests
      newGuests.forEach((ng) => {
        const g = clients.get(ng.id);
        g!.with = [newHostInfo];
      });
    }

    // update me
    me!.status = "idle";
    me!.with = [];
    broadcastClientsStatus();
    broadcastIExitedRoom(me!, newHost!);
  } else if (me!.status === "guest") {
    // i am a guest
    const host = clients.get(me!.with[0].id);
    me!.status = "idle";
    me!.with = [];
    host!.with = host!.with.filter((w) => w.id !== id);
    // only you and me
    if (host!.with.length === 0) {
      host!.status = "idle";
    }
    broadcastClientsStatus();
    broadcastIExitedRoom(me!, host!);
  } else {
    return;
  }
};
const broadcastClientsStatus = () => {
  // send user lists
  const userList: {
    id: string;
    email: string;
    status: UserInfo["status"];
    with: { id: string; email: string; status: UserInfo["status"] }[];
  }[] = [];
  clients.forEach((c, key) => {
    userList.push({
      id: key,
      email: c.email,
      status: c.status,
      with: c.with.map((w) => ({ id: w.id, email: w.email, status: w.status })),
    });
  });
  clients.forEach((c) => {
    sendToClient(c.ws, { type: types.CURRENT_USERS, data: userList });
  });
};
const broadcastIJoinedRoom = (me: UserInfo, host: UserInfo) => {
  const msg = { type: types.I_JOINED_ROOM, data: { id: me.id } };
  sendToClient(host.ws, msg);
  // host.with
  //   .filter((w) => w.id !== me.id)
  //   .forEach((u) => sendToClient(u.ws, msg));
};
const broadcastIExitedRoom = (me: UserInfo, host: UserInfo) => {
  const msg = { type: types.I_EXITED_ROOM, data: { id: me.id } };
  sendToClient(host.ws, msg);
  host.with
    .filter((w) => w.id !== me.id)
    .forEach((u) => sendToClient(u.ws, msg));
};
/* Common Functions END */
/* WS Server */
const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws, request: any) => {
  // accept the client
  (ws as any).isAlive = 0;
  const id = request.currentUser.id;
  clients.set(id, {
    id,
    ws,
    email: request.currentUser.email,
    status: "idle",
    with: [],
  });
  console.log(`${id} connected`);
  // broadcast current users status
  broadcastClientsStatus();

  ws.on("message", (msg) => {
    console.log(msg);
    const { type, data } = JSON.parse(msg.toString());
    switch (type) {
      case types.JOIN_ROOM:
        if (data.to === id) {
          return;
        }
        let joined = clients.get(data.to);
        if (joined) {
          // if target joined other rooms
          if (joined!.status === "guest") {
            sendErrors(ws, ["The user is currently not available!"]);
            return;
          }
          const me = clients.get(id);
          if (me!.status !== "idle") {
            sendErrors(ws, ["You are in a meeting now!"]);
            return;
          }
          // change status
          me!.status = "guest";
          joined!.status = "host";
          // update relationships
          me!.with = [joined];
          joined!.with.push(me!);
          // update user list
          broadcastClientsStatus();
          // announce the user joined the room
          broadcastIJoinedRoom(me!, joined);
        } else {
          sendErrors(ws, ["The user is not online!"]);
        }
        break;

      case types.EXIT_ROOM:
        leaveRoom(id);
        break;
      case types.TRANSFER_OFFER:
        if (data.to === id) {
          return;
        }
        let offerred = clients.get(data.to);
        if (offerred) {
          sendToClient(offerred.ws, {
            type: types.TRANSFER_OFFER,
            data: { id: id, offer: data.offer },
          });
        }
        break;

      case types.TRANSFER_ANSWER:
        if (data.to === id) {
          return;
        }
        let answered = clients.get(data.to);
        if (answered) {
          sendToClient(answered.ws, {
            type: types.TRANSFER_ANSWER,
            data: { id: id, answer: data.answer },
          });
        }
        break;

      case types.TRANSFER_CANDIDATE:
        if (data.to === id) {
          return;
        }
        let candidateTo = clients.get(data.to);
        if (candidateTo) {
          sendToClient(candidateTo.ws, {
            type: types.TRANSFER_CANDIDATE,
            data: { id: id, candidate: data.candidate },
          });
        }
        break;

      default:
        console.log(`Unknown type:${type}`);
    }
  });
  ws.on("pong", () => {
    (ws as any).isAlive = 0;
  });
  ws.on("close", () => {
    console.log(`${request.currentUser.id} closed`);
    leaveRoom(request.currentUser.id);
    clients.delete(request.currentUser.id);
    broadcastClientsStatus();
  });
});
/* WS Server END*/
/* Timers */
const checkAliveTimer: NodeJS.Timeout = setInterval(() => {
  clients.forEach((user: UserInfo, key: string, map: Map<string, UserInfo>) => {
    if ((user.ws as any).isAlive === 3) {
      console.log("timeout");
      return user.ws.terminate();
    }
    (user.ws as any).isAlive += 1;
    user.ws.ping("");
  });
}, 2000);
/* Timers END */
export { wss };
