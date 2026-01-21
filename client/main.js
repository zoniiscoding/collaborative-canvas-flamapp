import { drawSegment } from "./canvas.js";
import { setupSocket } from "./websocket.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const room = window.location.pathname.slice(1) || "main";
const socket = io({ query: { room } });

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* UI */
const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const brushBtn = document.getElementById("brush");
const eraserBtn = document.getElementById("eraser");
const rectBtn = document.getElementById("rect");
const textBtn = document.getElementById("text");
const undoBtn = document.getElementById("undo");
const redoBtn = document.getElementById("redo");
const saveBtn = document.getElementById("save");
const loadBtn = document.getElementById("load");
const usersDiv = document.getElementById("users");

/* State */
let drawing = false;
let tool = "free";
let mode = "brush";
let prevPoint = null;
let startPoint = null;
let currentColor = colorPicker.value;
let currentSize = brushSize.value;

/* Socket */
setupSocket(socket, ctx, usersDiv);

/* Tool UI */
function setToolActive(btn) {
  [brushBtn, eraserBtn, rectBtn, textBtn].forEach(b =>
    b.classList.remove("active")
  );
  btn.classList.add("active");
}

brushBtn.onclick = () => { tool = "free"; mode = "brush"; setToolActive(brushBtn); };
eraserBtn.onclick = () => { tool = "free"; mode = "eraser"; setToolActive(eraserBtn); };
rectBtn.onclick = () => { tool = "rect"; setToolActive(rectBtn); };
textBtn.onclick = () => { tool = "text"; setToolActive(textBtn); };

colorPicker.onchange = e => currentColor = e.target.value;
brushSize.oninput = e => currentSize = e.target.value;

undoBtn.onclick = () => socket.emit("undo");
redoBtn.onclick = () => socket.emit("redo");

/* Save / Load */
saveBtn.onclick = () => {
  localStorage.setItem("canvas", canvas.toDataURL());
  alert("Saved!");
};

loadBtn.onclick = () => {
  const data = localStorage.getItem("canvas");
  if (!data) return alert("Nothing saved");

  const img = new Image();
  img.src = data;
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
};

/* MOUSE */
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  drawing = true;
  prevPoint = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  startPoint = prevPoint;
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing || !prevPoint || tool !== "free") return;

  const rect = canvas.getBoundingClientRect();
  const segment = {
    from: prevPoint,
    to: {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    },
    color: currentColor,
    width: currentSize,
    mode
  };

  drawSegment(ctx, segment);
  socket.emit("draw", segment);
  prevPoint = segment.to;
});

canvas.addEventListener("mouseup", (e) => {
  drawing = false;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (tool === "rect") {
    const rectOp = {
      type: "rect",
      x: startPoint.x,
      y: startPoint.y,
      w: x - startPoint.x,
      h: y - startPoint.y,
      color: currentColor,
      width: currentSize
    };

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.strokeRect(rectOp.x, rectOp.y, rectOp.w, rectOp.h);
    socket.emit("draw", rectOp);
  }

  if (tool === "text") {
    const input = document.createElement("input");
    input.type = "text";
    input.style.position = "absolute";
    input.style.left = (x + canvas.offsetLeft) + "px";
    input.style.top = (y + canvas.offsetTop) + "px";
    input.style.zIndex = 1000;

    document.body.appendChild(input);
    input.focus();

    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        const txt = input.value;
        document.body.removeChild(input);
        if (!txt) return;

        const textOp = {
          type: "text",
          text: txt,
          x,
          y,
          color: currentColor
        };

        ctx.fillStyle = currentColor;
        ctx.fillText(textOp.text, textOp.x, textOp.y);
        socket.emit("draw", textOp);
      }
    });
  }

  prevPoint = null;
});

/* TOUCH */
canvas.addEventListener("touchstart", (e) => {
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  const x = t.clientX - rect.left;
  const y = t.clientY - rect.top;

  drawing = true;
  prevPoint = { x, y };
  startPoint = { x, y };
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (!drawing || !prevPoint || tool !== "free") return;

  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];

  const segment = {
    from: prevPoint,
    to: {
      x: t.clientX - rect.left,
      y: t.clientY - rect.top
    },
    color: currentColor,
    width: currentSize,
    mode
  };

  drawSegment(ctx, segment);
  socket.emit("draw", segment);
  prevPoint = segment.to;
});

canvas.addEventListener("touchend", (e) => {
  drawing = false;

  const rect = canvas.getBoundingClientRect();
  const t = e.changedTouches[0];
  const x = t.clientX - rect.left;
  const y = t.clientY - rect.top;

  if (tool === "rect") {
    const rectOp = {
      type: "rect",
      x: startPoint.x,
      y: startPoint.y,
      w: x - startPoint.x,
      h: y - startPoint.y,
      color: currentColor,
      width: currentSize
    };

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.strokeRect(rectOp.x, rectOp.y, rectOp.w, rectOp.h);
    socket.emit("draw", rectOp);
  }

  if (tool === "text") {
    const input = document.createElement("input");
    input.type = "text";
    input.style.position = "absolute";
    input.style.left = (x + canvas.offsetLeft) + "px";
    input.style.top = (y + canvas.offsetTop) + "px";
    input.style.zIndex = 1000;

    document.body.appendChild(input);
    input.focus();

    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        const txt = input.value;
        document.body.removeChild(input);
        if (!txt) return;

        const textOp = {
          type: "text",
          text: txt,
          x,
          y,
          color: currentColor
        };

        ctx.fillStyle = currentColor;
        ctx.fillText(textOp.text, textOp.x, textOp.y);
        socket.emit("draw", textOp);
      }
    });
  }

  prevPoint = null;
});
