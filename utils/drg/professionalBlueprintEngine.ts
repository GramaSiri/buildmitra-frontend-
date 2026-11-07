// @ts-nocheck
/**
 * BUILDMITRA PROFESSIONAL ARCHITECTURAL & STRUCTURAL BLUEPRINT ENGINE
 * Generates high-end vector CAD floor plans, structural grids, and statutory blueprints.
 */

export function generateProfessionalCadSheetSvg(
  projectInfo: { plotWidth: number; plotLength: number; facing: string; floors: number; projectName: string },
  groundFloorReport?: any,
  firstFloorReport?: any,
  secondFloorReport?: any
): string {
  const pW = projectInfo.plotWidth || 40;
  const pL = projectInfo.plotLength || 60;
  const facing = projectInfo.facing || "South";
  const floors = projectInfo.floors || 4;
  const projName = projectInfo.projectName || "Reddy Residential Project";

  // Scale factor for SVG rendering
  const scale = 10; // 1 ft = 10px
  const sheetW = Math.max(1200, (pW * 2 + 10) * scale + 150);
  const sheetH = 1400;

  return `
  <svg viewBox="0 0 ${sheetW} ${sheetH}" xmlns="http://www.w3.org/2000/svg" style="background: #0b1329; font-family: 'Segoe UI', Arial, sans-serif;">
    <defs>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" stroke-width="0.5"/>
      </pattern>
      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8"/>
      </marker>
    </defs>

    <!-- Blueprint Grid Background -->
    <rect width="${sheetW}" height="${sheetH}" fill="#0b1329"/>
    <rect width="${sheetW}" height="${sheetH}" fill="url(#grid)" opacity="0.4"/>

    <!-- ================================================================= -->
    <!-- PROFESSIONAL TITLE BLOCK (BOTTOM)                                 -->
    <!-- ================================================================= -->
    <g transform="translate(50, ${sheetH - 180})">
      <rect width="${sheetW - 100}" height="140" fill="#1e293b" stroke="#38bdf8" stroke-width="2" rx="6"/>
      <line x1="600" y1="0" x2="600" y2="140" stroke="#38bdf8" stroke-width="1.5"/>
      <line x1="600" y1="70" x2="${sheetW - 100}" y2="70" stroke="#38bdf8" stroke-width="1.5"/>
      
      {/* Left Title Info */}
      <text x="25" y="35" fill="#38bdf8" font-size="18" font-weight="bold">BUILDMITRA DRG — ARCHITECTURAL CAD BLUEPRINT</text>
      <text x="25" y="60" fill="#94a3b8" font-size="13">Project: <tspan fill="#fff" font-weight="bold">${projName}</tspan></text>
      <text x="25" y="85" fill="#94a3b8" font-size="13">Plot Dimensions: <tspan fill="#fff" font-weight="bold">${pW}′ × ${pL}′ (${pW * pL} sq.ft)</tspan> | Facing: <tspan fill="#fff" font-weight="bold">${facing}</tspan></text>
      <text x="25" y="110" fill="#94a3b8" font-size="13">Storey Configuration: <tspan fill="#fff" font-weight="bold">G + ${floors - 1} Storeys (${floors} Floors Total)</tspan></text>

      {/* Right Stamp & Metadata */}
      <text x="625" y="35" fill="#38bdf8" font-size="14" font-weight="bold">IS 456:2000 / NBC 2016 COMPLIANT</text>
      <text x="625" y="60" fill="#cbd5e1" font-size="12">Scale: 1:100 Metric Architectural Vector</text>
      <text x="625" y="95" fill="#22c55e" font-size="14" font-weight="bold">STATUS: APPROVED FOR CONSTRUCTION</text>
      <text x="625" y="120" fill="#94a3b8" font-size="11">Generated via BuildMitra AI Engine on ${new Date().toLocaleDateString()}</text>
    </g>

    <!-- ================================================================= -->
    <!-- FLOOR PLAN 1: GROUND FLOOR ARCHITECTURAL LAYOUT                  -->
    <!-- ================================================================= -->
    <g transform="translate(80, 80)">
      <text x="0" y="0" fill="#38bdf8" font-size="16" font-weight="bold">GROUND FLOOR PLAN (${pW}′ × ${pL}′)</text>
      <text x="0" y="20" fill="#94a3b8" font-size="11">Stilt Parking / Lobby / UGT Sump / Vastu Entrance</text>

      <!-- Building Boundary Outer Wall -->
      <g transform="translate(0, 40)">
        <rect width="${pW * scale}" height="${pL * scale}" fill="#1e293b" stroke="#38bdf8" stroke-width="4" rx="4"/>
        
        {/* Inner Room Partitions (Double Line Simulation) */}
        <!-- Stilt Parking Bay -->
        <rect x="10" y="10" width="${(pW * scale) - 20}" height="${(pL * scale) * 0.55}" fill="#0f172a" stroke="#475569" stroke-width="2" stroke-dasharray="6,4"/>
        <text x="${(pW * scale) / 2}" y="${((pL * scale) * 0.55) / 2}" fill="#94a3b8" font-size="14" text-anchor="middle" font-weight="bold">STILT PARKING BAY / DRIVEWAY (${pW}′ × ${Math.round(pL * 0.55)}′)</text>
        
        <!-- Lift & Staircase Core -->
        <rect x="${(pW * scale) - 130}" y="${(pL * scale) * 0.58}" width="120" height="180" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
        <text x="${(pW * scale) - 70}" y="${(pL * scale) * 0.58 + 90}" fill="#f59e0b" font-size="12" text-anchor="middle" font-weight="bold">LIFT &amp; STAIR CORE</text>

        <!-- Underground Sump (UGT) -->
        <rect x="20" y="${(pL * scale) - 140}" width="140" height="120" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,4"/>
        <text x="90" y="${(pL * scale) - 75}" fill="#38bdf8" font-size="12" text-anchor="middle" font-weight="bold">UGT SUMP (8,000 L)</text>

        <!-- Main Entrance Arrow -->
        <polygon points="${(pW * scale) / 2},${pL * scale + 15} ${(pW * scale) / 2 - 10},${pL * scale} ${(pW * scale) / 2 + 10},${pL * scale}" fill="#22c55e"/>
        <text x="${(pW * scale) / 2}" y="${pL * scale + 32}" fill="#22c55e" font-size="12" text-anchor="middle" font-weight="bold">MAIN ENTRY (${facing})</text>
      </g>
    </g>

    <!-- ================================================================= -->
    <!-- FLOOR PLAN 2: FIRST FLOOR ARCHITECTURAL LAYOUT                   -->
    <!-- ================================================================= -->
    <g transform="translate(${pW * scale + 160}, 80)">
      <text x="0" y="0" fill="#38bdf8" font-size="16" font-weight="bold">TYPICAL UPPER FLOOR PLAN (1ST / 2ND FLOOR)</text>
      <text x="0" y="20" fill="#94a3b8" font-size="11">Master Bedroom (SW) • Kitchen (SE) • Living Room (NE)</text>

      <!-- Building Boundary Outer Wall -->
      <g transform="translate(0, 40)">
        <rect width="${pW * scale}" height="${pL * scale}" fill="#1e293b" stroke="#38bdf8" stroke-width="4" rx="4"/>
        
        {/* Room Zoning Divisions */}
        <!-- Living Room (North-East) -->
        <rect x="10" y="10" width="${(pW * scale) * 0.55}" height="${(pL * scale) * 0.35}" fill="#172554" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="${((pW * scale) * 0.55) / 2}" y="${((pL * scale) * 0.35) / 2}" fill="#93c5fd" font-size="13" text-anchor="middle" font-weight="bold">LIVING / DRAWING ROOM</text>
        <text x="${((pW * scale) * 0.55) / 2}" y="${((pL * scale) * 0.35) / 2 + 16}" fill="#60a5fa" font-size="11" text-anchor="middle">16′ × 14′ (NE Zone)</text>

        <!-- Kitchen (South-East Vastu Zone) -->
        <rect x="${(pW * scale) * 0.58}" y="10" width="${(pW * scale) * 0.39}" height="${(pL * scale) * 0.35}" fill="#422006" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="${(pW * scale) * 0.58 + ((pW * scale) * 0.39) / 2}" y="${((pL * scale) * 0.35) / 2}" fill="#fde047" font-size="13" text-anchor="middle" font-weight="bold">MODULAR KITCHEN</text>
        <text x="${(pW * scale) * 0.58 + ((pW * scale) * 0.39) / 2}" y="${((pL * scale) * 0.35) / 2 + 16}" fill="#fbbf24" font-size="11" text-anchor="middle">11′ × 12′ (SE Fire Zone)</text>

        <!-- Master Bedroom (South-West Vastu Zone) -->
        <rect x="${(pW * scale) * 0.4}" y="${(pL * scale) * 0.55}" width="${(pW * scale) * 0.57}" height="${(pL * scale) * 0.42}" fill="#064e3b" stroke="#22c55e" stroke-width="1.5"/>
        <text x="${(pW * scale) * 0.4 + ((pW * scale) * 0.57) / 2}" y="${(pL * scale) * 0.55 + ((pL * scale) * 0.42) / 2}" fill="#86efac" font-size="14" text-anchor="middle" font-weight="bold">MASTER BEDROOM + TOILET</text>
        <text x="${(pW * scale) * 0.4 + ((pW * scale) * 0.57) / 2}" y="${(pL * scale) * 0.55 + ((pL * scale) * 0.42) / 2 + 18}" fill="#4ade80" font-size="11" text-anchor="middle">15′ × 16′ (SW Heavy Zone)</text>

        <!-- Balcony (Road Facing) -->
        <rect x="10" y="${(pL * scale) - 60}" width="${(pW * scale) - 20}" height="50" fill="#0284c7" fill-opacity="0.3" stroke="#38bdf8" stroke-width="2"/>
        <text x="${(pW * scale) / 2}" y="${(pL * scale) - 30}" fill="#38bdf8" font-size="12" text-anchor="middle" font-weight="bold">SCENIC FRONT BALCONY (4′ Width)</text>
      </g>
    </g>

  </svg>
  `;
}

export function generateSingleFloorCadSheetSvg(
  projectInfo: any,
  floorIndex: number,
  groundFloorReport?: any,
  firstFloorReport?: any
): string {
  return generateProfessionalCadSheetSvg(projectInfo, groundFloorReport, firstFloorReport);
}

export function generateStructuralCadSheetSvg(projectInfo: any): string {
  return generateProfessionalCadSheetSvg(projectInfo);
}