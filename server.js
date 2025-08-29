import express from "express";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let rooms = {}; // { roomId: [ws1, ws2] }

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    let data = JSON.parse(message);
    if (data.type === "join") {
      if (!rooms[data.room]) rooms[data.room] = [];
      rooms[data.room].push(ws);
    } else if (data.type === "sync") {
      rooms[data.room]?.forEach((client) => {
        if (client !== ws) client.send(JSON.stringify({ type: "sync", time: data.time, state: data.state }));
      });
    }
  });

  ws.on("close", () => {
    for (let room in rooms) {
      rooms[room] = rooms[room].filter((c) => c !== ws);
    }
  });
});

app.get("/", (req, res) => res.send("Backend Running"));
server.listen(3000, () => console.log("Server running on port 3000"));
