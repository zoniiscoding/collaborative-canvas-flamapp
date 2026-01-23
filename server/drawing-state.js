// stores drawing state for each room
// structure: { roomName: { history: [], redoStack: [] } }
const rooms = {};

// get full drawing history for a room
function get(room) {
  if (!rooms[room]) {
    // initialize room state if it doesn't exist
    rooms[room] = { history: [], redoStack: [] };
  }
  return rooms[room].history;
}

// add a new drawing operation
function add(room, data) {
  if (!rooms[room]) {
    rooms[room] = { history: [], redoStack: [] };
  }

  // push new action to history
  rooms[room].history.push(data);

  // clear redo stack since new action breaks redo chain
  rooms[room].redoStack = [];
}

// undo last action (global for the room)
function undo(room) {
  if (!rooms[room] || rooms[room].history.length === 0) return;

  // move last action to redo stack
  const item = rooms[room].history.pop();
  rooms[room].redoStack.push(item);
}

// redo last undone action
function redo(room) {
  if (!rooms[room] || rooms[room].redoStack.length === 0) return;

  // move action back to history
  const item = rooms[room].redoStack.pop();
  rooms[room].history.push(item);
}

// expose functions to server
module.exports = {
  get,
  add,
  undo,
  redo
};
