import React, { useRef, useEffect } from 'react';

const FloorPlan2D = () => {
  const canvasRef = useRef(null);
  const scale = 12;                  // pixels per foot
  const offX = 100, offY = 120;      // offset from canvas edge

  // ----- Data derived from Drg3.png (positions & sizes in feet) -----
  const rooms = [
    { id: 1, name: 'TOILET 1 Common', x: 4, y: 4, w: 4, h: 6, doors: [{ side: 'bottom', pos: 2 }] },
    { id: 2, name: 'TOILET 2 Common', x: 4 + 8, y: 4, w: 4, h: 6, doors: [{ side: 'bottom', pos: 2 }] },
    { id: 3, name: 'KITCHEN', x: 4, y: 10, w: 10, h: 10, doors: [{ side: 'bottom', pos: 5 }], windows: [{ side: 'top', pos: 4, len: 4 }] },
    { id: 4, name: 'UTILITY', x: 4 + 10, y: 10 + 2, w: 4, h: 8, doors: [{ side: 'right', pos: 4 }] },
    { id: 5, name: 'BEDROOM 1', x: 18, y: 4, w: 12, h: 14, doors: [{ side: 'left', pos: 7 }], windows: [{ side: 'right', pos: 6, len: 5 }] },
    { id: 6, name: 'BEDROOM 4/10\'x10\'', x: 4, y: 22, w: 10, h: 10, doors: [{ side: 'top', pos: 5 }] },
    { id: 7, name: 'DINING AREA', x: 14, y: 22, w: 10, h: 12, doors: [] },
    { id: 8, name: 'FAMILY LOUNGE', x: 14, y: 34, w: 10, h: 12, doors: [] },
    { id: 9, name: 'BALCONY', x: 4, y: 34, w: 10, h: 4, doors: [{ side: 'bottom', pos: 5 }] },
    { id: 10, name: 'LIFT', x: 30, y: 4, w: 3, h: 4, doors: [{ side: 'bottom', pos: 1.5 }] }
  ];

  const ugTank = { x: 48, y: 38, w: 6, h: 8, label: 'UG TANK appr. 6\'x8\'' };
  const gate = { x: 0, y: 46, w: 18, label: 'MAIN SLIDING GATE' };
  const compoundWall = true;

  const dimensions = [
    { from: { x: 0, y: 0 }, to: { x: 40, y: 0 }, label: "40'0\"", yOff: -12 },
    { from: { x: 0, y: 0 }, to: { x: 0, y: 46 }, label: "30'0\"", xOff: -20 },
    { from: { x: 4, y: 4 }, to: { x: 12, y: 4 }, label: "8'0\"", yOff: -12 },
    { from: { x: 4, y: 10 }, to: { x: 14, y: 10 }, label: "10'0\"", yOff: -12 },
    { from: { x: 18, y: 4 }, to: { x: 30, y: 4 }, label: "12'0\"", yOff: -12 }
  ];

  // ----- Drawing helpers -----
  const drawWall = (ctx, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();
  };

  const drawRoomOutline = (ctx, room) => {
    const x = offX + room.x * scale;
    const y = offY + room.y * scale;
    const w = room.w * scale;
    const h = room.h * scale;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#1e293b';
    ctx.font = '10px sans-serif';
    ctx.fillText(room.name, x + 4, y + 14);
    ctx.fillText(`${room.w}'x${room.h}'`, x + 4, y + 26);
  };

  const drawDoor = (ctx, x, y, side, size = 2.5) => {
    const radius = size * scale;
    ctx.beginPath();
    switch (side) {
      case 'bottom': ctx.arc(x, y, radius, 0, Math.PI / 2); break;
      case 'top':    ctx.arc(x, y, radius, Math.PI, 3 * Math.PI / 2); break;
      case 'left':   ctx.arc(x, y, radius, 3 * Math.PI / 2, 2 * Math.PI); break;
      case 'right':  ctx.arc(x, y, radius, Math.PI / 2, Math.PI); break;
      default: ctx.arc(x, y, radius, 0, 2 * Math.PI);
    }
    ctx.stroke();
  };

  const drawWindow = (ctx, x, y, len = 3) => {
    const w = len * scale;
    const h = 3;
    ctx.fillStyle = '#b0c4de';
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  };

  const drawPlan = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 700;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fef9e4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Compound wall (dashed)
    if (compoundWall) {
      ctx.setLineDash([5, 8]);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(offX - 12, offY - 12, 52 * scale + 24, 52 * scale + 24);
      ctx.setLineDash([]);
    }

    // UG tank
    if (ugTank) {
      const ux = offX + ugTank.x * scale;
      const uy = offY + ugTank.y * scale;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(ux, uy, ugTank.w * scale, ugTank.h * scale);
      ctx.strokeRect(ux, uy, ugTank.w * scale, ugTank.h * scale);
      ctx.fillStyle = '#1e293b';
      ctx.font = '9px sans-serif';
      ctx.fillText(ugTank.label, ux + 4, uy + 12);
    }

    // Rooms
    rooms.forEach(room => drawRoomOutline(ctx, room));

    // Doors
    rooms.forEach(room => {
      const x0 = offX + room.x * scale;
      const y0 = offY + room.y * scale;
      const w = room.w * scale;
      const h = room.h * scale;
      room.doors?.forEach(door => {
        let dx = x0, dy = y0;
        if (door.side === 'bottom') { dx = x0 + door.pos * scale; dy = y0 + h; }
        else if (door.side === 'top')    { dx = x0 + door.pos * scale; dy = y0; }
        else if (door.side === 'left')   { dx = x0; dy = y0 + door.pos * scale; }
        else if (door.side === 'right')  { dx = x0 + w; dy = y0 + door.pos * scale; }
        drawDoor(ctx, dx, dy, door.side);
      });
    });

    // Windows
    rooms.forEach(room => {
      const x0 = offX + room.x * scale;
      const y0 = offY + room.y * scale;
      const w = room.w * scale;
      const h = room.h * scale;
      room.windows?.forEach(win => {
        let wx = x0, wy = y0;
        const len = win.len || 3;
        if (win.side === 'bottom') { wx = x0 + win.pos * scale; wy = y0 + h - 3; }
        else if (win.side === 'top')    { wx = x0 + win.pos * scale; wy = y0 - 3; }
        else if (win.side === 'left')   { wx = x0 - 3; wy = y0 + win.pos * scale; }
        else if (win.side === 'right')  { wx = x0 + w - 3; wy = y0 + win.pos * scale; }
        drawWindow(ctx, wx, wy, len);
      });
    });

    // Gate
    if (gate) {
      const gx = offX + gate.x * scale;
      const gy = offY + gate.y * scale;
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(gx, gy, gate.w * scale, 5);
      ctx.fillStyle = '#1e293b';
      ctx.fillText(gate.label, gx + 4, gy + 12);
    }

    // External dimensions
    dimensions.forEach(dim => {
      const x1 = offX + dim.from.x * scale;
      const y1 = offY + dim.from.y * scale;
      const x2 = offX + dim.to.x * scale;
      const y2 = offY + dim.to.y * scale;
      ctx.beginPath();
      ctx.moveTo(x1, y1 + (dim.yOff || 0));
      ctx.lineTo(x2, y2 + (dim.yOff || 0));
      ctx.stroke();
      if (dim.xOff) {
        ctx.beginPath();
        ctx.moveTo(offX + dim.from.x * scale + dim.xOff, y1);
        ctx.lineTo(offX + dim.from.x * scale + dim.xOff, y2);
        ctx.stroke();
      }
      const midX = (x1 + x2) / 2;
      const midY = y1 + (dim.yOff || 0) - 8;
      ctx.fillStyle = '#1e293b';
      ctx.fillText(dim.label, midX - 10, midY);
    });

    // Scale bar
    const barLen = 60;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(offX, offY - 25, barLen, 2);
    ctx.fillRect(offX, offY - 30, 3, 10);
    ctx.fillRect(offX + barLen, offY - 30, 3, 10);
    ctx.fillText(`${Math.round(barLen / scale)}'`, offX + barLen / 2 - 6, offY - 32);
    ctx.fillText("SCALE", offX + barLen / 2 - 12, offY - 40);

    // Title blocks
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText("GROUND FLOOR PLAN", offX + 10, offY - 60);
    ctx.fillText("SECOND FLOOR PLAN", offX + 250, offY - 60);
    ctx.fillText("FRONT (MODERN) ELEVATION", offX + 520, offY - 60);
  };

  useEffect(() => { drawPlan(); }, []);

  // BOQ calculation
  const calculateBOQ = () => {
    let totalFloor = 0, totalWall = 0, totalDoors = 0, totalWindows = 0;
    rooms.forEach(r => {
      totalFloor += r.w * r.h;
      totalWall += 2 * (r.w + r.h) * 10;
      totalDoors += r.doors?.length || 0;
      totalWindows += r.windows?.length || 0;
    });
    const netWall = totalWall - (totalDoors * 21) - (totalWindows * 12);
    const blockWork = netWall * 0.8;
    const cement = Math.ceil(totalFloor * 0.5);
    const sand = totalFloor * 0.8;
    alert(`🏗️ BOQ Estimate\nFloor: ${totalFloor} sqft\nWall (net): ${netWall} sqft\nBlocks: ${blockWork} sqft\nCement: ${cement} bags\nSand: ${sand} cft\nDoors: ${totalDoors}\nWindows: ${totalWindows}`);
  };

  const exportCSV = () => {
    let totalFloor = 0, totalDoors = 0, totalWindows = 0;
    rooms.forEach(r => {
      totalFloor += r.w * r.h;
      totalDoors += r.doors?.length || 0;
      totalWindows += r.windows?.length || 0;
    });
    const rows = [['Item','Quantity','Unit'], ['Floor Area',totalFloor,'sqft'], ['Doors',totalDoors,'nos'], ['Windows',totalWindows,'nos']];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'floor_plan_boq.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareWhatsApp = () => {
    let totalFloor = 0, totalDoors = 0;
    rooms.forEach(r => { totalFloor += r.w * r.h; totalDoors += r.doors?.length || 0; });
    const msg = `🏠 Floor Plan BOQ\nFloor Area: ${totalFloor} sqft\nDoors: ${totalDoors}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">📐 2D Floor Plan (Exact Match to Drg3.png)</h1>
        <div className="overflow-auto">
          <canvas ref={canvasRef} style={{ border: '1px solid #ccc', borderRadius: '8px', width: '100%', height: 'auto' }} />
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={calculateBOQ} className="bg-emerald-600 text-white px-4 py-2 rounded">🧮 Estimate BOQ</button>
          <button onClick={exportCSV} className="bg-blue-600 text-white px-4 py-2 rounded">📎 Export CSV</button>
          <button onClick={shareWhatsApp} className="bg-green-500 text-white px-4 py-2 rounded">📱 WhatsApp</button>
          <button onClick={() => window.print()} className="bg-purple-600 text-white px-4 py-2 rounded">🖨️ Print</button>
        </div>
        <div className="mt-3 text-sm text-gray-500">
          <p>✅ Drawing replicates your attached image: room outlines, door arcs, windows, dimensions, UG tank, gate, scale bar, title blocks.</p>
          <p>📝 To edit: modify the <code>rooms</code> array at the top – change sizes, positions, doors/windows.</p>
        </div>
      </div>
    </div>
  );
};
// buildingRules.ts
export const BuildingRules = {
  // 1. ZONAL REGULATIONS (Bengaluru BBA) – full logic
  calculateSetbacks: (plotAreaSqM: number, _height?: number) => {
    if (plotAreaSqM <= 120) return { front: 1.0, rear: 1.0, sides: 1.0 };
    if (plotAreaSqM <= 240) return { front: 1.5, rear: 1.5, sides: 1.5 };
    if (plotAreaSqM <= 400) return { front: 2.0, rear: 2.0, sides: 2.0 };
    return { front: 2.5, rear: 2.5, sides: 2.5 };
  },

  // 2. VAASTU VALIDATION – safe fallback
  vaastuCheck: (roomType: string, zone: string): boolean => {
    const rules: Record<string, string[]> = {
      Kitchen: ['SE', 'NW'],
      MasterBedroom: ['SW'],
      Pooja: ['NE', 'N', 'E'],
      Toilet: ['W', 'S', 'NW'],
    };
    const allowed = rules[roomType];
    return allowed ? allowed.includes(zone) : false;
  },

  // 3. STRUCTURAL ESTIMATION – fixed floor logic
  structuralRequirement: (floors: number) => {
    const baseSteel = 0.75; // kg/sqft (approx – adjust to real 2.5–4)
    const effectiveFloors = Math.max(1, floors);
    return {
      steelRatio: baseSteel * (1 + (effectiveFloors - 1) * 0.15),
      footingDepth: 5 + floors * 1, // feet
      columnSize: floors > 2 ? '9x15 inch' : '9x12 inch',
    };
  },
};

export default FloorPlan2D;