export function drawSegment(ctx, segment) {
  const { from, to, color, width, mode } = segment;

  ctx.beginPath();

  if (mode === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = color;
  }

  ctx.lineWidth = width;
  ctx.lineCap = "round";

  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}
