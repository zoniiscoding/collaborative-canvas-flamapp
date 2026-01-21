import { drawSegment } from "./canvas.js";

export function setupSocket(socket, ctx, usersDiv) {
  const cursors = {};

  socket.on("draw", (op) => {
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

  socket.on("redraw", (history) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

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

  socket.on("cursor", ({ id, x, y, color }) => {
    if (!cursors[id]) {
      const cursor = document.createElement("div");
      cursor.className = "cursor";
      cursor.style.background = color;
      document.body.appendChild(cursor);
      cursors[id] = cursor;
    }
    cursors[id].style.left = x + "px";
    cursors[id].style.top = y + "px";
  });

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
