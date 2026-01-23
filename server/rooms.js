// simple helper to join a socket to a room
// keeps room logic separate from main server file
function join(socket, room = "default") {
  socket.join(room);
}

// export so server can use it
module.exports = { join };
