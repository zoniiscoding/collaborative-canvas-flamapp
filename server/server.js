const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const drawingState = require("./drawing-state");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// store connected users per room
// structure: { roomName: { socketId: color } }
const users = {};

// serve frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "../client")));

// fallback route so /room1, /room2 etc. all load index.html
// handled on frontend using URL
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// socket connection handler
io.on("connection", (socket) => {

  // get room name from query, default to main
  const room = socket.handshake.query.room || "main";
  socket.join(room);

  if (!users[room]) users[room] = {};

  // assign a random color to each user
  const color = "#" + Math.floor(Math.random() * 16777215).toString(16);
  users[room][socket.id] = color;

  console.log("User connected:", socket.id, "Room:", room);

  // send updated user list to everyone in the room
  io.to(room).emit("users", users[room]);

  // send existing drawing history to new user
  socket.emit("redraw", drawingState.get(room));

  // receive drawing operation from a user
  socket.on("draw", (data) => {
    // store operation in server state
    drawingState.add(room, data);

    // broadcast to others in the same room
    socket.to(room).emit("draw", data);
  });

  // global undo (affects everyone in room)
  socket.on("undo", () => {
    drawingState.undo(room);
    io.to(room).emit("redraw", drawingState.get(room));
  });

  // global redo
  socket.on("redo", () => {
    drawingState.redo(room);
    io.to(room).emit("redraw", drawingState.get(room));
  });

  // broadcast cursor movement to others
  socket.on("cursor", (data) => {
    socket.to(room).emit("cursor", {
      id: socket.id,
      color,
      ...data
    });
  });

  // cleanup when user disconnects
  socket.on("disconnect", () => {
    delete users[room][socket.id];
    io.to(room).emit("users", users[room]);
    socket.leave(room);
  });
});

// start server (works locally and on Render)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
