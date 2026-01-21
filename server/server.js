const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const drawingState = require("./drawing-state");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// store users per room
const users = {};

// serve frontend (Express 5 safe)
app.use(express.static(path.join(__dirname, "../client")));

// catch-all for SPA routing (rooms)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// socket logic
io.on("connection", (socket) => {
  const room = socket.handshake.query.room || "main";
  socket.join(room);

  if (!users[room]) users[room] = {};

  // assign random color
  const color = "#" + Math.floor(Math.random() * 16777215).toString(16);
  users[room][socket.id] = color;

  console.log("User connected:", socket.id, "Room:", room);

  // send users in this room
  io.to(room).emit("users", users[room]);

  // send existing canvas to new user
  socket.emit("redraw", drawingState.get(room));

  // drawing
  socket.on("draw", (data) => {
    drawingState.add(room, data);
    socket.to(room).emit("draw", data);
  });

  // undo
  socket.on("undo", () => {
    drawingState.undo(room);
    io.to(room).emit("redraw", drawingState.get(room));
  });

  // redo
  socket.on("redo", () => {
    drawingState.redo(room);
    io.to(room).emit("redraw", drawingState.get(room));
  });

  // cursor
  socket.on("cursor", (data) => {
    socket.to(room).emit("cursor", {
      id: socket.id,
      color,
      ...data
    });
  });

  socket.on("disconnect", () => {
    delete users[room][socket.id];
    io.to(room).emit("users", users[room]);
    socket.leave(room);
  });
});

// start server (Render compatible)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
