import { drawSegment } from "./canvas.js";

/*
  Sets up all socket listeners for:
  - receiving drawing operations
  - syncing history (undo/redo)
  - showing live cursors
  - showing online users
*/
export function setupSocket(socket, ctx, usersDiv) {
  const cursors = {}; // store DOM elements for remote user cursors

  // when another user draws something
  socket.on("draw", (op) => {

    // handle different operation types
    if (op.type === "text") {
      ctx.fillStyle = op.color;
      ctx.fillText(op.text, op.x, op.y);
    } 
    else if (op.type === "rect") {
      ctx.strokeStyle = op.color;
      ctx.lineWidth = op.width;
      ctx.strokeRect(op.x, op.y, op.w, op.h);
    }
    else {
      // default case = freehand brush/eraser
      drawSegment(ctx, op);
    }
  });

  // full redraw used after undo/redo or when a new user joins
  socket.on("redraw", (history) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // replay every operation in order
    history.forEach(op => {
      if (op.type === "text") {
        ctx.fillStyle = op.color;
        ctx.fillText(op.text, op.x, op.y);
      } 
      else if (op.type === "rect") {
        ctx.strokeStyle = op.color;
        ctx.lineWidth = op.width;
        ctx.strokeRect(op.x, op.y, op.w, op.h);
      }
      else {
        drawSegment(ctx, op);
      }
    });
  });

  // show real-time cursor positions of other users
  socket.on("cursor", ({ id, x, y, color }) => {
    if (!cursors[id]) {
      // create cursor element if it doesn't exist yet
      const cursor = document.createElement("div");
      cursor.className = "cursor";
      cursor.style.background = color;
      document.body.appendChild(cursor);
      cursors[id] = cursor;
    }

    // update cursor position
    cursors[id].style.left = x + "px";
    cursors[id].style.top = y + "px";
  });

  // update online users list
  socket.on("users", (users) => {
    usersDiv.innerHTML = "<strong>Online users</strong>";

    Object.entries(users).forEach(([id, color]) => {
      const div = document.createElement("div");
      div.className = "user";

      const dot = document.createElement("div");
      dot.className = "user-color";
      dot.style.background = color;

      const label = document.createElement("span");
      label.innerText = id === socket.id ? "You" : id.slice(0, 5);

      div.appendChild(dot);
      div.appendChild(label);
      usersDiv.appendChild(div);
    });
  });
}
