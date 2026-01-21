let history = [];
let redoStack = [];

function add(segment) {
  history.push(segment);
  redoStack = [];
}

function undo() {
  if (!history.length) return history;
  redoStack.push(history.pop());
  return history;
}

function redo() {
  if (!redoStack.length) return history;
  history.push(redoStack.pop());
  return history;
}

module.exports = { add, undo, redo };
