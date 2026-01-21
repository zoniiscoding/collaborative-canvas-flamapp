const rooms = {};

function get(room) {
  if (!rooms[room]) {
    rooms[room] = { history: [], redoStack: [] };
  }
  return rooms[room].history;
}

function add(room, data) {
  if (!rooms[room]) {
    rooms[room] = { history: [], redoStack: [] };
  }
  rooms[room].history.push(data);
  rooms[room].redoStack = [];
}

function undo(room) {
  if (!rooms[room] || rooms[room].history.length === 0) return;
  const item = rooms[room].history.pop();
  rooms[room].redoStack.push(item);
}

function redo(room) {
  if (!rooms[room] || rooms[room].redoStack.length === 0) return;
  const item = rooms[room].redoStack.pop();
  rooms[room].history.push(item);
}

module.exports = {
  get,
  add,
  undo,
  redo
};
