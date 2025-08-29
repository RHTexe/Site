let socket;
let roomId;
let player;
let isHost = false;

// Backend WebSocket URL (Render)
// script.js dosyasında en üstlerde
const WS_URL = "wss://site-cndn.onrender.com/";


// DOM Elements
const roomInput = document.getElementById("roomId");
const nameInput = document.getElementById("displayName");
const joinBtn = document.getElementById("joinBtn");
const hostBadge = document.getElementById("hostBadge");
const videoIdInput = document.getElementById("videoId");
const loadBtn = document.getElementById("loadBtn");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const seekBackBtn = document.getElementById("seekBackBtn");
const seekFwdBtn = document.getElementById("seekFwdBtn");
const userList = document.getElementById("userList");
const chatLog = document.getElementById("chatLog");
const chatText = document.getElementById("chatText");
const chatSend = document.getElementById("chatSend");

// YouTube Player
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: '',
  });
}

// Join Room
joinBtn.onclick = () => {
  roomId = roomInput.value;
  const name = nameInput.value || "Anon";
  if(!roomId) return alert("Oda ID girin");

  socket = io(WS_URL);
  socket.emit("joinRoom", { roomId, name });

  socket.on("roomJoined", ({ you, state }) => {
    isHost = you.isHost;
    if(isHost) hostBadge.classList.remove("hidden");
    updateUserList(state.users);
    if(state.videoId) player.loadVideoById(state.videoId, state.playbackTime);
  });

  socket.on("userJoined", ({ name }) => addUser(name));
  socket.on("userLeft", ({ id }) => removeUser(id));
  socket.on("hostChanged", ({ id }) => { isHost = socket.id === id; if(isHost) hostBadge.classList.remove("hidden"); });
  socket.on("chatMsg", ({ name, text }) => appendChat(name, text));
  socket.on("loadVideo", ({ videoId, time }) => player.loadVideoById(videoId, time));
  socket.on("play", ({ time }) => { player.seekTo(time, true); player.playVideo(); });
  socket.on("pause", ({ time }) => { player.seekTo(time, true); player.pauseVideo(); });
  socket.on("seek", ({ time }) => player.seekTo(time, true));
};

// Video Controls
loadBtn.onclick = () => { if(!isHost) return; socket.emit("loadVideo", { roomId, videoId: videoIdInput.value, time: 0 }); };
playBtn.onclick = () => { if(!isHost) return; socket.emit("play", { roomId, time: player.getCurrentTime() }); };
pauseBtn.onclick = () => { if(!isHost) return; socket.emit("pause", { roomId, time: player.getCurrentTime() }); };
seekBackBtn.onclick = () => { if(!isHost) return; socket.emit("seek", { roomId, time: player.getCurrentTime()-5 }); };
seekFwdBtn.onclick = () => { if(!isHost) return; socket.emit("seek", { roomId, time: player.getCurrentTime()+5 }); };

// Chat
chatSend.onclick = () => {
  const text = chatText.value;
  if(!text) return;
  socket.emit("chatMsg", { roomId, name: nameInput.value || "Anon", text });
  chatText.value = "";
};

function appendChat(name, text) { chatLog.innerHTML += `<div><b>${name}:</b> ${text}</div>`; chatLog.scrollTop = chatLog.scrollHeight; }
function addUser(name) { const li = document.createElement("li"); li.textContent = name; li.id = name; userList.appendChild(li); }
function removeUser(id) { const li = document.getElementById(id); if(li) li.remove(); }
function updateUserList(users) { userList.innerHTML = ""; users.forEach(u => addUser(u.name)); }
