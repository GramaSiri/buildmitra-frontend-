import React, { useRef, useEffect } from "react";

const FloorPlanProfessional = () => {
  const canvasRef = useRef(null);

  // =========================
  // CONFIG
  // =========================
  const SCALE = 14; // px per foot
  const WALL = 8; // wall thickness px
  const OFFSET_X = 120;
  const OFFSET_Y = 100;

  // =========================
  // WALL DATA (Professional Approach)
  // =========================
  const walls = [
    // Outer walls
    { x1: 0, y1: 0, x2: 40, y2: 0 },
    { x1: 40, y1: 0, x2: 40, y2: 30 },
    { x1: 40, y1: 30, x2: 0, y2: 30 },
    { x1: 0, y1: 30, x2: 0, y2: 0 },

    // Internal walls
    { x1: 12, y1: 0, x2: 12, y2: 12 },
    { x1: 12, y1: 12, x2: 28, y2: 12 },
    { x1: 28, y1: 0, x2: 28, y2: 30 },

    { x1: 0, y1: 20, x2: 12, y2: 20 },
    { x1: 12, y1: 20, x2: 28, y2: 20 },
  ];

  // =========================
  // DOORS
  // =========================
  const doors = [
    {
      x: 12,
      y: 6,
      width: 3,
      side: "left",
    },
    {
      x: 20,
      y: 12,
      width: 3,
      side: "bottom",
    },
  ];

  // =========================
  // WINDOWS
  // =========================
  const windows = [
    {
      x: 5,
      y: 0,
      width: 4,
      side: "top",
    },
    {
      x: 40,
      y: 10,
      width: 5,
      side: "right",
    },
  ];

  // =========================
  // ROOM LABELS
  // =========================
  const labels = [
    { text: "BEDROOM", x: 6, y: 10 },
    { text: "KITCHEN", x: 20, y: 6 },
    { text: "DINING", x: 20, y: 24 },
    { text: "LIVING", x: 34, y: 16 },
  ];

  // =========================
  // HELPERS
  // =========================
  const tx = (x) => OFFSET_X + x * SCALE;
  const ty = (y) => OFFSET_Y + y * SCALE;

  // =========================
  // DRAW GRID
  // =========================
  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += SCALE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += SCALE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  // =========================
  // DRAW WALL
  // =========================
  const drawWall = (ctx, wall) => {
    ctx.strokeStyle = "#000";
    ctx.lineCap = "square";
    ctx.lineWidth = WALL;

    ctx.beginPath();
    ctx.moveTo(tx(wall.x1), ty(wall.y1));
    ctx.lineTo(tx(wall.x2), ty(wall.y2));
    ctx.stroke();
  };

  // =========================
  // DRAW DOOR
  // =========================
  const drawDoor = (ctx, door) => {
    const x = tx(door.x);
    const y = ty(door.y);
    const r = door.width * SCALE;

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    if (door.side === "left") {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + r);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI / 2);
      ctx.stroke();
    }

    if (door.side === "bottom") {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + r, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, r, Math.PI * 1.5, 0);
      ctx.stroke();
    }
  };

  // =========================
  // DRAW WINDOW
  // =========================
  const drawWindow = (ctx, win) => {
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;

    if (win.side === "top") {
      ctx.beginPath();
      ctx.moveTo(tx(win.x), ty(win.y));
      ctx.lineTo(tx(win.x + win.width), ty(win.y));
      ctx.stroke();
    }

    if (win.side === "right") {
      ctx.beginPath();
      ctx.moveTo(tx(win.x), ty(win.y));
      ctx.lineTo(tx(win.x), ty(win.y + win.width));
      ctx.stroke();
    }
  };

  // =========================
  // DIMENSIONS
  // =========================
  const drawDimension = (ctx, x1, y1, x2, y2, text) => {
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(tx(x1), ty(y1));
    ctx.lineTo(tx(x2), ty(y2));
    ctx.stroke();

    const mx = (tx(x1) + tx(x2)) / 2;
    const my = (ty(y1) + ty(y2)) / 2;

    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.fillText(text, mx - 15, my - 5);
  };

  // =========================
  // MAIN DRAW
  // =========================
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // DPI FIX
    const dpr = window.devicePixelRatio || 1;

    canvas.width = 1400 * dpr;
    canvas.height = 900 * dpr;

    canvas.style.width = "1400px";
    canvas.style.height = "900px";

    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 1400, 900);

    // Grid
    drawGrid(ctx, 1400, 900);

    // Walls
    walls.forEach((wall) => drawWall(ctx, wall));

    // Windows
    windows.forEach((win) => drawWindow(ctx, win));

    // Doors
    doors.forEach((door) => drawDoor(ctx, door));

    // Labels
    ctx.fillStyle = "#000";
    ctx.font = "bold 14px Arial";

    labels.forEach((label) => {
      ctx.fillText(label.text, tx(label.x), ty(label.y));
    });

    // Dimensions
    drawDimension(ctx, 0, -2, 40, -2, `40'-0"`);
    drawDimension(ctx, -2, 0, -2, 30, `30'-0"`);

    // Title
    ctx.font = "bold 22px Arial";
    ctx.fillText("PROFESSIONAL 2D FLOOR PLAN", 450, 50);

    // North Arrow
    ctx.beginPath();
    ctx.moveTo(1250, 120);
    ctx.lineTo(1250, 70);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(1240, 85);
    ctx.lineTo(1250, 70);
    ctx.lineTo(1260, 85);
    ctx.stroke();

    ctx.fillText("N", 1242, 60);

    // Scale
    ctx.fillRect(1100, 820, 100, 4);
    ctx.fillText("SCALE 1:100", 1100, 850);
  };

  useEffect(() => {
    draw();

    window.addEventListener("resize", draw);

    return () => {
      window.removeEventListener("resize", draw);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        overflow: "auto",
        background: "#d1d5db",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          width: "fit-content",
          margin: "auto",
          boxShadow: "0 0 20px rgba(0,0,0,0.2)",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            background: "#fff",
          }}
        />
      </div>
    </div>
  );
};

export default FloorPlanProfessional;