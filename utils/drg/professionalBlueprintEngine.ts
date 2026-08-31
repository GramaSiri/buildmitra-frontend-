import { GroundFloorPlanningReport } from './types';
import { FirstFloorPlanningReport } from './firstFloorEngine';

export interface BlueprintOptions {
  plotWidth: number; // e.g. 30 or 27
  plotLength: number; // e.g. 40 or 33
  facing: 'North' | 'South' | 'East' | 'West';
  floors: number; // e.g. 3 (Ground + 1st + 2nd)
  projectName?: string;
  clientName?: string;
  sbcKpa?: number; // Safe bearing capacity
}

// HELPER: Renders Quarter-Circle Door Swing Arc
const renderDoorSwingArc = (x: number, y: number, size = 18, dir: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'top-left'): string => {
  let doorLeaf = '';
  let arcPath = '';
  if (dir === 'top-left') {
    doorLeaf = `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - size}" stroke="#0f172a" stroke-width="2"/>`;
    arcPath = `<path d="M ${x} ${y - size} A ${size} ${size} 0 0 1 ${x + size} ${y}" fill="none" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="2,2"/>`;
  } else if (dir === 'top-right') {
    doorLeaf = `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - size}" stroke="#0f172a" stroke-width="2"/>`;
    arcPath = `<path d="M ${x} ${y - size} A ${size} ${size} 0 0 0 ${x - size} ${y}" fill="none" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="2,2"/>`;
  } else if (dir === 'bottom-left') {
    doorLeaf = `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + size}" stroke="#0f172a" stroke-width="2"/>`;
    arcPath = `<path d="M ${x} ${y + size} A ${size} ${size} 0 0 0 ${x + size} ${y}" fill="none" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="2,2"/>`;
  } else {
    doorLeaf = `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + size}" stroke="#0f172a" stroke-width="2"/>`;
    arcPath = `<path d="M ${x} ${y + size} A ${size} ${size} 0 0 1 ${x - size} ${y}" fill="none" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="2,2"/>`;
  }
  return `<g className="door-swing">${doorLeaf}${arcPath}</g>`;
};

// HELPER: Renders Main Entry Arrow & Tag
const renderMainEntryArrow = (x: number, y: number, label = 'ENTRY 🚪'): string => {
  return `
    <g transform="translate(${x}, ${y})">
      <polygon points="0,0 -8,14 8,14" fill="#ef4444" />
      <rect x="-35" y="14" width="70" height="16" rx="4" fill="#ef4444" stroke="#ffffff" stroke-width="1"/>
      <text x="0" y="26" fill="#ffffff" font-size="9" font-weight="bold" text-anchor="middle">${label}</text>
    </g>
  `;
};

// HELPER: Renders Red Dimension Arrow inside rooms (matching user uploaded attachment)
const renderRoomDimensionArrow = (x1: number, y1: number, x2: number, y2: number, text: string, isVert = false): string => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  return `
    <g>
      <!-- Dimension Line -->
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ef4444" stroke-width="1.2" />
      <!-- Arrow Heads -->
      ${isVert ? `
        <polygon points="${x1},${y1} ${x1-3},${y1+8} ${x1+3},${y1+8}" fill="#ef4444" />
        <polygon points="${x2},${y2} ${x2-3},${y2-8} ${x2+3},${y2-8}" fill="#ef4444" />
      ` : `
        <polygon points="${x1},${y1} ${x1+8},${y1-3} ${x1+8},${y1+3}" fill="#ef4444" />
        <polygon points="${x2},${y2} ${x2-8},${y2-3} ${x2-8},${y2+3}" fill="#ef4444" />
      `}
      <!-- Dimension Text Box -->
      <rect x="${midX - 28}" y="${midY - 7}" width="56" height="14" fill="#ffffff" rx="3" stroke="#ef4444" stroke-width="0.5" />
      <text x="${midX}" y="${midY + 4}" fill="#ef4444" font-size="9" font-weight="bold" text-anchor="middle">${text}</text>
    </g>
  `;
};

