import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';

const app = express();

// Health Check (Render için)
app.get("/healthz", (req, res) => res.send("OK"));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// rooms[roomId] = [ws1, ws2]
const rooms = {};

wss.on("connection", (ws) => {
  let roomId = null;

  ws.on("message", (message) => {
    let data;
    try { data = JSON.parse(message); } 
    catch(e){ return; }

    // Odaya katıl
    if(data.type === "join") {
      roomId = data.room;
      if(!rooms[roomId]) rooms[roomId] = [];
      if(rooms[roomId].length >= 2) {
        ws.send(JSON.stringify({ type: "roomFull" }));
        return;
      }
      rooms[roomId].push(ws);
      ws.send(JSON.stringify({ type: "joined", room: roomId }));
    }

    // Senkronizasyon (play/pause/seek)
    if(data.type === "sync" && roomId) {
      rooms[roomId].forEach(client => {
        if(client !== ws) client.send(JSON.stringify(data));
      });
    }
  });

  ws.on("close", () => {
    if(roomId && rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter(c => c !== ws);
      if(rooms[roomId].length === 0) delete rooms[roomId];
    }
  });
});

// Render free plan port
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
