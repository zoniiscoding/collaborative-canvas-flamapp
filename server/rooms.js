function join(socket, room = "default") {
  socket.join(room);
}

module.exports = { join };