// =====================================================================================
// 1. PURE DYNAMIC SINGLE FLOOR CAD BLUEPRINT SHEET GENERATOR
// =====================================================================================
export const generateSingleFloorCadSheetSvg = (
  opts: BlueprintOptions,
  floorLevel = 0,
  gfReport?: GroundFloorPlanningReport,
  ffReport?: FirstFloorPlanningReport
): string => {
  const w = opts.plotWidth || 30;
  const l = opts.plotLength || 40;
  const facing = opts.facing || 'South';
  const projName = opts.projectName || 'Residential Project';
  const floorTitle = floorLevel === 0 ? 'GROUND FLOOR PLAN' : floorLevel === 1 ? 'FIRST FLOOR PLAN' : 'SECOND FLOOR PLAN';

  const canvasWidth = 1000;
  const canvasHeight = 1100;

  // Scale calculations to fit plot inside 700x700px box
  const maxDim = Math.max(w, l);
  const scale = 650 / maxDim; // pixels per foot
  const startX = 120 + (650 - w * scale) / 2;
  const startY = 120 + (650 - l * scale) / 2;

  const toPxX = (x: number) => startX + x * scale;
  const toPxY = (y: number) => startY + (l - y) * scale;

  // Pick active report (Ground Floor or Upper Floor)
  const isGF = floorLevel === 0;
  const reportRooms = isGF ? gfReport?.rooms || [] : ffReport?.rooms || gfReport?.rooms || [];
  const reportWalls = isGF ? gfReport?.walls || [] : ffReport?.walls || gfReport?.walls || [];
  const reportDoors = isGF ? gfReport?.doors || [] : ffReport?.doors || gfReport?.doors || [];
  const reportWindows = isGF ? gfReport?.windows || [] : ffReport?.windows || gfReport?.windows || [];
  const reportStaircase = isGF ? gfReport?.staircase : ffReport?.staircase || gfReport?.staircase;
  const reportLift = isGF ? gfReport?.lift : ffReport?.lift || gfReport?.lift;
  const reportUGT = isGF ? gfReport?.ugt : undefined;
  const reportParking = isGF ? gfReport?.parkingBays || [] : [];

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasWidth} ${canvasHeight}" width="100%" height="100%" style="background-color: #ffffff; font-family: 'Courier New', Courier, monospace;">
      <defs>
        <pattern id="wallHatchBlue" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#1d4ed8" stroke-width="1.5" />
        </pattern>
        <pattern id="cadGridLight" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="0.5"/>
        </pattern>
        <pattern id="parkingHatch" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#bae6fd" stroke-width="0.8"/>
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="url(#cadGridLight)" />

      <!-- OUTER BLUEPRINT SHEET BORDER -->
      <rect x="25" y="25" width="${canvasWidth - 50}" height="${canvasHeight - 50}" fill="none" stroke="#0f172a" stroke-width="3" />
      <rect x="32" y="32" width="${canvasWidth - 64}" height="${canvasHeight - 64}" fill="none" stroke="#0f172a" stroke-width="1" />

      <!-- HEADER TITLE BAR -->
      <rect x="32" y="32" width="${canvasWidth - 64}" height="55" fill="#0f172a" />
      <text x="50" y="66" fill="#ffffff" font-size="20" font-weight="bold" font-family="'Segoe UI', sans-serif">
        ${floorTitle} — ${w}'0" × ${l}'0" (${w*l} SQ.FT) ${facing.toUpperCase()} FACING
      </text>
      <text x="${canvasWidth - 280}" y="66" fill="#38bdf8" font-size="14" font-weight="bold" font-family="'Segoe UI', sans-serif">
        SCALE: 1/4" = 1'-0"
      </text>

      <!-- ================================================================================= -->
      <!-- DYNAMIC SINGLE FLOOR PLAN DIAGRAM (DYNAMICALLY GENERATED FROM ENGINE REPORTS) -->
      <!-- ================================================================================= -->
      <g>
        
        <!-- OUTER RED PLOT DIMENSION ARROWS (TOP WIDTH & RIGHT LENGTH) -->
        <g>
          <!-- Top Width Red Dimension Line -->
          <line x1="${startX}" y1="${startY - 40}" x2="${startX + w * scale}" y2="${startY - 40}" stroke="#dc2626" stroke-width="1.8" />
          <line x1="${startX}" y1="${startY - 50}" x2="${startX}" y2="${startY - 30}" stroke="#dc2626" stroke-width="1.8" />
          <line x1="${startX + w * scale}" y1="${startY - 50}" x2="${startX + w * scale}" y2="${startY - 30}" stroke="#dc2626" stroke-width="1.8" />
          <polygon points="${startX},${startY - 40} ${startX + 12},${startY - 45} ${startX + 12},${startY - 35}" fill="#dc2626" />
          <polygon points="${startX + w * scale},${startY - 40} ${startX + w * scale - 12},${startY - 45} ${startX + w * scale - 12},${startY - 35}" fill="#dc2626" />
          <rect x="${startX + (w * scale) / 2 - 40}" y="${startY - 54}" width="80" height="24" fill="#ffffff" rx="4" stroke="#dc2626" stroke-width="1" />
          <text x="${startX + (w * scale) / 2}" y="${startY - 37}" fill="#dc2626" font-size="15" font-weight="bold" text-anchor="middle">${w}'0"</text>

          <!-- Right Length Red Dimension Line -->
          <line x1="${startX + w * scale + 40}" y1="${startY}" x2="${startX + w * scale + 40}" y2="${startY + l * scale}" stroke="#dc2626" stroke-width="1.8" />
          <line x1="${startX + w * scale + 30}" y1="${startY}" x2="${startX + w * scale + 50}" y2="${startY}" stroke="#dc2626" stroke-width="1.8" />
          <line x1="${startX + w * scale + 30}" y1="${startY + l * scale}" x2="${startX + w * scale + 50}" y2="${startY + l * scale}" stroke="#dc2626" stroke-width="1.8" />
          <polygon points="${startX + w * scale + 40},${startY} ${startX + w * scale + 35},${startY + 12} ${startX + w * scale + 45},${startY + 12}" fill="#dc2626" />
          <polygon points="${startX + w * scale + 40},${startY + l * scale} ${startX + w * scale + 35},${startY + l * scale - 12} ${startX + w * scale + 45},${startY + l * scale - 12}" fill="#dc2626" />
          <rect x="${startX + w * scale + 28}" y="${startY + (l * scale) / 2 - 30}" width="24" height="60" fill="#ffffff" rx="4" stroke="#dc2626" stroke-width="1" />
          <text x="${startX + w * scale + 40}" y="${startY + (l * scale) / 2 + 5}" fill="#dc2626" font-size="15" font-weight="bold" text-anchor="middle" transform="rotate(90 ${startX + w * scale + 40} ${startY + (l * scale) / 2 + 5})">${l}'0"</text>
        </g>

        <!-- 9" OUTER DOUBLE BLUE-LINE WALL ENVELOPE -->
        <rect x="${startX}" y="${startY}" width="${w * scale}" height="${l * scale}" fill="none" stroke="#1d4ed8" stroke-width="9" />
        <rect x="${startX}" y="${startY}" width="${w * scale}" height="${l * scale}" fill="url(#wallHatchBlue)" opacity="0.15" stroke="#1e40af" stroke-width="1" />
        <rect x="${startX + 6}" y="${startY + 6}" width="${w * scale - 12}" height="${l * scale - 12}" fill="#ffffff" stroke="#1d4ed8" stroke-width="2" />

        <!-- DYNAMIC PARKING AREA BAYS (FULL / HALF / STILT PARKING) -->
        ${(reportParking.length > 0 ? reportParking : [
          { id: "CP1", x: 1, y: 1, w: (w - 10) / 2, h: (l - 2) / 2 },
          { id: "CP2", x: 1 + (w - 10) / 2, y: 1, w: (w - 10) / 2, h: (l - 2) / 2 },
          { id: "CP3", x: 1, y: 1 + (l - 2) / 2, w: (w - 10) / 2, h: (l - 2) / 2 },
          { id: "CP4", x: 1 + (w - 10) / 2, y: 1 + (l - 2) / 2, w: (w - 10) / 2, h: (l - 2) / 2 },
        ]).map((bay, bIdx) => {
          const bx = toPxX(bay.x);
          const by = toPxY(bay.y + bay.h);
          const bw = bay.w * scale;
          const bh = bay.h * scale;
          return `
            <g key="bay_${bIdx}">
              <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#parkingHatch)" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4,2" />
              <rect x="${bx + bw / 2 - 25}" y="${by + bh / 2 - 35}" width="50" height="70" rx="8" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5" />
              <text x="${bx + bw / 2}" y="${by + bh / 2 + 5}" font-size="20" text-anchor="middle">🚗</text>
              <rect x="${bx + 5}" y="${by + 5}" width="${bw - 10}" height="16" rx="3" fill="#ffffff" opacity="0.9" />
              <text x="${bx + bw / 2}" y="${by + 16}" fill="#0284c7" font-size="9" font-weight="bold" text-anchor="middle">PARKING BAY (${bay.w?.toFixed(1) || 7.5}′×${bay.h?.toFixed(1) || 12}′)</text>
            </g>
          `;
        }).join('')}

        <!-- DYNAMIC INNER PARTITION WALLS -->
        ${reportWalls.filter(w => !w.isExternal).map((wall, wIdx) => {
          const wx1 = toPxX(wall.x1);
          const wy1 = toPxY(wall.y1);
          const wx2 = toPxX(wall.x2);
          const wy2 = toPxY(wall.y2);
          return `<line key="wall_${wIdx}" x1="${wx1}" y1="${wy1}" x2="${wx2}" y2="${wy2}" stroke="#1d4ed8" stroke-width="4.5" stroke-linecap="square" />`;
        }).join('')}

        <!-- DYNAMIC STRUCTURAL COLUMNS (DARK SOLID 9"x9" BLOCKS AT CORNERS) -->
        ${[
          [0, 0], [w / 2, 0], [w, 0],
          [0, l / 2], [w / 2, l / 2], [w, l / 2],
          [0, l], [w / 2, l], [w, l]
        ].map(([cx, cy]) => {
          const px = toPxX(cx) - 8;
          const py = toPxY(cy) - 8;
          return `<rect x="${px}" y="${py}" width="16" height="16" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" />`;
        }).join('')}

        <!-- DYNAMIC ROOMS WITH RED DIMENSION ARROWS & ICONOGRAPHY -->
        ${reportRooms.map((r, rIdx) => {
          const rx = toPxX(r.x);
          const ry = toPxY(r.y + r.h);
          const rw = r.w * scale;
          const rh = r.h * scale;

          let icon = '🚪';
          if (r.isMaster || r.name.toLowerCase().includes('bed')) icon = '🛏️';
          else if (r.isKitchen || r.name.toLowerCase().includes('kitchen')) icon = '🍳';
          else if (r.isDining || r.name.toLowerCase().includes('dining')) icon = '🍽️';
          else if (r.isLiving || r.name.toLowerCase().includes('living')) icon = '🛋️';
          else if (r.isPooja || r.name.toLowerCase().includes('pooja')) icon = '🛕';
          else if (r.isToilet || r.name.toLowerCase().includes('toilet')) icon = '🚽';
          else if (r.isStore || r.name.toLowerCase().includes('store')) icon = '📦';
          else if (r.isUtility || r.name.toLowerCase().includes('utility')) icon = '🧺';
          else if (r.isFoyer || r.name.toLowerCase().includes('foyer')) icon = '🏛️';

          return `
            <g key="room_${rIdx}">
              <!-- Room Floor Rectangle -->
              <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="#f8fafc" stroke="#94a3b8" stroke-width="1" />
              
              <!-- Room Name & Area Tag -->
              <text x="${rx + rw / 2}" y="${ry + rh / 2 - 8}" fill="#0f172a" font-size="13" font-weight="bold" text-anchor="middle">${r.name.toUpperCase()}</text>
              <text x="${rx + rw / 2}" y="${ry + rh / 2 + 15}" font-size="18" text-anchor="middle">${icon}</text>

              <!-- Dynamic Red Room Dimension Arrows (Internal) -->
              ${rw > 50 ? renderRoomDimensionArrow(rx + 12, ry + rh / 2 + 25, rx + rw - 12, ry + rh / 2 + 25, `${r.w.toFixed(0)}'-0"`) : ''}
              ${rh > 50 ? renderRoomDimensionArrow(rx + rw / 2 - 25, ry + 12, rx + rw / 2 - 25, ry + rh - 12, `${r.h.toFixed(0)}'-0"`, true) : ''}
            </g>
          `;
        }).join('')}

        <!-- DYNAMIC STAIRCASE CORE WITH TREAD LINES & DIRECTION ARROW -->
        ${reportStaircase ? `
          <g transform="translate(${toPxX(reportStaircase.x)}, ${toPxY(reportStaircase.y + reportStaircase.h)})">
            <rect width="${reportStaircase.w * scale}" height="${reportStaircase.h * scale}" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
            ${Array.from({ length: 8 }).map((_, stIdx) => `
              <line x1="0" y1="${(reportStaircase.h * scale / 8) * stIdx}" x2="${reportStaircase.w * scale}" y2="${(reportStaircase.h * scale / 8) * stIdx}" stroke="#475569" stroke-width="1" />
            `).join('')}
            <line x1="${(reportStaircase.w * scale) / 2}" y1="${reportStaircase.h * scale - 10}" x2="${(reportStaircase.w * scale) / 2}" y2="15" stroke="#0284c7" stroke-width="2" />
            <polygon points="${(reportStaircase.w * scale) / 2},5 ${(reportStaircase.w * scale) / 2 - 6},18 ${(reportStaircase.w * scale) / 2 + 6},18" fill="#0284c7" />
            <text x="${(reportStaircase.w * scale) / 2}" y="${(reportStaircase.h * scale) / 2}" fill="#0284c7" font-size="11" font-weight="bold" text-anchor="middle">STAIR UP ↑</text>
            <text x="${(reportStaircase.w * scale) / 2}" y="${(reportStaircase.h * scale) / 2 + 15}" fill="#64748b" font-size="9" text-anchor="middle">WIDTH 3'-3"</text>
          </g>
        ` : ''}

        <!-- DYNAMIC LIFT CORE -->
        ${reportLift ? `
          <g transform="translate(${toPxX(reportLift.x)}, ${toPxY(reportLift.y + reportLift.h)})">
            <rect width="${reportLift.w * scale}" height="${reportLift.h * scale}" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
            <rect x="4" y="4" width="${reportLift.w * scale - 8}" height="${reportLift.h * scale - 8}" fill="#f1f5f9" stroke="#0284c7" stroke-width="1.2" />
            <text x="${(reportLift.w * scale) / 2}" y="${(reportLift.h * scale) / 2}" fill="#0f172a" font-size="10" font-weight="bold" text-anchor="middle">LIFT 3'x4'</text>
          </g>
        ` : ''}

        <!-- DYNAMIC UNDERGROUND WATER TANK (UGT) -->
        ${reportUGT ? `
          <g transform="translate(${toPxX(reportUGT.x)}, ${toPxY(reportUGT.y + reportUGT.h)})">
            <rect width="${reportUGT.w * scale}" height="${reportUGT.h * scale}" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4,2" />
            <text x="${(reportUGT.w * scale) / 2}" y="${(reportUGT.h * scale) / 2}" fill="#0369a1" font-size="9" font-weight="bold" text-anchor="middle">UG TANK (6'x8')</text>
          </g>
        ` : ''}

        <!-- DYNAMIC DOORS WITH QUARTER ARC SWINGS -->
        ${reportDoors.map((d, dIdx) => {
          const dx = toPxX(d.x);
          const dy = toPxY(d.y);
          const dw = (d.widthFt || 3) * scale;
          return `
            <g key="door_${dIdx}" transform="translate(${dx}, ${dy})">
              ${renderDoorSwingArc(0, 0, dw, 'top-left')}
            </g>
          `;
        }).join('')}

        <!-- MAIN ENTRY ARROW -->
        ${renderMainEntryArrow(toPxX(w / 2), toPxY(0) + 10, isGF ? 'MAIN ENTRY 🚪' : 'MAIN DOOR 🚪')}

        <!-- NORTH DIRECTION COMPASS ICON -->
        <g transform="translate(${startX + w * scale - 30}, ${startY - 40})">
          <circle cx="0" cy="0" r="14" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>
          <polygon points="0,-12 -5,4 0,1 5,4" fill="#ef4444"/>
          <text x="0" y="-16" fill="#ef4444" font-size="10" font-weight="bold" text-anchor="middle">N</text>
        </g>
      </g>

      <!-- ARCHITECTURAL TITLE BLOCK (FOOTER) -->
      <g transform="translate(32, 950)">
        <rect x="0" y="0" width="${canvasWidth - 64}" height="100" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
        <line x1="320" y1="0" x2="320" y2="100" stroke="#0f172a" stroke-width="1.5" />
        <line x1="650" y1="0" x2="650" y2="100" stroke="#0f172a" stroke-width="1.5" />

        <g transform="translate(15, 20)" font-family="'Segoe UI', sans-serif">
          <text x="0" y="0" fill="#64748b" font-size="10" font-weight="bold">PROJECT NAME:</text>
          <text x="110" y="0" fill="#0f172a" font-size="12" font-weight="bold">${projName}</text>
          <text x="0" y="30" fill="#64748b" font-size="10" font-weight="bold">PLOT DIMENSION:</text>
          <text x="110" y="30" fill="#0284c7" font-size="13" font-weight="bold">${w}'0" × ${l}'0" (${w*l} SQ.FT)</text>
          <text x="0" y="60" fill="#64748b" font-size="10" font-weight="bold">ROAD FACING:</text>
          <text x="110" y="60" fill="#0f172a" font-size="12" font-weight="bold">${facing.toUpperCase()} MAIN ROAD</text>
        </g>

        <g transform="translate(340, 20)" font-family="'Segoe UI', sans-serif">
          <text x="0" y="0" fill="#64748b" font-size="10" font-weight="bold">DRAWING TITLE:</text>
          <text x="110" y="0" fill="#16a34a" font-size="13" font-weight="bold">${floorTitle}</text>
          <text x="0" y="30" fill="#64748b" font-size="10" font-weight="bold">VAASTU COMPLIANCE:</text>
          <text x="130" y="30" fill="#16a34a" font-size="11" font-weight="bold">100% VAASTU SHASTRA ALIGNED</text>
          <text x="0" y="60" fill="#64748b" font-size="10" font-weight="bold">ENGINEERING STAMP:</text>
          <text x="130" y="60" fill="#0284c7" font-size="12" font-weight="bold">APPROVED BUILDMITRA CAD SUITE</text>
        </g>

        <g transform="translate(680, 25)">
          <text x="0" y="0" fill="#0f172a" font-size="11" font-weight="bold">SCALE BAR</text>
          <rect x="0" y="10" width="120" height="10" fill="#ffffff" stroke="#0f172a" stroke-width="1" />
          <rect x="0" y="10" width="30" height="10" fill="#0f172a" />
          <rect x="60" y="10" width="30" height="10" fill="#0f172a" />
          <text x="0" y="34" fill="#64748b" font-size="9">0</text>
          <text x="30" y="34" fill="#64748b" font-size="9">1'</text>
          <text x="60" y="34" fill="#64748b" font-size="9">2'</text>
          <text x="120" y="34" fill="#64748b" font-size="9">5'</text>
        </g>
      </g>
    </svg>
  `;
};

// =====================================================================================
// 2. ARCHITECTURAL MULTI-FLOOR CAD BLUEPRINT SHEET GENERATOR
// =====================================================================================
export const generateProfessionalCadSheetSvg = (opts: BlueprintOptions): string => {
  const w = opts.plotWidth || 30;
  const l = opts.plotLength || 40;
  const facing = opts.facing || 'South';
  const projName = opts.projectName || 'Reddy Residential Building';

  const canvasWidth = 1400;
  const canvasHeight = 900;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasWidth} ${canvasHeight}" width="100%" height="100%" style="background-color: #f8fafc; font-family: 'Courier New', Courier, monospace;">
      <defs>
        <pattern id="wallHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#1e293b" stroke-width="1.5" />
        </pattern>
        <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>
        </pattern>
      </defs>

      <!-- Grid Background -->
      <rect width="100%" height="100%" fill="url(#cadGrid)" />

      <!-- OUTER CAD TITLE BLOCK SHEET BORDER -->
      <rect x="20" y="20" width="${canvasWidth - 40}" height="${canvasHeight - 40}" fill="none" stroke="#0f172a" stroke-width="4" />
      <rect x="26" y="26" width="${canvasWidth - 52}" height="${canvasHeight - 52}" fill="none" stroke="#0f172a" stroke-width="1.5" />

      <!-- HEADER TITLE BAR -->
      <rect x="26" y="26" width="${canvasWidth - 52}" height="50" fill="#0f172a" />
      <text x="40" y="58" fill="#ffffff" font-size="20" font-weight="bold" font-family="'Segoe UI', sans-serif">
        BUILDMITRA ARCHITECTURAL CAD BLUEPRINT — ${w}'0" x ${l}'0" ${facing.toUpperCase()} FACING (100% VAASTU COMPLIANT)
      </text>
      <text x="${canvasWidth - 300}" y="58" fill="#38bdf8" font-size="14" font-weight="bold" font-family="'Segoe UI', sans-serif">
        SCALE: 1/4" = 1'-0" | SHEET 1 OF 1
      </text>

      <!-- 1. GROUND FLOOR PLAN (LEFT BOX) -->
      <g transform="translate(60, 110)">
        <text x="120" y="25" fill="#0f172a" font-size="16" font-weight="bold" text-anchor="middle">GROUND FLOOR PLAN</text>
        <text x="120" y="42" fill="#64748b" font-size="11" text-anchor="middle">1/4" = 1'-0"</text>

        <g transform="translate(205, 75)">
          <circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#0f172a" stroke-width="1"/>
          <polygon points="0,-8 -4,4 0,2 4,4" fill="#ef4444"/>
          <text x="0" y="-12" fill="#ef4444" font-size="8" font-weight="bold" text-anchor="middle">N</text>
        </g>

        <rect x="20" y="60" width="200" height="280" fill="none" stroke="#1e293b" stroke-width="9" />
        <rect x="20" y="60" width="200" height="280" fill="url(#wallHatch)" stroke="#0f172a" stroke-width="1" opacity="0.2" />
        <rect x="26" y="66" width="188" height="268" fill="#ffffff" stroke="#0f172a" stroke-width="2" />

        <line x1="20" y1="50" x2="220" y2="50" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3,3" />
        <text x="120" y="46" fill="#0284c7" font-size="12" font-weight="bold" text-anchor="middle">${w}'0"</text>
        <line x1="10" y1="60" x2="10" y2="340" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3,3" />
        <text x="8" y="200" fill="#0284c7" font-size="12" font-weight="bold" text-anchor="middle" transform="rotate(-90 8 200)">${l}'0"</text>

        <rect x="35" y="328" width="100" height="12" fill="#e2e8f0" stroke="#0f172a" stroke-width="2" />
        <text x="85" y="337" fill="#0f172a" font-size="9" font-weight="bold" text-anchor="middle">MAIN SLIDING GATE (18')</text>

        <rect x="135" y="328" width="73" height="12" fill="#cbd5e1" stroke="#0f172a" stroke-width="1.5" />
        <text x="171" y="337" fill="#0f172a" font-size="8" text-anchor="middle">COMPOUND WALL</text>

        ${renderMainEntryArrow(85, 342, 'PARKING ENTRY 🚪')}

        <g transform="translate(35, 75)">
          <rect x="0" y="0" width="110" height="150" fill="none" stroke="#cbd5e1" stroke-dasharray="4,4" />
          <text x="55" y="75" fill="#64748b" font-size="11" font-weight="bold" text-anchor="middle">FULL PARKING AREA</text>
          <rect x="10" y="10" width="30" height="50" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="1.5" />
          <text x="25" y="40" font-size="12" text-anchor="middle">🚗</text>
          <rect x="50" y="10" width="30" height="50" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="1.5" />
          <text x="65" y="40" font-size="12" text-anchor="middle">🚗</text>
          <rect x="10" y="75" width="30" height="50" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="1.5" />
          <text x="25" y="105" font-size="12" text-anchor="middle">🚗</text>
          <text x="92" y="30" font-size="12" text-anchor="middle">🏍️</text>
          <text x="92" y="60" font-size="12" text-anchor="middle">🏍️</text>
        </g>

        <g transform="translate(150, 160)">
          <rect x="0" y="0" width="55" height="40" fill="#f1f5f9" stroke="#0f172a" stroke-width="4.5" />
          <line x1="0" y1="0" x2="55" y2="40" stroke="#94a3b8" stroke-width="1" />
          <line x1="55" y1="0" x2="0" y2="40" stroke="#94a3b8" stroke-width="1" />
          <text x="27" y="24" fill="#0f172a" font-size="9" font-weight="bold" text-anchor="middle">LIFT 3'x4'</text>
          ${renderDoorSwingArc(10, 40, 14, 'bottom-left')}

          <rect x="0" y="45" width="55" height="75" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
          ${[0, 10, 20, 30, 40, 50, 60].map(y => `<line x1="0" y1="${45 + y}" x2="55" y2="${45 + y}" stroke="#475569" stroke-width="1"/>`).join('')}
          <text x="27" y="85" fill="#0284c7" font-size="10" font-weight="bold" text-anchor="middle">STAIRS UP ↑</text>
        </g>

        <g transform="translate(145, 280)">
          <rect x="0" y="0" width="60" height="40" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3,3" />
          <text x="30" y="18" fill="#0369a1" font-size="8" font-weight="bold" text-anchor="middle">UG TANK</text>
          <text x="30" y="30" fill="#0369a1" font-size="7" text-anchor="middle">6'x8' (NE)</text>
        </g>

        <g transform="translate(150, 75)">
          <rect x="0" y="0" width="55" height="45" fill="#f8fafc" stroke="#475569" stroke-width="4.5" />
          ${renderDoorSwingArc(5, 45, 14, 'top-right')}
          <text x="27" y="20" fill="#0f172a" font-size="8" font-weight="bold" text-anchor="middle">TOILET 1</text>
          <text x="27" y="32" fill="#64748b" font-size="7" text-anchor="middle">4'x6' (Common)</text>
        </g>
      </g>

      <!-- 2. FIRST FLOOR PLAN (MIDDLE BOX) -->
      <g transform="translate(360, 110)">
        <text x="130" y="25" fill="#0f172a" font-size="16" font-weight="bold" text-anchor="middle">FIRST FLOOR PLAN</text>
        <text x="130" y="42" fill="#64748b" font-size="11" text-anchor="middle">1/4" = 1'-0"</text>

        <g transform="translate(225, 75)">
          <circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#0f172a" stroke-width="1"/>
          <polygon points="0,-8 -4,4 0,2 4,4" fill="#ef4444"/>
          <text x="0" y="-12" fill="#ef4444" font-size="8" font-weight="bold" text-anchor="middle">N</text>
        </g>

        <rect x="20" y="60" width="220" height="280" fill="none" stroke="#1e293b" stroke-width="9" />
        <rect x="20" y="60" width="220" height="280" fill="url(#wallHatch)" stroke="#0f172a" stroke-width="1" opacity="0.2" />
        <rect x="26" y="66" width="208" height="268" fill="#ffffff" stroke="#0f172a" stroke-width="2" />

        <line x1="20" y1="50" x2="240" y2="50" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3,3" />
        <text x="130" y="46" fill="#0284c7" font-size="12" font-weight="bold" text-anchor="middle">${w}'0"</text>

        ${renderMainEntryArrow(82, 332, 'MAIN DOOR ENTRY 🚪')}

        <g transform="translate(30, 75)">
          <rect x="0" y="0" width="105" height="130" fill="#f8fafc" stroke="#475569" stroke-width="4.5" />
          ${renderDoorSwingArc(15, 130, 20, 'top-right')}
          <text x="52" y="22" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle">LIVING ROOM</text>
          <text x="52" y="36" fill="#64748b" font-size="9" text-anchor="middle">14' x 20'</text>
          <rect x="10" y="50" width="15" height="60" rx="3" fill="#cbd5e1" stroke="#475569" />
          <rect x="10" y="100" width="50" height="15" rx="3" fill="#cbd5e1" stroke="#475569" />
          <text x="45" y="80" font-size="14" text-anchor="middle">📺</text>
        </g>

        <g transform="translate(140, 75)">
          <rect x="0" y="0" width="80" height="65" fill="#fff7ed" stroke="#c2410c" stroke-width="4.5" />
          ${renderDoorSwingArc(10, 65, 16, 'top-left')}
          <text x="40" y="20" fill="#c2410c" font-size="10" font-weight="bold" text-anchor="middle">KITCHEN (SE)</text>
          <text x="40" y="32" fill="#c2410c" font-size="8" text-anchor="middle">10'x10' (Agneeya)</text>
          <text x="60" y="50" font-size="12" text-anchor="middle">🍳</text>
          
          <rect x="45" y="35" width="35" height="30" fill="#ffedd5" stroke="#c2410c" stroke-width="2" />
          ${renderDoorSwingArc(45, 65, 12, 'top-right')}
          <text x="62" y="52" fill="#c2410c" font-size="7" font-weight="bold" text-anchor="middle">UTILITY</text>
        </g>

        <g transform="translate(140, 145)">
          <rect x="0" y="0" width="80" height="60" fill="#f8fafc" stroke="#475569" stroke-width="2" />
          <text x="40" y="20" fill="#0f172a" font-size="9" font-weight="bold" text-anchor="middle">DINING AREA</text>
          <text x="40" y="32" fill="#64748b" font-size="8" text-anchor="middle">10'x12'</text>
          <text x="40" y="48" font-size="12" text-anchor="middle">🍽️</text>
        </g>

        <g transform="translate(30, 210)">
          <rect x="0" y="0" width="105" height="85" fill="#f0fdf4" stroke="#16a34a" stroke-width="4.5" />
          ${renderDoorSwingArc(15, 0, 18, 'bottom-right')}
          <text x="52" y="22" fill="#15803d" font-size="10" font-weight="bold" text-anchor="middle">BEDROOM 1 (SW)</text>
          <text x="52" y="36" fill="#15803d" font-size="8" text-anchor="middle">12'x14' (Master)</text>
          <text x="52" y="65" font-size="16" text-anchor="middle">🛏️</text>
        </g>

        <rect x="30" y="298" width="105" height="24" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="2,2" />
        <text x="82" y="314" fill="#0369a1" font-size="9" font-weight="bold" text-anchor="middle">BALCONY 4' WIDE</text>

        <g transform="translate(140, 240)">
          <rect x="0" y="0" width="80" height="55" fill="#f8fafc" stroke="#475569" stroke-width="4.5" />
          ${renderDoorSwingArc(10, 0, 14, 'bottom-left')}
          <text x="40" y="22" fill="#0f172a" font-size="8" font-weight="bold" text-anchor="middle">TOILET 3</text>
          <text x="40" y="36" fill="#64748b" font-size="7" text-anchor="middle">5'x7' (Attached)</text>
        </g>
      </g>

      <!-- 3. SECOND FLOOR PLAN (RIGHT BOX) -->
      <g transform="translate(680, 110)">
        <text x="130" y="25" fill="#0f172a" font-size="16" font-weight="bold" text-anchor="middle">SECOND FLOOR PLAN</text>
        <text x="130" y="42" fill="#64748b" font-size="11" text-anchor="middle">1/4" = 1'-0"</text>

        <g transform="translate(225, 75)">
          <circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#0f172a" stroke-width="1"/>
          <polygon points="0,-8 -4,4 0,2 4,4" fill="#ef4444"/>
          <text x="0" y="-12" fill="#ef4444" font-size="8" font-weight="bold" text-anchor="middle">N</text>
        </g>

        <rect x="20" y="60" width="220" height="280" fill="none" stroke="#1e293b" stroke-width="9" />
        <rect x="20" y="60" width="220" height="280" fill="url(#wallHatch)" stroke="#0f172a" stroke-width="1" opacity="0.2" />
        <rect x="26" y="66" width="208" height="268" fill="#ffffff" stroke="#0f172a" stroke-width="2" />

        <g transform="translate(30, 75)">
          <rect x="0" y="0" width="100" height="85" fill="#f8fafc" stroke="#475569" stroke-width="4.5" />
          ${renderDoorSwingArc(15, 85, 18, 'top-right')}
          <text x="50" y="20" fill="#0f172a" font-size="10" font-weight="bold" text-anchor="middle">BEDROOM 2</text>
          <text x="50" y="32" fill="#64748b" font-size="8" text-anchor="middle">12'x13'</text>
          <text x="50" y="60" font-size="14" text-anchor="middle">🛏️</text>
        </g>

        <g transform="translate(135, 75)">
          <rect x="0" y="0" width="85" height="85" fill="#f8fafc" stroke="#475569" stroke-width="4.5" />
          ${renderDoorSwingArc(10, 85, 18, 'top-left')}
          <text x="42" y="20" fill="#0f172a" font-size="10" font-weight="bold" text-anchor="middle">BEDROOM 3</text>
          <text x="42" y="32" fill="#64748b" font-size="8" text-anchor="middle">11'x12'</text>
          <text x="42" y="60" font-size="14" text-anchor="middle">🛏️</text>
        </g>

        <g transform="translate(135, 165)">
          <rect x="0" y="0" width="40" height="40" fill="#f8fafc" stroke="#475569" stroke-width="3" />
          ${renderDoorSwingArc(5, 40, 12, 'top-right')}
          <text x="20" y="18" fill="#0f172a" font-size="7" font-weight="bold" text-anchor="middle">TOILET 4</text>
          <text x="20" y="30" fill="#64748b" font-size="6" text-anchor="middle">5'x7'</text>
        </g>

        <g transform="translate(30, 165)">
          <rect x="0" y="0" width="100" height="60" fill="#faf5ff" stroke="#7e22ce" stroke-width="2" />
          <text x="50" y="20" fill="#7e22ce" font-size="10" font-weight="bold" text-anchor="middle">FAMILY LOUNGE</text>
          <text x="50" y="34" fill="#7e22ce" font-size="8" text-anchor="middle">10'x12'</text>
          <text x="50" y="50" font-size="12" text-anchor="middle">🛋️</text>
        </g>

        <g transform="translate(30, 230)">
          <rect x="0" y="0" width="100" height="65" fill="#f8fafc" stroke="#475569" stroke-width="4.5" />
          ${renderDoorSwingArc(15, 0, 16, 'bottom-right')}
          <text x="50" y="20" fill="#0f172a" font-size="10" font-weight="bold" text-anchor="middle">BEDROOM 4</text>
          <text x="50" y="32" fill="#64748b" font-size="8" text-anchor="middle">10'x10'</text>
          <text x="50" y="52" font-size="12" text-anchor="middle">🛏️</text>
        </g>

        <g transform="translate(135, 210)">
          <rect x="0" y="0" width="40" height="30" fill="#f1f5f9" stroke="#0f172a" stroke-width="2" />
          <text x="20" y="18" fill="#0f172a" font-size="7" font-weight="bold" text-anchor="middle">LIFT</text>
          <rect x="0" y="32" width="85" height="50" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
          <text x="42" y="60" fill="#0284c7" font-size="9" font-weight="bold" text-anchor="middle">STAIRS ↑</text>
        </g>

        <rect x="30" y="298" width="100" height="24" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="2,2" />
        <text x="80" y="314" fill="#0369a1" font-size="9" font-weight="bold" text-anchor="middle">BALCONY</text>
      </g>

      <!-- 4. FRONT MODERN ELEVATION -->
      <g transform="translate(980, 110)">
        <text x="150" y="25" fill="#0f172a" font-size="16" font-weight="bold" text-anchor="middle">FRONT (MODERN) ELEVATION</text>
        <text x="150" y="42" fill="#64748b" font-size="11" text-anchor="middle">Scale: 1/4" = 1'-0"</text>

        <rect x="40" y="60" width="220" height="280" fill="#f8fafc" stroke="#0f172a" stroke-width="2" />
        <rect x="50" y="250" width="200" height="85" fill="#cbd5e1" stroke="#0f172a" stroke-width="2" />
        <rect x="60" y="265" width="120" height="70" fill="#475569" stroke="#0f172a" stroke-width="1.5" />
        <text x="120" y="305" fill="#ffffff" font-size="10" font-weight="bold" text-anchor="middle">SLIDING GATE</text>

        <rect x="50" y="160" width="200" height="85" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
        <rect x="60" y="165" width="140" height="75" fill="#e0f2fe" opacity="0.6" stroke="#0284c7" stroke-width="1" />
        <line x1="50" y1="225" x2="250" y2="225" stroke="#0284c7" stroke-width="3" />
        <text x="130" y="205" fill="#0369a1" font-size="10" font-weight="bold" text-anchor="middle">GLASS BALCONY 1ST FL</text>

        <rect x="50" y="70" width="200" height="85" fill="#fef3c7" stroke="#d97706" stroke-width="2" />
        <rect x="60" y="75" width="140" height="75" fill="#e0f2fe" opacity="0.6" stroke="#0284c7" stroke-width="1" />
        <line x1="50" y1="135" x2="250" y2="135" stroke="#0284c7" stroke-width="3" />
        <text x="130" y="115" fill="#b45309" font-size="10" font-weight="bold" text-anchor="middle">STONE CLADDING 2ND FL</text>

        <rect x="210" y="60" width="40" height="275" fill="#e2e8f0" stroke="#0f172a" stroke-width="2" />
        <text x="230" y="180" fill="#0f172a" font-size="9" font-weight="bold" text-anchor="middle" transform="rotate(-90 230 180)">LIFT &amp; STAIR TOWER</text>

        <line x1="270" y1="60" x2="270" y2="345" stroke="#0f172a" stroke-width="1.5" />
        <text x="285" y="120" fill="#0f172a" font-size="9" font-weight="bold">2ND FL (19'6")</text>
        <text x="285" y="210" fill="#0f172a" font-size="9" font-weight="bold">1ST FL (12'8")</text>
        <text x="285" y="300" fill="#0f172a" font-size="9" font-weight="bold">GF (1'0")</text>
      </g>

      <!-- VAASTU AUDIT SHEET -->
      <g transform="translate(60, 480)">
        <rect x="0" y="0" width="1260" height="110" fill="#ffffff" stroke="#0f172a" stroke-width="2" rx="8" />
        <rect x="0" y="0" width="1260" height="30" fill="#0f172a" rx="6" />
        <text x="15" y="20" fill="#ffffff" font-size="13" font-weight="bold" font-family="'Segoe UI', sans-serif">
          🧭 100% VAASTU COMPLIANCE ZONAL AUDIT SUMMARY &amp; DRAFTING SPECIFICATIONS
        </text>

        <g transform="translate(15, 45)" font-size="11" font-family="'Segoe UI', sans-serif">
          <text x="0" y="0" fill="#16a34a" font-weight="bold">✅ KITCHEN (AGNEEYA / SE):</text>
          <text x="180" y="0" fill="#334155">Placed strictly in South-East for Fire element (Agni Bhagwan).</text>
          <text x="0" y="22" fill="#16a34a" font-weight="bold">✅ MASTER BEDROOM (NAIRUTHI / SW):</text>
          <text x="240" y="22" fill="#334155">Placed strictly in South-West for Earth element &amp; leadership stability.</text>
          <text x="0" y="44" fill="#16a34a" font-weight="bold">✅ UG WATER TANK (EESANYA / NE):</text>
          <text x="230" y="44" fill="#334155">Underground tank placed in North-East for Water element (Ishanya).</text>
          <text x="650" y="0" fill="#16a34a" font-weight="bold">✅ DRAFTING SPECS:</text>
          <text x="770" y="0" fill="#334155">9" Outer Double Wall Hatch, 4.5" Inner Walls, Quarter Arc Door Swings.</text>
          <text x="650" y="22" fill="#16a34a" font-weight="bold">✅ MAIN ENTRANCE:</text>
          <text x="770" y="22" fill="#334155">Explicit Main Door Entry arrow &amp; Vastu directional alignment.</text>
          <text x="650" y="44" fill="#16a34a" font-weight="bold">✅ ORIENTATION:</text>
          <text x="770" y="44" fill="#334155">North Direction compass icon rendered on every floor layout.</text>
        </g>
      </g>

      <!-- TITLE BLOCK -->
      <g transform="translate(60, 610)">
        <rect x="0" y="0" width="1260" height="230" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" />
        <line x1="0" y1="50" x2="1260" y2="50" stroke="#0f172a" stroke-width="1.5" />
        <line x1="400" y1="0" x2="400" y2="230" stroke="#0f172a" stroke-width="1.5" />
        <line x1="850" y1="0" x2="850" y2="230" stroke="#0f172a" stroke-width="1.5" />

        <g transform="translate(15, 20)" font-family="'Segoe UI', sans-serif">
          <text x="0" y="0" fill="#64748b" font-size="10" font-weight="bold">PROJECT NAME:</text>
          <text x="110" y="0" fill="#0f172a" font-size="12" font-weight="bold">${projName}</text>
          <text x="0" y="50" fill="#64748b" font-size="10" font-weight="bold">PLOT DIMENSION:</text>
          <text x="120" y="50" fill="#0284c7" font-size="14" font-weight="bold">${w}'0" X ${l}'0" (${w * l} SQ.FT)</text>
          <text x="0" y="80" fill="#64748b" font-size="10" font-weight="bold">ROAD FACING:</text>
          <text x="110" y="80" fill="#0f172a" font-size="12" font-weight="bold">${facing.toUpperCase()} FACING MAIN ROAD</text>
          <text x="0" y="110" fill="#64748b" font-size="10" font-weight="bold">BUILDING STRUCTURE:</text>
          <text x="140" y="110" fill="#0f172a" font-size="12" font-weight="bold">GROUND + 2 UPPER FLOORS (G+2 / 3 STOREYS)</text>
        </g>

        <g transform="translate(420, 20)" font-family="'Segoe UI', sans-serif">
          <text x="0" y="0" fill="#64748b" font-size="10" font-weight="bold">ARCHITECTURAL DESIGN STAMP:</text>
          <text x="0" y="25" fill="#16a34a" font-size="14" font-weight="bold">APPROVED BUILDMITRA CAD VAASTU SUITE</text>
          <text x="0" y="70" fill="#64748b" font-size="10" font-weight="bold">ENGINEERING REGISTRATION:</text>
          <text x="0" y="90" fill="#0f172a" font-size="12" font-weight="bold">COA / BBMP / IS 456:2000 STRUCTURAL CODE</text>
          <text x="0" y="130" fill="#64748b" font-size="10" font-weight="bold">DRAWING CODE:</text>
          <text x="0" y="150" fill="#0284c7" font-size="14" font-weight="bold">DRG-CAD-VAASTU-${Date.now().toString().slice(-6)}</text>
        </g>

        <g transform="translate(900, 20)">
          <circle cx="60" cy="50" r="35" fill="#f8fafc" stroke="#0f172a" stroke-width="2" />
          <polygon points="60,20 52,50 60,45 68,50" fill="#ef4444" />
          <polygon points="60,80 52,50 60,55 68,50" fill="#475569" />
          <text x="60" y="15" fill="#ef4444" font-size="12" font-weight="bold" text-anchor="middle">N</text>
          <text x="60" y="96" fill="#475569" font-size="10" font-weight="bold" text-anchor="middle">NORTH</text>

          <g transform="translate(130, 30)">
            <text x="0" y="0" fill="#0f172a" font-size="11" font-weight="bold">SCALE BAR</text>
            <rect x="0" y="10" width="100" height="8" fill="#ffffff" stroke="#0f172a" stroke-width="1" />
            <rect x="0" y="10" width="25" height="8" fill="#0f172a" />
            <rect x="50" y="10" width="25" height="8" fill="#0f172a" />
            <text x="0" y="30" fill="#64748b" font-size="8">0</text>
            <text x="25" y="30" fill="#64748b" font-size="8">1'</text>
            <text x="50" y="30" fill="#64748b" font-size="8">2'</text>
            <text x="100" y="30" fill="#64748b" font-size="8">5'</text>
          </g>
        </g>
      </g>
    </svg>
  `;
};

// =====================================================================================
// 3. DEDICATED STRUCTURAL COLUMN & FOOTING GRID BLUEPRINT SHEET GENERATOR (IS 456 CODE)
// =====================================================================================
export const generateStructuralCadSheetSvg = (opts: BlueprintOptions): string => {
  const w = opts.plotWidth || 30;
  const l = opts.plotLength || 40;
  const floors = opts.floors || 3;
  const sbc = opts.sbcKpa || 250;
  const projName = opts.projectName || 'Reddy Residential Building';

  const canvasWidth = 1400;
  const canvasHeight = 900;

  const colSizeStr = floors >= 4 ? '12" × 18" (300×450mm)' : floors === 3 ? '9" × 15" (230×380mm)' : '9" × 12" (230×300mm)';
  const mainBarStr = floors >= 4 ? '8 Nos 16mm/20mm Fe500D TMT' : floors === 3 ? '6 Nos 16mm Fe500D TMT' : '6 Nos 12mm Fe500D TMT';
  const tiesStr = '8mm @ 150mm c/c Mid | 8mm @ 100mm c/c Ends';
  
  const ftSizeStr = sbc >= 250 ? '4\'6" × 4\'6" × 1\'8" (1.35m × 1.35m)' : sbc >= 180 ? '5\'6" × 5\'6" × 1\'10" (1.65m × 1.65m)' : '6\'6" × 6\'6" × 2\'0" (1.98m × 1.98m)';
  const ftMatStr = sbc >= 250 ? '10mm Fe500D @ 150mm c/c Both Ways' : sbc >= 180 ? '12mm Fe500D @ 125mm c/c Both Ways' : '12mm Fe500D @ 100mm c/c Mesh';

  const beamSizeStr = '9" × 12" (230×300mm)';
  const beamRebarStr = 'Top: 2-12mm | Bot: 3-12mm | Stirrups: 8mm @ 150 c/c';

  const colsX = w <= 36 ? 3 : w <= 55 ? 4 : 5;
  const colsY = l <= 45 ? 4 : l <= 65 ? 5 : 6;
  const totalCols = colsX * colsY;

  const xSpanFt = (w / (colsX - 1)).toFixed(1);
  const ySpanFt = (l / (colsY - 1)).toFixed(1);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasWidth} ${canvasHeight}" width="100%" height="100%" style="background-color: #f8fafc; font-family: 'Courier New', Courier, monospace;">
      <defs>
        <pattern id="structHatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#0284c7" stroke-width="1.2" />
        </pattern>
        <pattern id="footingHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#cbd5e1" stroke-width="1" />
        </pattern>
      </defs>

      <!-- OUTER CAD SHEET BORDER -->
      <rect x="20" y="20" width="${canvasWidth - 40}" height="${canvasHeight - 40}" fill="none" stroke="#0f172a" stroke-width="4" />
      <rect x="26" y="26" width="${canvasWidth - 52}" height="${canvasHeight - 52}" fill="none" stroke="#0f172a" stroke-width="1.5" />

      <!-- HEADER TITLE BAR -->
      <rect x="26" y="26" width="${canvasWidth - 52}" height="50" fill="#0369a1" />
      <text x="40" y="58" fill="#ffffff" font-size="18" font-weight="bold" font-family="'Segoe UI', sans-serif">
        BUILDMITRA STRUCTURAL ENGINEERING BLUEPRINT — COLUMN &amp; FOOTING GRID LAYOUT (IS 456 / IS 13920)
      </text>
      <text x="${canvasWidth - 340}" y="58" fill="#e0f2fe" font-size="13" font-weight="bold" font-family="'Segoe UI', sans-serif">
        PLOT: ${w}'0" × ${l}'0" | ${totalCols} RCC COLUMNS
      </text>

      <g transform="translate(60, 100)">
        <text x="320" y="22" fill="#0f172a" font-size="16" font-weight="bold" text-anchor="middle">
          STRUCTURAL COLUMN CENTERLINE &amp; FOOTING LAYOUT (${colsX}×${colsY} GRID — ${totalCols} COLS)
        </text>

        <rect x="60" y="60" width="520" height="400" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-dasharray="6,4" />
        <text x="320" y="52" fill="#0f172a" font-size="12" font-weight="bold" text-anchor="middle">
          OUTER PLOT BOUNDARY (${w}'0" × ${l}'0" — ${w*l} SQ.FT)
        </text>

        ${Array.from({ length: colsX }).map((_, ix) => {
          const gx = 80 + (480 / (colsX - 1)) * ix;
          const letter = String.fromCharCode(65 + ix);
          const nextGx = ix < colsX - 1 ? 80 + (480 / (colsX - 1)) * (ix + 1) : null;
          return `
            <line x1="${gx}" y1="40" x2="${gx}" y2="480" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="8,4" />
            <circle cx="${gx}" cy="30" r="12" fill="#0f172a" stroke="#0284c7" stroke-width="1.5"/>
            <text x="${gx}" y="34" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">${letter}</text>
            <circle cx="${gx}" cy="490" r="12" fill="#0f172a" stroke="#0284c7" stroke-width="1.5"/>
            <text x="${gx}" y="494" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">${letter}</text>
            
            ${nextGx ? `
              <line x1="${gx}" y1="18" x2="${nextGx}" y2="18" stroke="#0284c7" stroke-width="1" />
              <line x1="${gx}" y1="14" x2="${gx}" y2="22" stroke="#0284c7" stroke-width="1" />
              <line x1="${nextGx}" y1="14" x2="${nextGx}" y2="22" stroke="#0284c7" stroke-width="1" />
              <rect x="${(gx + nextGx) / 2 - 35}" y="10" width="70" height="15" fill="#ffffff" rx="3" stroke="#0284c7" stroke-width="0.5" />
              <text x="${(gx + nextGx) / 2}" y="21" fill="#0284c7" font-size="10" font-weight="bold" text-anchor="middle">${xSpanFt}' c/c</text>
            ` : ''}
          `;
        }).join('')}

        ${Array.from({ length: colsY }).map((_, iy) => {
          const gy = 80 + (360 / (colsY - 1)) * iy;
          const num = iy + 1;
          const nextGy = iy < colsY - 1 ? 80 + (360 / (colsY - 1)) * (iy + 1) : null;
          return `
            <line x1="40" y1="${gy}" x2="600" y2="${gy}" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="8,4" />
            <circle cx="25" cy="${gy}" r="12" fill="#0f172a" stroke="#0284c7" stroke-width="1.5"/>
            <text x="25" y="${gy + 4}" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">${num}</text>
            <circle cx="615" cy="${gy}" r="12" fill="#0f172a" stroke="#0284c7" stroke-width="1.5"/>
            <text x="615" y="${gy + 4}" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">${num}</text>

            ${nextGy ? `
              <line x1="635" y1="${gy}" x2="635" y2="${nextGy}" stroke="#0284c7" stroke-width="1" />
              <line x1="631" y1="${gy}" x2="639" y2="${gy}" stroke="#0284c7" stroke-width="1" />
              <line x1="631" y1="${nextGy}" x2="639" y2="${nextGy}" stroke="#0284c7" stroke-width="1" />
              <rect x="640" y="${(gy + nextGy) / 2 - 8}" width="55" height="15" fill="#ffffff" rx="3" stroke="#0284c7" stroke-width="0.5" />
              <text x="667" y="${(gy + nextGy) / 2 + 3}" fill="#0284c7" font-size="9" font-weight="bold" text-anchor="middle">${ySpanFt}' c/c</text>
            ` : ''}
          `;
        }).join('')}

        ${Array.from({ length: colsX }).map((_, ix) => {
          const gx = 80 + (480 / (colsX - 1)) * ix;
          return Array.from({ length: colsY }).map((_, iy) => {
            const gy = 80 + (360 / (colsY - 1)) * iy;
            const cNum = ix * colsY + iy + 1;
            return `
              <rect x="${gx - 32}" y="${gy - 32}" width="64" height="64" fill="none" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,2" />
              <rect x="${gx - 26}" y="${gy - 26}" width="52" height="52" fill="url(#footingHatch)" stroke="#0284c7" stroke-width="1.5" />
              
              <rect x="${gx - 26}" y="${gy - 38}" width="22" height="11" fill="#e0f2fe" rx="2" stroke="#0284c7" stroke-width="0.5" />
              <text x="${gx - 15}" y="${gy - 30}" fill="#0369a1" font-size="8" font-weight="bold" text-anchor="middle">F${cNum}</text>

              <rect x="${gx - 8}" y="${gy - 12}" width="16" height="24" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" />
              
              <rect x="${gx + 10}" y="${gy - 16}" width="22" height="12" fill="#0f172a" rx="2" stroke="#38bdf8" stroke-width="0.5" />
              <text x="${gx + 21}" y="${gy - 7}" fill="#ffffff" font-size="9" font-weight="bold" text-anchor="middle">C${cNum}</text>
            `;
          }).join('');
        }).join('')}

        <text x="320" y="465" fill="#16a34a" font-size="11" font-weight="bold" text-anchor="middle">
          🟩 PLINTH &amp; TIE BEAM NETWORK — TB-1 (9"×12") CONNECTING ALL ${totalCols} COLUMNS
        </text>
      </g>

      <g transform="translate(740, 100)">
        <rect x="0" y="0" width="600" height="520" fill="#ffffff" stroke="#0f172a" stroke-width="2" rx="8" />

        <rect x="0" y="0" width="600" height="32" fill="#0f172a" rx="6" />
        <text x="15" y="22" fill="#ffffff" font-size="13" font-weight="bold" font-family="'Segoe UI', sans-serif">
          📊 IS 456 COLUMN REINFORCEMENT SCHEDULE — (G+${Math.max(1, floors - 1)} STOREYS)
        </text>

        <g transform="translate(15, 42)" font-size="10" font-family="'Segoe UI', sans-serif">
          <rect x="0" y="0" width="570" height="22" fill="#e0f2fe" stroke="#0284c7" stroke-width="1" />
          <text x="10" y="15" fill="#0369a1" font-weight="bold">MEMBER</text>
          <text x="75" y="15" fill="#0369a1" font-weight="bold">SIZE</text>
          <text x="175" y="15" fill="#0369a1" font-weight="bold">MAIN REBAR</text>
          <text x="365" y="15" fill="#0369a1" font-weight="bold">LATERAL TIES / LINKS</text>

          <text x="10" y="42" fill="#0f172a" font-weight="bold">C1 - C${totalCols}</text>
          <text x="75" y="42" fill="#0284c7" font-weight="bold">${colSizeStr}</text>
          <text x="175" y="42" fill="#16a34a" font-weight="bold">${mainBarStr}</text>
          <text x="365" y="42" fill="#334155">${tiesStr}</text>
        </g>

        <g transform="translate(0, 115)">
          <rect x="0" y="0" width="600" height="32" fill="#0369a1" />
          <text x="15" y="22" fill="#ffffff" font-size="13" font-weight="bold" font-family="'Segoe UI', sans-serif">
            🦶 FOOTING &amp; FOUNDATION SCHEDULE — SBC ${sbc} kN/m² (${sbc >= 250 ? 'Hard Soil' : sbc >= 180 ? 'Medium Soil' : 'Soft Soil'})
          </text>

          <g transform="translate(15, 42)" font-size="10" font-family="'Segoe UI', sans-serif">
            <rect x="0" y="0" width="570" height="22" fill="#e0f2fe" stroke="#0284c7" stroke-width="1" />
            <text x="10" y="15" fill="#0369a1" font-weight="bold">FOOTING</text>
            <text x="75" y="15" fill="#0369a1" font-weight="bold">TYPE</text>
            <text x="155" y="15" fill="#0369a1" font-weight="bold">FOOTING SIZE (L×B×D)</text>
            <text x="335" y="15" fill="#0369a1" font-weight="bold">MAT REINFORCEMENT</text>

            <text x="10" y="42" fill="#0f172a" font-weight="bold">F1 - F${totalCols}</text>
            <text x="75" y="42" fill="#334155">Trapezoidal</text>
            <text x="155" y="42" fill="#0284c7" font-weight="bold">${ftSizeStr}</text>
            <text x="335" y="42" fill="#16a34a" font-weight="bold">${ftMatStr}</text>
          </g>
        </g>

        <g transform="translate(0, 230)">
          <rect x="0" y="0" width="600" height="30" fill="#15803d" />
          <text x="15" y="20" fill="#ffffff" font-size="12" font-weight="bold" font-family="'Segoe UI', sans-serif">
            🧱 PLINTH &amp; TIE BEAM REINFORCEMENT SCHEDULE (IS 456 CODE)
          </text>

          <g transform="translate(15, 40)" font-size="10" font-family="'Segoe UI', sans-serif">
            <rect x="0" y="0" width="570" height="22" fill="#f0fdf4" stroke="#16a34a" stroke-width="1" />
            <text x="10" y="15" fill="#166534" font-weight="bold">BEAM MARK</text>
            <text x="90" y="15" fill="#166534" font-weight="bold">SIZE</text>
            <text x="190" y="15" fill="#166534" font-weight="bold">TOP / BOTTOM BARS</text>
            <text x="385" y="15" fill="#166534" font-weight="bold">STIRRUPS / SHEAR LINKS</text>

            <text x="10" y="42" fill="#0f172a" font-weight="bold">TB1 - TB4</text>
            <text x="90" y="42" fill="#0284c7" font-weight="bold">${beamSizeStr}</text>
            <text x="190" y="42" fill="#16a34a" font-weight="bold">${beamRebarStr.split('|')[0]} | ${beamRebarStr.split('|')[1]}</text>
            <text x="385" y="42" fill="#334155">${beamRebarStr.split('|')[2]}</text>
          </g>
        </g>

        <g transform="translate(15, 335)">
          <text x="0" y="0" fill="#0f172a" font-size="11" font-weight="bold">🔬 ISOLATED FOOTING CROSS-SECTION (IS 456 REINFORCEMENT DETAIL)</text>
          <rect x="10" y="15" width="550" height="160" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" rx="6" />

          <line x1="20" y1="40" x2="550" y2="40" stroke="#16a34a" stroke-width="2" />
          <text x="30" y="35" fill="#16a34a" font-size="9" font-weight="bold">▼ NATURAL GROUND LEVEL (NGL)</text>

          <rect x="140" y="145" width="290" height="15" fill="#e2e8f0" stroke="#475569" stroke-width="1.5" />
          <text x="285" y="156" fill="#475569" font-size="8" font-weight="bold" text-anchor="middle">PCC BED 1:4:8 (100mm THICK)</text>

          <polygon points="160,145 160,115 250,85 320,85 410,115 410,145" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5" />
          <text x="285" y="130" fill="#0369a1" font-size="9" font-weight="bold" text-anchor="middle">M25 FOOTING CONCRETE</text>

          <line x1="170" y1="140" x2="400" y2="140" stroke="#ef4444" stroke-width="2.5" />
          <text x="285" y="138" fill="#ef4444" font-size="8" font-weight="bold" text-anchor="middle">${ftMatStr}</text>

          <rect x="265" y="25" width="40" height="120" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" />
          <text x="285" y="75" fill="#ffffff" font-size="8" font-weight="bold" text-anchor="middle" transform="rotate(-90 285 75)">COLUMN C1 (${colSizeStr.split('(')[0]})</text>
        </g>
      </g>

      <!-- TITLE BLOCK -->
      <g transform="translate(60, 640)">
        <rect x="0" y="0" width="1280" height="200" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" />
        <line x1="0" y1="45" x2="1280" y2="45" stroke="#0f172a" stroke-width="1.5" />
        <line x1="420" y1="0" x2="420" y2="200" stroke="#0f172a" stroke-width="1.5" />
        <line x1="880" y1="0" x2="880" y2="200" stroke="#0f172a" stroke-width="1.5" />

        <g transform="translate(15, 18)" font-family="'Segoe UI', sans-serif">
          <text x="0" y="0" fill="#64748b" font-size="10" font-weight="bold">PROJECT NAME:</text>
          <text x="110" y="0" fill="#0f172a" font-size="12" font-weight="bold">${projName}</text>
          <text x="0" y="45" fill="#64748b" font-size="10" font-weight="bold">STRUCTURAL GRID:</text>
          <text x="130" y="45" fill="#0284c7" font-size="13" font-weight="bold">${colsX} × ${colsY} GRID (${totalCols} COLUMNS)</text>
          <text x="0" y="75" fill="#64748b" font-size="10" font-weight="bold">SOIL BEARING (SBC):</text>
          <text x="140" y="75" fill="#16a34a" font-size="12" font-weight="bold">${sbc} kN/m² (IS 1904 Code Compliance)</text>
          <text x="0" y="105" fill="#64748b" font-size="10" font-weight="bold">STRUCTURAL SYSTEM:</text>
          <text x="140" y="105" fill="#0f172a" font-size="12" font-weight="bold">RCC FRAMED STRUCTURE (IS 456:2000)</text>
        </g>

        <g transform="translate(440, 18)" font-family="'Segoe UI', sans-serif">
          <text x="0" y="0" fill="#64748b" font-size="10" font-weight="bold">STRUCTURAL ENGINEERING STAMP:</text>
          <text x="0" y="22" fill="#16a34a" font-size="13" font-weight="bold">APPROVED BUILDMITRA CIVIL STRUCTURAL SUITE</text>
          <text x="0" y="65" fill="#64748b" font-size="10" font-weight="bold">CODES &amp; STANDARDS:</text>
          <text x="0" y="85" fill="#0f172a" font-size="12" font-weight="bold">IS 456:2000, IS 13920 (DUCTILE), IS 1893 (SEISMIC)</text>
          <text x="0" y="125" fill="#64748b" font-size="10" font-weight="bold">DRAWING CODE:</text>
          <text x="0" y="145" fill="#0284c7" font-size="13" font-weight="bold">DRG-STR-GRID-${Date.now().toString().slice(-6)}</text>
        </g>

        <g transform="translate(920, 18)">
          <circle cx="60" cy="50" r="35" fill="#f8fafc" stroke="#0f172a" stroke-width="2" />
          <polygon points="60,20 52,50 60,45 68,50" fill="#ef4444" />
          <polygon points="60,80 52,50 60,55 68,50" fill="#475569" />
          <text x="60" y="15" fill="#ef4444" font-size="12" font-weight="bold" text-anchor="middle">N</text>
          <text x="60" y="96" fill="#475569" font-size="10" font-weight="bold" text-anchor="middle">NORTH</text>

          <g transform="translate(130, 30)">
            <text x="0" y="0" fill="#0f172a" font-size="11" font-weight="bold">SCALE BAR</text>
            <rect x="0" y="10" width="100" height="8" fill="#ffffff" stroke="#0f172a" stroke-width="1" />
            <rect x="0" y="10" width="25" height="8" fill="#0f172a" />
            <rect x="50" y="10" width="25" height="8" fill="#0f172a" />
            <text x="0" y="30" fill="#64748b" font-size="8">0</text>
            <text x="25" y="30" fill="#64748b" font-size="8">1'</text>
            <text x="50" y="30" fill="#64748b" font-size="8">2'</text>
            <text x="100" y="30" fill="#64748b" font-size="8">5'</text>
          </g>
        </g>
      </g>
    </svg>
  `;
};
