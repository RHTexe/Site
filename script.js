let ws;
let roomId;
const video = document.getElementById("video");

function joinRoom() {
  roomId = document.getElementById("room").value;
  ws = new WebSocket("wss://YOUR_RENDER_URL");
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", room: roomId }));
  ws.onmessage = (e) => {
    let data = JSON.parse(e.data);
    if (data.type === "sync") {
      if (Math.abs(video.currentTime - data.time) > 0.5) {
        video.currentTime = data.time;
      }
      if (data.state === "play") video.play();
      else video.pause();
    }
  };
}

video.addEventListener("play", () => sendSync("play"));
video.addEventListener("pause", () => sendSync("pause"));
video.addEventListener("seeked", () => sendSync(video.paused ? "pause" : "play"));

function sendSync(state) {
  ws.send(JSON.stringify({ type: "sync", room: roomId, time: video.currentTime, state }));
}
