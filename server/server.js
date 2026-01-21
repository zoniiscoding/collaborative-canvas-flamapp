const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const drawingState = require("./drawing-state");
const rooms = require("./rooms");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("client"));

// modern Express catch-all (works in v5)
app.use((req, res) => {
  res.sendFile(__dirname + "/../client/index.html");
});


const users = {};
const colors = ["red", "blue", "green", "purple", "orange"];

io.on("connection", (socket) => {
  const room = socket.handshake.query.room || "default";
  rooms.join(socket, room);

  users[socket.id] = colors[Math.floor(Math.random() * colors.length)];
  io.to(room).emit("users", users);

  socket.on("draw", (segment) => {
    drawingState.add(segment);
    socket.broadcast.to(room).emit("draw", segment);
  });

  socket.on("undo", () => {
    io.to(room).emit("redraw", drawingState.undo());
  });

  socket.on("redo", () => {
    io.to(room).emit("redraw", drawingState.redo());
  });

  socket.on("cursor", (data) => {
    socket.broadcast.to(room).emit("cursor", {
      id: socket.id,
      color: users[socket.id],
      ...data
    });
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.to(room).emit("users", users);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
