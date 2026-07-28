import React from "react";
import {
  DRGInputs,
  CandidateLayout,
  StructuralColumn,
  Box2D,
  PrimaryTab,
  StructuralSubview,
  StructuralPlanningReport,
  GroundFloorPlanningReport,
} from "./types";
import { generateCleanWallSegments, cutWallSegmentsAtDoors, DoorCut } from "./wallEngine";

import { FirstFloorPlanningReport } from "./firstFloorEngine";

type SvgRendererProps = {
  primaryTab: PrimaryTab;
  activeFloorLevel: number;
  structuralSubview?: StructuralSubview;
  candidate: CandidateLayout;
  inputs: DRGInputs;
  buildable: Box2D;
  columns: StructuralColumn[];
  areaStatement?: any;
  structuralPlanningReport?: StructuralPlanningReport;
  groundFloorReport?: GroundFloorPlanningReport;
  firstFloorReport?: FirstFloorPlanningReport;
};

export const ArchitecturalSvgRenderer: React.FC<SvgRendererProps> = ({
  primaryTab,
  activeFloorLevel,
  structuralSubview = "column_grid",
  candidate,
  inputs,
  buildable,
  columns,
  areaStatement,
  structuralPlanningReport,
  groundFloorReport,
  firstFloorReport,
}) => {
  const plotW = Math.max(10, inputs.plotWidth || 30);
  const plotL = Math.max(10, inputs.plotLength || 40);

  // SVG Scale & Dynamic Padding
  const scale = 16;
  const padX = plotW > 50 ? 160 : 140;
  const padY = plotL > 60 ? 160 : 140;

  const mainGridW = padX * 2 + plotW * scale;
  const mainGridH = padY * 2 + plotL * scale;

  const isStructuralTab = primaryTab === "structural" || primaryTab === "structural_planning";
  const isGroundFloorTab = primaryTab === "ground_floor" || (primaryTab === "architectural" && activeFloorLevel === 0);
  const isFirstFloorTab = primaryTab === "first_floor" || (primaryTab === "architectural" && activeFloorLevel === 1);

  const extraBottomDetailH = isStructuralTab ? 260 : isGroundFloorTab || isFirstFloorTab ? 220 : 180;

  const totalSvgW = Math.max(1300, mainGridW);
  const totalSvgH = Math.max(1000, mainGridH + extraBottomDetailH);

  const toPxX = (xFt: number) => padX + xFt * scale;
  const toPxY = (yFt: number) => padY + (plotL - yFt) * scale;

  const currentFloor = candidate.floors.find((f) => f.level === activeFloorLevel) || candidate.floors[0];

  const rawWalls = generateCleanWallSegments(currentFloor.rooms, buildable);
  const cleanWalls = cutWallSegmentsAtDoors(rawWalls, []);

  // Grid lines
  const numBaysX = buildable.w > 45 ? 5 : buildable.w > 28 ? 4 : 3;
  const numBaysY = buildable.h > 65 ? 6 : buildable.h > 45 ? 5 : buildable.h > 30 ? 4 : 3;

  const gridXCoords: number[] = [];
  for (let i = 0; i < numBaysX; i++) {
    gridXCoords.push(buildable.x + (buildable.w / (numBaysX - 1)) * i);
  }

  const gridYCoords: number[] = [];
  for (let j = 0; j < numBaysY; j++) {
    gridYCoords.push(buildable.y + (buildable.h / (numBaysY - 1)) * j);
  }

  const ftSizeStr = structuralPlanningReport?.foundationRecommendation.recommendedFootingSize || "1.50 m × 1.50 m × 0.50 m";
  const ftDimM = parseFloat(ftSizeStr.split("m")[0]) || 1.5;
  const colSizeStr = structuralPlanningReport?.columnRecommendation.columnSizeInches || "230 mm × 380 mm (9″ × 15″)";

  const roadFacing = groundFloorReport?.road.facing || inputs.facing || "East";
  const roadWidthFt = groundFloorReport?.road.widthFt || inputs.roadWidth || 30;

  return (
    <svg
      id="drg-architectural-svg"
      viewBox={`0 0 ${totalSvgW} ${totalSvgH}`}
      width="100%"
      style={{
        background: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
        border: "1px solid #94a3b8",
        fontFamily: "'Courier New', Courier, monospace, sans-serif",
      }}
      role="img"
      aria-label="BuildMitra DRG Architectural Drawing"
    >
      <defs>
        <pattern id="hatch-lift" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#94a3b8" strokeWidth="0.8" />
        </pattern>
        <pattern id="hatch-future-lift" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#ea580c" strokeWidth="1" />
        </pattern>
        <pattern id="hatch-footing" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#cbd5e1" strokeWidth="0.8" />
        </pattern>
        <pattern id="hatch-pcc" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="#94a3b8" strokeWidth="0.6" />
        </pattern>
        <pattern id="hatch-lawn" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="1.5" fill="#86efac" />
        </pattern>
        <marker id="arrow-red-start" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto-start-reverse">
          <path d="M0,3 L6,0 L6,6 Z" fill="#dc2626" />
        </marker>
        <marker id="arrow-red-end" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#dc2626" />
        </marker>
      </defs>

      {/* CAD Paper Background */}
      <rect width="100%" height="100%" fill="#fffefb" />

      {/* Outer Border Frame */}
      <rect x="15" y="15" width={totalSvgW - 30} height={totalSvgH - 30} fill="none" stroke="#0f172a" strokeWidth="2" />

      {/* Drawing Title Header */}
      {isStructuralTab ? (
        <g>
          <text x={padX} y={45} fontSize="14" fontWeight="bold" fill="#0f172a" letterSpacing="0.8">
            BUILDMITRA — PRELIMINARY STRUCTURAL GRID & FOUNDATION LAYOUT (G+{Math.max(0, inputs.floors - 1)})
          </text>
          <text x={padX} y={62} fontSize="9" fontWeight="bold" fill="#dc2626">
            STRUCTURAL PLANNING DRAWING | ALL DIMENSIONS SHOWN | PRELIMINARY — NOT FOR CONSTRUCTION
          </text>
        </g>
      ) : isGroundFloorTab ? (
        <g>
          <text x={padX} y={45} fontSize="14" fontWeight="bold" fill="#0f172a" letterSpacing="0.8">
            BUILDMITRA — PRELIMINARY GROUND FLOOR PLANNING LAYOUT
          </text>
          <text x={padX} y={62} fontSize="9" fontWeight="bold" fill="#0284c7">
            DIMENSIONED ARCHITECTURAL PLANNING DRAWING | PRELIMINARY — NOT FOR CONSTRUCTION
          </text>
        </g>
      ) : (
        <g>
          <text x={padX} y={45} fontSize="14" fontWeight="bold" fill="#0f172a" letterSpacing="1">
            BUILDMITRA ARCHITECTURAL WORKING DRAWING — {currentFloor.name.toUpperCase()}
          </text>
          <text x={padX} y={62} fontSize="9" fill="#475569">
            SCALE 1:100 | ALL DIMENSIONS IN FEET & INCHES | {inputs.buildingUse.toUpperCase()} PROJECT
          </text>
        </g>
      )}

      {/* North Arrow Symbol */}
      <g transform={`translate(${Math.max(1100, totalSvgW - 120)}, 55)`}>
        <circle cx="0" cy="0" r="20" fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" />
        <path d="M 0 -16 L -7 5 L 0 0 L 7 5 Z" fill="#0f172a" />
        <text x="-4" y="28" fontSize="12" fontWeight="bold" fill="#0f172a">
          {inputs.northDirection.charAt(0)}
        </text>
      </g>

      {/* ========================================================================= */}
      {/* PLOT ANALYSIS / PHASE 0: CLEAN 2D SITE & PLOT ENVELOPE DIAGRAM */}
      {/* ========================================================================= */}
      {primaryTab === "phase0" && (
        <g>
          {/* Plot Boundary (Solid Dark Line) */}
          <rect x={toPxX(0)} y={toPxY(plotL)} width={plotW * scale} height={plotL * scale} fill="none" stroke="#0f172a" strokeWidth="2.5" />
          <text x={toPxX(plotW / 2)} y={toPxY(plotL) - 8} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">
            OUTER PLOT BOUNDARY ({plotW} FT × {plotL} FT — {plotW * plotL} SQ.FT)
          </text>

          {/* RED DOTTED SETBACK LINES (Front, Rear, Left, Right) */}
          <rect
            x={toPxX(inputs.setbacks.left)}
            y={toPxY(plotL - inputs.setbacks.rear)}
            width={(plotW - inputs.setbacks.left - inputs.setbacks.right) * scale}
            height={(plotL - inputs.setbacks.front - inputs.setbacks.rear) * scale}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          {/* Red Setback Dimension Text Labels */}
          {inputs.setbacks.front > 0 && (
            <text x={toPxX(plotW / 2)} y={toPxY(inputs.setbacks.front / 2)} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ef4444">
              FRONT SETBACK = {inputs.setbacks.front} FT
            </text>
          )}
          {inputs.setbacks.rear > 0 && (
            <text x={toPxX(plotW / 2)} y={toPxY(plotL - inputs.setbacks.rear / 2)} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ef4444">
              REAR SETBACK = {inputs.setbacks.rear} FT
            </text>
          )}
          {inputs.setbacks.left > 0 && (
            <text x={toPxX(inputs.setbacks.left / 2)} y={toPxY(plotL / 2)} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ef4444" transform={`rotate(-90 ${toPxX(inputs.setbacks.left / 2)} ${toPxY(plotL / 2)})`}>
              LEFT SETBACK = {inputs.setbacks.left} FT
            </text>
          )}
          {inputs.setbacks.right > 0 && (
            <text x={toPxX(plotW - inputs.setbacks.right / 2)} y={toPxY(plotL / 2)} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ef4444" transform={`rotate(-90 ${toPxX(plotW - inputs.setbacks.right / 2)} ${toPxY(plotL / 2)})`}>
              RIGHT SETBACK = {inputs.setbacks.right} FT
            </text>
          )}

          {/* Maximum Buildable Footprint Area (Hatched Inner Polygon) */}
          <rect
            x={toPxX(buildable.x)}
            y={toPxY(buildable.y + buildable.h)}
            width={buildable.w * scale}
            height={buildable.h * scale}
            fill="url(#hatch-lawn)"
            stroke="#0284c7"
            strokeWidth="2.5"
          />
          <text x={toPxX(buildable.x + buildable.w / 2)} y={toPxY(buildable.y + buildable.h / 2)} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0369a1">
            MAXIMUM BUILDABLE FOOTPRINT ENVELOPE
          </text>
          <text x={toPxX(buildable.x + buildable.w / 2)} y={toPxY(buildable.y + buildable.h / 2) + 16} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0284c7">
            {buildable.w} FT × {buildable.h} FT ({buildable.w * buildable.h} SQ.FT)
          </text>

          {/* Road Visualized on Actual Facing Side */}
          {roadFacing === "South" && (
            <g>
              <rect x={toPxX(0)} y={toPxY(0)} width={plotW * scale} height={20} fill="#cbd5e1" stroke="#475569" strokeWidth="1.2" />
              <text x={toPxX(plotW / 2)} y={toPxY(-0.6)} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e293b">
                ROAD — {roadWidthFt}′-0″ WIDE (SOUTH FACING)
              </text>
            </g>
          )}
          {roadFacing === "North" && (
            <g>
              <rect x={toPxX(0)} y={toPxY(plotL) - 20} width={plotW * scale} height={20} fill="#cbd5e1" stroke="#475569" strokeWidth="1.2" />
              <text x={toPxX(plotW / 2)} y={toPxY(plotL + 0.6)} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e293b">
                ROAD — {roadWidthFt}′-0″ WIDE (NORTH FACING)
              </text>
            </g>
          )}
          {roadFacing === "East" && (
            <g>
              <rect x={toPxX(plotW)} y={toPxY(plotL)} width={20} height={plotL * scale} fill="#cbd5e1" stroke="#475569" strokeWidth="1.2" />
              <text x={toPxX(plotW + 0.6)} y={toPxY(plotL / 2)} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e293b" transform={`rotate(90 ${toPxX(plotW + 0.6)} ${toPxY(plotL / 2)})`}>
                ROAD — {roadWidthFt}′-0″ WIDE (EAST FACING)
              </text>
            </g>
          )}
          {roadFacing === "West" && (
            <g>
              <rect x={toPxX(-1.2)} y={toPxY(plotL)} width={20} height={plotL * scale} fill="#cbd5e1" stroke="#475569" strokeWidth="1.2" />
              <text x={toPxX(-0.6)} y={toPxY(plotL / 2)} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e293b" transform={`rotate(-90 ${toPxX(-0.6)} ${toPxY(plotL / 2)})`}>
                ROAD — {roadWidthFt}′-0″ WIDE (WEST FACING)
              </text>
            </g>
          )}
        </g>
      )}

      {/* ========================================================================= */}
      {/* GROUND FLOOR / ARCHITECTURAL FLOOR PLAN VIEW */}
      {/* ========================================================================= */}
      {(primaryTab === "ground_floor" || primaryTab === "architectural") && (
        <g>
          {/* Plot Boundary (Solid Dark Line) */}
          <rect x={toPxX(0)} y={toPxY(plotL)} width={plotW * scale} height={plotL * scale} fill="none" stroke="#0f172a" strokeWidth="2" />
          <text x={toPxX(plotW / 2)} y={toPxY(plotL) - 8} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f172a">
            PLOT BOUNDARY ({plotW} FT × {plotL} FT)
          </text>

          {/* RED DOTTED SETBACK LINES (Front, Rear, Left, Right) */}
          <rect
            x={toPxX(inputs.setbacks.left)}
            y={toPxY(plotL - inputs.setbacks.rear)}
            width={(plotW - inputs.setbacks.left - inputs.setbacks.right) * scale}
            height={(plotL - inputs.setbacks.front - inputs.setbacks.rear) * scale}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          {/* Red Setback Dimension Text Labels */}
          {inputs.setbacks.front > 0 && (
            <text x={toPxX(plotW / 2)} y={toPxY(inputs.setbacks.front / 2)} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ef4444">
              FRONT SETBACK = {inputs.setbacks.front} FT
            </text>
          )}
          {inputs.setbacks.rear > 0 && (
            <text x={toPxX(plotW / 2)} y={toPxY(plotL - inputs.setbacks.rear / 2)} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ef4444">
              REAR SETBACK = {inputs.setbacks.rear} FT
            </text>
          )}
          {inputs.setbacks.left > 0 && (
            <text x={toPxX(inputs.setbacks.left / 2)} y={toPxY(plotL / 2)} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ef4444" transform={`rotate(-90 ${toPxX(inputs.setbacks.left / 2)} ${toPxY(plotL / 2)})`}>
              LEFT SETBACK = {inputs.setbacks.left} FT
            </text>
          )}
          {inputs.setbacks.right > 0 && (
            <text x={toPxX(plotW - inputs.setbacks.right / 2)} y={toPxY(plotL / 2)} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ef4444" transform={`rotate(-90 ${toPxX(plotW - inputs.setbacks.right / 2)} ${toPxY(plotL / 2)})`}>
              RIGHT SETBACK = {inputs.setbacks.right} FT
            </text>
          )}

          {/* Proposed Building Line (Solid Architectural Wall Outline) */}
          <rect
            x={toPxX(buildable.x)}
            y={toPxY(buildable.y + buildable.h)}
            width={buildable.w * scale}
            height={buildable.h * scale}
            fill="none"
            stroke="#0284c7"
            strokeWidth="2"
          />

          {/* Road Visualized on Actual Facing Side */}
          {roadFacing === "South" && (
            <g>
              <rect x={toPxX(0)} y={toPxY(0)} width={plotW * scale} height={20} fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
              <text x={toPxX(plotW / 2)} y={toPxY(-0.6)} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b">
                ROAD — {roadWidthFt}′-0″ WIDE (SOUTH FACING)
              </text>
            </g>
          )}
          {roadFacing === "North" && (
            <g>
              <rect x={toPxX(0)} y={toPxY(plotL) - 20} width={plotW * scale} height={20} fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
              <text x={toPxX(plotW / 2)} y={toPxY(plotL + 0.6)} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b">
                ROAD — {roadWidthFt}′-0″ WIDE (NORTH FACING)
              </text>
            </g>
          )}
          {roadFacing === "East" && (
            <g>
              <rect x={toPxX(plotW)} y={toPxY(plotL)} width={20} height={plotL * scale} fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
              <text x={toPxX(plotW + 0.6)} y={toPxY(plotL / 2)} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b" transform={`rotate(90 ${toPxX(plotW + 0.6)} ${toPxY(plotL / 2)})`}>
                ROAD — {roadWidthFt}′-0″ WIDE (EAST FACING)
              </text>
            </g>
          )}
          {roadFacing === "West" && (
            <g>
              <rect x={toPxX(-1.2)} y={toPxY(plotL)} width={20} height={plotL * scale} fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
              <text x={toPxX(-0.6)} y={toPxY(plotL / 2)} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b" transform={`rotate(-90 ${toPxX(-0.6)} ${toPxY(plotL / 2)})`}>
                ROAD — {roadWidthFt}′-0″ WIDE (WEST FACING)
              </text>
            </g>
          )}

          {/* Vehicle Gate VG1 & Pedestrian Gate PG1 on Road Boundary */}
          {groundFloorReport?.gates.map((gate) => {
            const gx = toPxX(gate.x);
            const gy = toPxY(gate.y);
            const gw = gate.widthFt * scale;

            return (
              <g key={gate.id} transform={`translate(${gx}, ${gy})`}>
                <rect x="0" y="-4" width={gw} height="8" fill="#ffffff" stroke={gate.type === "VG1" ? "#16a34a" : "#0284c7"} strokeWidth="2" />
                <path d={`M ${gw / 2} -10 L ${gw / 2 - 4} -3 L ${gw / 2 + 4} -3 Z`} fill={gate.type === "VG1" ? "#16a34a" : "#0284c7"} />
                <text x={gw / 2} y="-12" textAnchor="middle" fontSize="8" fontWeight="bold" fill={gate.type === "VG1" ? "#16a34a" : "#0284c7"}>
                  {gate.type === "VG1" ? `VG1 VEHICLE GATE (${gate.widthFt} FT)` : `PG1 PEDESTRIAN GATE (${gate.widthFt} FT)`}
                </text>
              </g>
            );
          })}

          {/* Landscape & Open Garden Zones */}
          {groundFloorReport?.landscapeZones.map((lz) => (
            <g key={lz.id}>
              <rect x={toPxX(lz.x)} y={toPxY(lz.y + lz.h)} width={lz.w * scale} height={lz.h * scale} fill={lz.kind === "Lawn" ? "url(#hatch-lawn)" : "#f1f5f9"} stroke="#bbf7d0" strokeWidth="0.8" />
              <text x={toPxX(lz.x + lz.w / 2)} y={toPxY(lz.y + lz.h / 2)} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#16a34a">
                {lz.kind} ({lz.areaSqFt} sq.ft)
              </text>
            </g>
          ))}

          {/* Underground Water Tank (UGT1) Symbol */}
          {groundFloorReport?.ugt && (
            <g transform={`translate(${toPxX(groundFloorReport.ugt.x)}, ${toPxY(groundFloorReport.ugt.y + groundFloorReport.ugt.h)})`}>
              <rect width={groundFloorReport.ugt.w * scale} height={groundFloorReport.ugt.h * scale} fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="6 3" />
              <circle cx={2.0 * scale} cy={2.0 * scale} r="10" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
              <text x={2.0 * scale} y={2.0 * scale + 3} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0284c7">MH</text>
              <text x={(groundFloorReport.ugt.w * scale) / 2} y={(groundFloorReport.ugt.h * scale) / 2 + 10} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0369a1">
                UGT1 ({groundFloorReport.ugt.capacityLiters.toLocaleString()} L)
              </text>
            </g>
          )}

          {/* Clean CAD Double-Line Wall Linework */}
          {groundFloorReport?.walls.map((wall) => {
            const wx1 = toPxX(wall.x1);
            const wy1 = toPxY(wall.y1);
            const wx2 = toPxX(wall.x2);
            const wy2 = toPxY(wall.y2);
            const thicknessPx = (wall.thicknessInches / 12) * scale;

            return (
              <line
                key={wall.id}
                x1={wx1}
                y1={wy1}
                x2={wx2}
                y2={wy2}
                stroke={wall.isExternal ? "#1e293b" : "#475569"}
                strokeWidth={thicknessPx}
                strokeLinecap="square"
              />
            );
          })}

          {/* CAD Doors with 90-Degree Radial Arc Leaf Swings */}
          {groundFloorReport?.doors.map((door) => {
            const dx = toPxX(door.x);
            const dy = toPxY(door.y);
            const dw = door.widthFt * scale;

            return (
              <g key={door.id} transform={`translate(${dx}, ${dy})`}>
                <rect x="-2" y="-4" width={dw + 4} height="8" fill="#ffffff" />
                <rect x="0" y="-4" width="3" height="8" fill="#0f172a" />
                <rect x={dw - 3} y="-4" width="3" height="8" fill="#0f172a" />
                <path d={`M 0 0 A ${dw} ${dw} 0 0 1 ${dw} ${dw}`} fill="none" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="3 2" />
                <line x1="0" y1="0" x2="0" y2={dw} stroke="#0f172a" strokeWidth="2.5" />
                <text x={dw / 2} y="-6" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#0284c7">
                  {door.isMainDoor ? `MAIN DOOR (${door.widthFt}′)` : `DOOR (${door.widthFt}′)`}
                </text>
              </g>
            );
          })}

          {/* CAD Windows with Triple-Line Frame Detailing */}
          {groundFloorReport?.windows.map((win) => {
            const wx = toPxX(win.x);
            const wy = toPxY(win.y);
            const ww = win.widthFt * scale;

            return (
              <g key={win.id} transform={`translate(${wx}, ${wy})`}>
                <rect x={-ww / 2 - 2} y="-5" width={ww + 4} height="10" fill="#ffffff" />
                <rect x={-ww / 2} y="-4" width={ww} height="8" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.2" />
                <line x1={-ww / 2} y1="0" x2={ww / 2} y2="0" stroke="#0284c7" strokeWidth="1.8" />
                <line x1={-ww / 2} y1="-2" x2={ww / 2} y2="-2" stroke="#64748b" strokeWidth="0.8" />
                <line x1={-ww / 2} y1="2" x2={ww / 2} y2="2" stroke="#64748b" strokeWidth="0.8" />
                <text x="0" y="-7" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#0284c7">
                  WIN ({win.widthFt}′)
                </text>
              </g>
            );
          })}

          {/* Car & Two-Wheeler Parking Bay Symbols ONLY when requested */}
          {groundFloorReport?.parkingBays.map((bay) => {
            const bx = toPxX(bay.x);
            const by = toPxY(bay.y + bay.h);
            const bw = bay.w * scale;
            const bh = bay.h * scale;

            return (
              <g key={bay.id}>
                <rect x={bx} y={by} width={bw} height={bh} fill="#f8fafc" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="4 2" />

                {bay.vehicleType === "Car" ? (
                  <g transform={`translate(${bx + bw / 2}, ${by + bh / 2})`}>
                    <rect x={-bw * 0.35} y={-bh * 0.4} width={bw * 0.7} height={bh * 0.8} fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" rx="10" />
                    <path d={`M ${-bw * 0.28} ${-bh * 0.15} L ${bw * 0.28} ${-bh * 0.15} L ${bw * 0.22} ${-bh * 0.3} L ${-bw * 0.22} ${-bh * 0.3} Z`} fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
                    <rect x={-bw * 0.25} y={bh * 0.15} width={bw * 0.5} height={bh * 0.12} fill="#ffffff" stroke="#0284c7" strokeWidth="1" rx="2" />
                    <rect x={-bw * 0.42} y={-bh * 0.3} width={bw * 0.08} height={bh * 0.18} fill="#0f172a" rx="2" />
                    <rect x={bw * 0.34} y={-bh * 0.3} width={bw * 0.08} height={bh * 0.18} fill="#0f172a" rx="2" />
                    <rect x={-bw * 0.42} y={bh * 0.12} width={bw * 0.08} height={bh * 0.18} fill="#0f172a" rx="2" />
                    <rect x={bw * 0.34} y={bh * 0.12} width={bw * 0.08} height={bh * 0.18} fill="#0f172a" rx="2" />
                    <path d="M 0 -18 L -4 -10 L 4 -10 Z" fill="#0284c7" />
                  </g>
                ) : (
                  <g transform={`translate(${bx + bw / 2}, ${by + bh / 2})`}>
                    <ellipse cx="0" cy="0" rx={bw * 0.3} ry={bh * 0.35} fill="#e2e8f0" stroke="#475569" strokeWidth="1.2" />
                    <line x1={-bw * 0.4} y1={-bh * 0.25} x2={bw * 0.4} y2={-bh * 0.25} stroke="#0f172a" strokeWidth="2" />
                  </g>
                )}

                <rect x={bx + 2} y={by + 2} width={bw - 4} height="16" fill="#ffffff" opacity="0.9" rx="2" />
                <text x={bx + bw / 2} y={by + 13} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0284c7">
                  {bay.id} ({bay.bayWidthFt}′ × {bay.bayLengthFt}′)
                </text>
              </g>
            );
          })}

          {/* Staircase Drawing Symbol (ST1) with Tread Lines & Up-Arrow */}
          {groundFloorReport?.staircase && (
            <g transform={`translate(${toPxX(groundFloorReport.staircase.x)}, ${toPxY(groundFloorReport.staircase.y + groundFloorReport.staircase.h)})`}>
              <rect width={groundFloorReport.staircase.w * scale} height={groundFloorReport.staircase.h * scale} fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />
              {Array.from({ length: 9 }).map((_, stepIdx) => (
                <line key={`st_tread_${stepIdx}`} x1="0" y1={(groundFloorReport.staircase.h * scale / 9) * stepIdx} x2={groundFloorReport.staircase.w * scale} y2={(groundFloorReport.staircase.h * scale / 9) * stepIdx} stroke="#64748b" strokeWidth="1" />
              ))}
              <line x1={(groundFloorReport.staircase.w * scale) / 2} y1={groundFloorReport.staircase.h * scale - 8} x2={(groundFloorReport.staircase.w * scale) / 2} y2="12" stroke="#0284c7" strokeWidth="2" />
              <path d={`M ${(groundFloorReport.staircase.w * scale) / 2} 4 L ${(groundFloorReport.staircase.w * scale) / 2 - 5} 14 L ${(groundFloorReport.staircase.w * scale) / 2 + 5} 14 Z`} fill="#0284c7" />
              <text x={(groundFloorReport.staircase.w * scale) / 2 + 8} y={(groundFloorReport.staircase.h * scale) / 2} fontSize="9" fontWeight="bold" fill="#0284c7">UP</text>
              <rect x="2" y="2" width="70" height="14" fill="#ffffff" opacity="0.9" />
              <text x="5" y="12" fontSize="8" fontWeight="bold" fill="#0f172a">ST1 ({groundFloorReport.staircase.type})</text>
            </g>
          )}

          {/* Lift Drawing Symbol (L1) with Shaft, Car & Sliding Door or Future Provision */}
          {groundFloorReport?.lift && (
            <g transform={`translate(${toPxX(groundFloorReport.lift.x)}, ${toPxY(groundFloorReport.lift.y + groundFloorReport.lift.h)})`}>
              {groundFloorReport.lift.isFutureProvision ? (
                <g>
                  <rect width={groundFloorReport.lift.w * scale} height={groundFloorReport.lift.h * scale} fill="url(#hatch-future-lift)" stroke="#ea580c" strokeWidth="2" strokeDasharray="4 2" />
                  <text x={(groundFloorReport.lift.w * scale) / 2} y={(groundFloorReport.lift.h * scale) / 2} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ea580c">
                    Future Lift Provision
                  </text>
                </g>
              ) : (
                <g>
                  <rect width={groundFloorReport.lift.w * scale} height={groundFloorReport.lift.h * scale} fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                  <rect x="4" y="4" width={groundFloorReport.lift.w * scale - 8} height={groundFloorReport.lift.h * scale - 8} fill="url(#hatch-lift)" stroke="#0284c7" strokeWidth="1.2" />
                  <line x1="8" y1={groundFloorReport.lift.h * scale} x2={groundFloorReport.lift.w * scale - 8} y2={groundFloorReport.lift.h * scale} stroke="#0284c7" strokeWidth="3" />
                  <text x={(groundFloorReport.lift.w * scale) / 2} y={(groundFloorReport.lift.h * scale) / 2} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f172a">
                    L1 LIFT ({groundFloorReport.lift.capacity})
                  </text>
                </g>
              )}
            </g>
          )}

          {/* Ground Floor Rooms with Clear Internal Dimensions & Carpet Area */}
          {groundFloorReport?.rooms.map((r) => {
            const rx = toPxX(r.x);
            const ry = toPxY(r.y + r.h);
            const rw = r.w * scale;
            const rh = r.h * scale;

            return (
              <g key={r.id}>
                <rect x={rx} y={ry} width={rw} height={rh} fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
                <g>
                  <rect x={rx + rw / 2 - 60} y={ry + rh / 2 - 18} width="120" height="36" fill="#ffffff" opacity="0.95" rx="3" stroke="#cbd5e1" strokeWidth="0.8" />
                  <text x={rx + rw / 2} y={ry + rh / 2 - 6} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f172a">{r.name}</text>
                  <text x={rx + rw / 2} y={ry + rh / 2 + 4} textAnchor="middle" fontSize="8" fill="#334155">{r.w.toFixed(0)}′-0″ × {r.h.toFixed(0)}′-0″</text>
                  <text x={rx + rw / 2} y={ry + rh / 2 + 14} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0284c7">{r.areaSqFt} SQ.FT</text>
                </g>
              </g>
            );
          })}

          {/* Architectural Ground Floor Symbol Legend Box */}
          <g transform={`translate(${Math.max(820, totalSvgW - 440)}, ${Math.max(680, mainGridH)})`}>
            <rect width="420" height="190" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
            <text x="12" y="18" fontSize="10" fontWeight="bold" fill="#0f172a">GROUND FLOOR ARCHITECTURAL SYMBOL LEGEND</text>
            <line x1="0" y1="24" x2="420" y2="24" stroke="#0f172a" strokeWidth="1" />

            <g transform="translate(12, 34)">
              <line x1="0" y1="6" x2="18" y2="6" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 2" />
              <text x="24" y="10" fontSize="8" fontWeight="bold" fill="#ef4444">RED DOTTED = SETBACK BOUNDARY</text>
            </g>
            <g transform="translate(210, 34)">
              <rect width="18" height="12" fill="#bae6fd" stroke="#0284c7" strokeWidth="1" />
              <text x="24" y="10" fontSize="8" fill="#334155">CP — Car Parking Bay</text>
            </g>
            <g transform="translate(12, 58)">
              <ellipse cx="9" cy="6" rx="8" ry="5" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
              <text x="24" y="10" fontSize="8" fill="#334155">TW — Two-Wheeler Bay</text>
            </g>
            <g transform="translate(210, 58)">
              <rect width="18" height="12" fill="#f8fafc" stroke="#0f172a" strokeWidth="1" />
              <line x1="0" y1="6" x2="18" y2="6" stroke="#0284c7" strokeWidth="1" />
              <text x="24" y="10" fontSize="8" fill="#334155">ST1 — Staircase (Treads & UP Arrow)</text>
            </g>
            <g transform="translate(12, 82)">
              <rect width="18" height="12" fill="url(#hatch-lift)" stroke="#0f172a" strokeWidth="1" />
              <text x="24" y="10" fontSize="8" fill="#334155">L1 — Lift Shaft & Car</text>
            </g>
            <g transform="translate(210, 82)">
              <rect width="18" height="12" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 2" />
              <text x="24" y="10" fontSize="8" fill="#334155">UGT1 — Underground Water Tank</text>
            </g>
            <g transform="translate(12, 106)">
              <rect width="18" height="12" fill="url(#hatch-lawn)" stroke="#86efac" strokeWidth="1" />
              <text x="24" y="10" fontSize="8" fill="#334155">LS — Open Garden / Lawn</text>
            </g>
            <g transform="translate(210, 106)">
              <rect width="12" height="12" fill="#0f172a" />
              <text x="24" y="10" fontSize="8" fill="#334155">C1 — R.C.C. Structural Column</text>
            </g>
            <g transform="translate(12, 130)">
              <rect width="18" height="6" fill="#ffffff" stroke="#16a34a" strokeWidth="1.5" />
              <text x="24" y="10" fontSize="8" fill="#334155">VG1 / PG1 — Main Road Gates</text>
            </g>
            <g transform="translate(210, 130)">
              <line x1="0" y1="6" x2="18" y2="6" stroke="#0284c7" strokeWidth="2.5" />
              <text x="24" y="10" fontSize="8" fill="#334155">Proposed Building Outline</text>
            </g>
          </g>
        </g>
      )}

      {/* FIRST FLOOR ARCHITECTURAL BLUEPRINT (STRICT 5-TIER SVG DOM HIERARCHY) */}
      {isFirstFloorTab && (
        <g>
          {/* ========================================================================= */}
          {/* LAYER 1 (BOTTOM): ROOM POLYGON FILLS */}
          {/* ========================================================================= */}
          {firstFloorReport?.rooms.map((r) => {
            const rx = toPxX(r.x);
            const ry = toPxY(r.y + r.h);
            const rw = r.w * scale;
            const rh = r.h * scale;

            return <rect key={`ff_fill_${r.id}`} x={rx} y={ry} width={rw} height={rh} fill="#ffffff" stroke="none" />;
          })}

          {/* Outer Plot Boundary & Allowed Balcony Projections */}
          <rect
            x={toPxX(0)}
            y={toPxY(plotL)}
            width={plotW * scale}
            height={plotL * scale}
            fill="none"
            stroke="#64748b"
            strokeWidth="1.5"
            strokeDasharray="8 4"
          />
          <text x={toPxX(plotW / 2)} y={toPxY(plotL) - 8} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f172a">
            PLOT BOUNDARY ({plotW} FT × {plotL} FT) — FIRST FLOOR WORKING DRAWING
          </text>

          {/* RED DOTTED SETBACK LINES */}
          <rect
            x={toPxX(inputs.setbacks.left)}
            y={toPxY(plotL - inputs.setbacks.rear)}
            width={(plotW - inputs.setbacks.left - inputs.setbacks.right) * scale}
            height={(plotL - inputs.setbacks.front - inputs.setbacks.rear) * scale}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          {/* Cantilever Standing Balconies */}
          {firstFloorReport?.balconies.map((balc) => (
            <g key={balc.id}>
              <rect
                x={toPxX(balc.x)}
                y={toPxY(balc.y + balc.h)}
                width={balc.w * scale}
                height={balc.h * scale}
                fill="#f0f9ff"
                stroke="#0284c7"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <line x1={toPxX(balc.x)} y1={toPxY(balc.y + balc.h)} x2={toPxX(balc.x + balc.w)} y2={toPxY(balc.y + balc.h)} stroke="#0284c7" strokeWidth="3" />
              <text x={toPxX(balc.x + balc.w / 2)} y={toPxY(balc.y + balc.h / 2)} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0369a1">
                {balc.name} ({balc.projectionFt} FT PROJECTION)
              </text>
            </g>
          ))}

          {/* ========================================================================= */}
          {/* LAYER 2: WALLS & STRUCTURAL COLUMNS */}
          {/* ========================================================================= */}
          {/* CAD Double-Line Wall Linework (9" Exterior 15px #1e293b / 4.5" Interior 7.5px #475569) */}
          {firstFloorReport?.walls.map((wall) => {
            const wx1 = toPxX(wall.x1);
            const wy1 = toPxY(wall.y1);
            const wx2 = toPxX(wall.x2);
            const wy2 = toPxY(wall.y2);
            const thicknessPx = (wall.thicknessInches / 12) * scale;

            return (
              <line
                key={wall.id}
                x1={wx1}
                y1={wy1}
                x2={wx2}
                y2={wy2}
                stroke={wall.isExternal ? "#1e293b" : "#475569"}
                strokeWidth={thicknessPx}
                strokeLinecap="square"
              />
            );
          })}

          {/* Structural Columns Overlay: SOLID FILLED DARK RECTANGLES (#0f172a) at Wall Intersections */}
          {firstFloorReport?.columns.map((col) => (
            <g key={`ff_col_${col.id}`}>
              <rect
                x={toPxX(col.x) - 7}
                y={toPxY(col.y) - 7}
                width="14"
                height="14"
                fill="#0f172a"
                stroke="#0284c7"
                strokeWidth="1.5"
              />
              <text x={toPxX(col.x)} y={toPxY(col.y) + 14} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#0284c7">
                {col.id}
              </text>
            </g>
          ))}

          {/* ========================================================================= */}
          {/* LAYER 3: 2D FURNITURE & FIXTURE BLOCKS */}
          {/* ========================================================================= */}
          {firstFloorReport?.rooms.map((r) => {
            const rx = toPxX(r.x);
            const ry = toPxY(r.y + r.h);
            const rw = r.w * scale;
            const rh = r.h * scale;

            return (
              <g key={`ff_furn_${r.id}`}>
                {/* Family Lounge Sofa & TV Unit Vector Block */}
                {r.isLiving && (
                  <g transform={`translate(${rx + 14}, ${ry + 14})`}>
                    <rect width="64" height="28" rx="3" fill="#f1f5f9" stroke="#334155" strokeWidth="1.2" />
                    <rect x="4" y="4" width="56" height="8" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
                    <rect x="12" y="34" width="40" height="18" rx="2" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
                    <rect x="0" y={rh - 36} width="64" height="8" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
                    <text x="32" y={rh - 30} textAnchor="middle" fontSize="6" fontWeight="bold" fill="#ffffff">TV UNIT</text>
                  </g>
                )}

                {/* Dining Table & 6 Chairs Vector Block */}
                {r.isDining && (
                  <g transform={`translate(${rx + rw / 2 - 28}, ${ry + rh / 2 - 20})`}>
                    <rect width="56" height="36" rx="4" fill="#f8fafc" stroke="#0284c7" strokeWidth="1.2" />
                    <circle cx="14" cy="-6" r="4" fill="#334155" />
                    <circle cx="28" cy="-6" r="4" fill="#334155" />
                    <circle cx="42" cy="-6" r="4" fill="#334155" />
                    <circle cx="14" cy="42" r="4" fill="#334155" />
                    <circle cx="28" cy="42" r="4" fill="#334155" />
                    <circle cx="42" cy="42" r="4" fill="#334155" />
                  </g>
                )}

                {/* Master Bed Vector Block */}
                {r.isMaster && (
                  <g transform={`translate(${rx + rw / 2 - 28}, ${ry + 16})`}>
                    <rect width="56" height="64" rx="3" fill="#f1f5f9" stroke="#334155" strokeWidth="1.2" />
                    <rect x="4" y="4" width="22" height="14" rx="2" fill="#ffffff" stroke="#64748b" strokeWidth="0.8" />
                    <rect x="30" y="4" width="22" height="14" rx="2" fill="#ffffff" stroke="#64748b" strokeWidth="0.8" />
                    <rect x="-14" y="4" width="12" height="14" fill="#e2e8f0" stroke="#475569" strokeWidth="0.8" />
                    <rect x="58" y="4" width="12" height="14" fill="#e2e8f0" stroke="#475569" strokeWidth="0.8" />
                  </g>
                )}

                {/* Bedroom 2 Vector Block */}
                {r.name === "BEDROOM 2" && (
                  <g transform={`translate(${rx + 16}, ${ry + 16})`}>
                    <rect width="48" height="56" rx="3" fill="#f1f5f9" stroke="#334155" strokeWidth="1.2" />
                    <rect x="4" y="4" width="40" height="12" rx="2" fill="#ffffff" stroke="#64748b" strokeWidth="0.8" />
                    <rect x={rw - 40} y="0" width="18" height="56" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
                    <text x={rw - 31} y="30" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#475569" transform={`rotate(90 ${rw - 31} 30)`}>WARDROBE</text>
                  </g>
                )}

                {/* Kitchen L-Counter Platform (40px depth), 4-Burner Hob, Double Sink & Refrigerator Block */}
                {r.isKitchen && (
                  <g transform={`translate(${rx + 6}, ${ry + 6})`}>
                    <path d={`M 0 0 L ${rw - 12} 0 L ${rw - 12} 24 L 24 24 L 24 ${rh - 12} L 0 ${rh - 12} Z`} fill="#f1f5f9" stroke="#0284c7" strokeWidth="1.2" />
                    <circle cx="36" cy="12" r="4" fill="#334155" />
                    <circle cx="48" cy="12" r="4" fill="#334155" />
                    <circle cx="36" cy="20" r="4" fill="#334155" />
                    <circle cx="48" cy="20" r="4" fill="#334155" />
                    <rect x="75" y="4" width="24" height="16" fill="#ffffff" stroke="#0284c7" strokeWidth="0.8" />
                    <circle cx="87" cy="12" r="3" fill="#0284c7" />
                    <rect x={rw - 40} y={rh - 40} width="30" height="30" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" />
                    <text x={rw - 25} y={rh - 22} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#0369a1">REF</text>
                  </g>
                )}

                {/* Utility Washing Machine & Sink Vector Block */}
                {r.isUtility && (
                  <g transform={`translate(${rx + 6}, ${ry + 6})`}>
                    <rect width="24" height="24" rx="2" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2" />
                    <circle cx="12" cy="12" r="7" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" />
                    <text x="12" y="28" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#0369a1">WM</text>
                  </g>
                )}

                {/* Store Room Shelving Vector Lines */}
                {r.isStore && (
                  <g transform={`translate(${rx + 4}, ${ry + 4})`}>
                    <line x1="0" y1="8" x2={rw - 8} y2="8" stroke="#64748b" strokeWidth="1" strokeDasharray="3 2" />
                    <line x1="0" y1="16" x2={rw - 8} y2="16" stroke="#64748b" strokeWidth="1" strokeDasharray="3 2" />
                    <text x={rw / 2 - 4} y="26" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#64748b">SHELVES</text>
                  </g>
                )}

                {/* Toilet EWC, Wash Basin & Glass Shower Partition Vector Block */}
                {r.isToilet && (
                  <g transform={`translate(${rx + rw / 2 - 12}, ${ry + rh / 2 - 14})`}>
                    <ellipse cx="12" cy="14" rx="9" ry="12" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
                    <rect x="3" y="0" width="18" height="7" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1" />
                    <line x1="-10" y1="0" x2="-10" y2="28" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 2" />
                    <circle cx="-16" cy="14" r="2" fill="#64748b" />
                  </g>
                )}

                {/* Pooja Altar Pedestal Vector Block */}
                {r.isPooja && (
                  <g transform={`translate(${rx + rw / 2 - 12}, ${ry + rh / 2 - 12})`}>
                    <rect width="24" height="24" fill="#fffbebe" stroke="#d97706" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="6" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
                    <text x="12" y="15" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#d97706">🛕</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* ========================================================================= */}
          {/* LAYER 4: DOORS & WINDOWS (WALL CUTOUTS & SWING ARCS) */}
          {/* ========================================================================= */}
          {/* CAD Doors with Wall Cutouts & 90-Degree Radial Arc Swings */}
          {firstFloorReport?.doors.map((door) => {
            const dx = toPxX(door.x);
            const dy = toPxY(door.y);
            const dw = door.widthFt * scale;

            return (
              <g key={door.id} transform={`translate(${dx}, ${dy})`}>
                <rect x="-2" y="-4" width={dw + 4} height="8" fill="#ffffff" />
                <rect x="0" y="-4" width="3" height="8" fill="#0f172a" />
                <rect x={dw - 3} y="-4" width="3" height="8" fill="#0f172a" />
                <path d={`M 0 0 A ${dw} ${dw} 0 0 1 ${dw} ${dw}`} fill="none" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="3 2" />
                <line x1="0" y1="0" x2="0" y2={dw} stroke="#0f172a" strokeWidth="2.5" />
                <text x={dw / 2} y="-6" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0284c7">
                  {door.label || (door.isMainDoor ? "D1" : "D2")} ({door.widthFt}′)
                </text>
              </g>
            );
          })}

          {/* CAD Windows & Ventilators with Triple-Line Frame Detailing */}
          {firstFloorReport?.windows.map((win) => {
            const wx = toPxX(win.x);
            const wy = toPxY(win.y);
            const ww = win.widthFt * scale;

            return (
              <g key={win.id} transform={`translate(${wx}, ${wy})`}>
                <rect x={-ww / 2 - 2} y="-5" width={ww + 4} height="10" fill="#ffffff" />
                <rect x={-ww / 2} y="-4" width={ww} height="8" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.2" />
                <line x1={-ww / 2} y1="0" x2={ww / 2} y2="0" stroke="#0284c7" strokeWidth="1.8" />
                <line x1={-ww / 2} y1="-2" x2={ww / 2} y2="-2" stroke="#64748b" strokeWidth="0.8" />
                <line x1={-ww / 2} y1="2" x2={ww / 2} y2="2" stroke="#64748b" strokeWidth="0.8" />
                <text x="0" y="-7" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0284c7">
                  {win.label || "W1"} ({win.widthFt}′)
                </text>
              </g>
            );
          })}

          {/* Staircase (UPST1 / ST1) Vertically Aligned */}
          {firstFloorReport?.staircase && (
            <g transform={`translate(${toPxX(firstFloorReport.staircase.x)}, ${toPxY(firstFloorReport.staircase.y + firstFloorReport.staircase.h)})`}>
              <rect width={firstFloorReport.staircase.w * scale} height={firstFloorReport.staircase.h * scale} fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />
              {Array.from({ length: 9 }).map((_, stepIdx) => (
                <line key={`ff_st_tread_${stepIdx}`} x1="0" y1={(firstFloorReport.staircase.h * scale / 9) * stepIdx} x2={firstFloorReport.staircase.w * scale} y2={(firstFloorReport.staircase.h * scale / 9) * stepIdx} stroke="#64748b" strokeWidth="1" />
              ))}
              <line x1={(firstFloorReport.staircase.w * scale) / 2} y1={firstFloorReport.staircase.h * scale - 8} x2={(firstFloorReport.staircase.w * scale) / 2} y2="12" stroke="#0284c7" strokeWidth="2" />
              <path d={`M ${(firstFloorReport.staircase.w * scale) / 2} 4 L ${(firstFloorReport.staircase.w * scale) / 2 - 5} 14 L ${(firstFloorReport.staircase.w * scale) / 2 + 5} 14 Z`} fill="#0284c7" />
              <text x={(firstFloorReport.staircase.w * scale) / 2 + 8} y={(firstFloorReport.staircase.h * scale) / 2} fontSize="9" fontWeight="bold" fill="#0284c7">UP TO 2ND FLOOR</text>
              <rect x="2" y="2" width="80" height="14" fill="#ffffff" opacity="0.9" />
              <text x="5" y="12" fontSize="8" fontWeight="bold" fill="#0f172a">{firstFloorReport.staircase.id} (CONTINUED)</text>
            </g>
          )}

          {/* Lift Core (L1) Vertically Aligned */}
          {firstFloorReport?.lift && (
            <g transform={`translate(${toPxX(firstFloorReport.lift.x)}, ${toPxY(firstFloorReport.lift.y + firstFloorReport.lift.h)})`}>
              <rect width={firstFloorReport.lift.w * scale} height={firstFloorReport.lift.h * scale} fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
              <rect x="4" y="4" width={firstFloorReport.lift.w * scale - 8} height={firstFloorReport.lift.h * scale - 8} fill="url(#hatch-lift)" stroke="#0284c7" strokeWidth="1.2" />
              <text x={(firstFloorReport.lift.w * scale) / 2} y={(firstFloorReport.lift.h * scale) / 2} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f172a">
                L1 LIFT ({firstFloorReport.lift.capacity})
              </text>
            </g>
          )}

          {/* FFL Floor Level Tag on Central Foyer Landing */}
          <g transform={`translate(${toPxX(firstFloorReport?.staircase.x || 4) + 10}, ${toPxY(firstFloorReport?.staircase.y || 4) - 20})`}>
            <circle cx="0" cy="0" r="8" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="-8" y1="0" x2="8" y2="0" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="0" y1="-8" x2="0" y2="8" stroke="#0f172a" strokeWidth="1.5" />
            <text x="12" y="4" fontSize="9" fontWeight="bold" fill="#0f172a">FFL +10′-0″ (FIRST FLOOR LEVEL)</text>
          </g>

          {/* ========================================================================= */}
          {/* LAYER 5 (TOP): TEXT ANNOTATIONS & CRISP RED DIMENSIONS */}
          {/* ========================================================================= */}
          {/* External Crisp Red Dimension Strings (-60px Outer Margin Offset) */}
          <g>
            {/* Top Footprint Width Dimension Chain */}
            <line
              x1={toPxX(inputs.setbacks.left)}
              y1={toPxY(plotL) - 25}
              x2={toPxX(plotW - inputs.setbacks.right)}
              y2={toPxY(plotL) - 25}
              stroke="#dc2626"
              strokeWidth="1.2"
              markerStart="url(#arrow-red-start)"
              markerEnd="url(#arrow-red-end)"
            />
            <text
              x={toPxX(plotW / 2)}
              y={toPxY(plotL) - 30}
              textAnchor="middle"
              fontSize="9"
              fontWeight="bold"
              fill="#dc2626"
            >
              BUILDABLE WIDTH: {(plotW - inputs.setbacks.left - inputs.setbacks.right).toFixed(0)}′-0″
            </text>

            {/* Left Footprint Depth Dimension Chain */}
            <line
              x1={toPxX(0) - 25}
              y1={toPxY(inputs.setbacks.front)}
              x2={toPxX(0) - 25}
              y2={toPxY(plotL - inputs.setbacks.rear)}
              stroke="#dc2626"
              strokeWidth="1.2"
              markerStart="url(#arrow-red-start)"
              markerEnd="url(#arrow-red-end)"
            />
            <text
              x={toPxX(0) - 32}
              y={toPxY(plotL / 2)}
              textAnchor="middle"
              fontSize="9"
              fontWeight="bold"
              fill="#dc2626"
              transform={`rotate(-90 ${toPxX(0) - 32} ${toPxY(plotL / 2)})`}
            >
              BUILDABLE DEPTH: {(plotL - inputs.setbacks.front - inputs.setbacks.rear).toFixed(0)}′-0″
            </text>
          </g>

          {/* Clean 2-Line Centered Room Labels (NO SQUARE FOOTAGE BOXES / NO BLUE CARDS) */}
          {firstFloorReport?.rooms.map((r) => {
            const rx = toPxX(r.x);
            const ry = toPxY(r.y + r.h);
            const rw = r.w * scale;
            const rh = r.h * scale;

            // Collision Prevention: Offset text Y-axis if colliding with bed or table
            const textCenterY = (r.isMaster || r.name === "BEDROOM 2" || r.isLiving || r.isDining) ? ry + rh - 16 : ry + rh / 2;

            return (
              <g key={`ff_room_label_${r.id}`}>
                {/* Line 1: ROOM NAME (12px, Bold, #0f172a) */}
                <text
                  x={rx + rw / 2}
                  y={textCenterY - 4}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill={r.isMaster ? "#0284c7" : "#0f172a"}
                  letterSpacing="0.5"
                >
                  {r.name}
                </text>
                {/* Line 2: DIMENSIONS (10px, Regular, #475569) */}
                <text
                  x={rx + rw / 2}
                  y={textCenterY + 8}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#475569"
                >
                  {r.dimText}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* STRUCTURAL PLANNING VIEW (GRID PLAN + FOOTING LAYOUT + SPECIMEN CROSS-SECTION + SCHEDULES) */}
      {isStructuralTab && (
        <g>
          {/* ========================================================================= */}
          {/* A. PLAN VIEW: GRID LAYOUT & FOOTING PLAN */}
          {/* ========================================================================= */}
          {(structuralSubview === "column_grid" || structuralSubview === "footing_plan" || structuralSubview === "all_combined" || !structuralSubview) && (
            <g>
              {/* 1. PLAN VIEW BOUNDARIES & SETBACKS */}
              {/* Plot Boundary (Dashed Slate Line) */}
              <rect
                x={toPxX(0)}
                y={toPxY(plotL)}
                width={plotW * scale}
                height={plotL * scale}
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="8 4"
              />
              <text x={toPxX(plotW / 2)} y={toPxY(plotL) - 8} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#64748b">
                PLOT BOUNDARY ({plotW} FT × {plotL} FT)
              </text>

              {/* Red Dotted Setback Boundary */}
              <rect
                x={toPxX(inputs.setbacks.left)}
                y={toPxY(plotL - inputs.setbacks.rear)}
                width={(plotW - inputs.setbacks.left - inputs.setbacks.right) * scale}
                height={(plotL - inputs.setbacks.front - inputs.setbacks.rear) * scale}
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />

              {/* Buildable Structural Envelope Outline */}
              <rect
                x={toPxX(buildable.x)}
                y={toPxY(buildable.y + buildable.h)}
                width={buildable.w * scale}
                height={buildable.h * scale}
                fill="rgba(2, 132, 199, 0.03)"
                stroke="#0284c7"
                strokeWidth="2"
              />

              {/* 2. PARAMETRIC GRID LINES & BUBBLES */}
              {/* Vertical Grid Lines (X-Axis: A, B, C, D...) */}
              {gridXCoords.map((gx, idx) => {
                const gridLabel = String.fromCharCode(65 + idx);
                const pxX = toPxX(gx);
                const topY = toPxY(plotL + 3);
                const botY = toPxY(-3);

                return (
                  <g key={`grid_x_${idx}`}>
                    <line x1={pxX} y1={topY + 14} x2={pxX} y2={botY - 14} stroke="#0284c7" strokeWidth="1.2" strokeDasharray="8 4" />
                    {/* Top Bubble */}
                    <circle cx={pxX} cy={topY} r="12" fill="#0f172a" stroke="#0284c7" strokeWidth="1.8" />
                    <text x={pxX} y={topY + 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">{gridLabel}</text>
                    {/* Bottom Bubble */}
                    <circle cx={pxX} cy={botY} r="12" fill="#0f172a" stroke="#0284c7" strokeWidth="1.8" />
                    <text x={pxX} y={botY + 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">{gridLabel}</text>
                  </g>
                );
              })}

              {/* Horizontal Grid Lines (Y-Axis: 1, 2, 3, 4...) */}
              {gridYCoords.map((gy, idx) => {
                const gridLabel = `${idx + 1}`;
                const pxY = toPxY(gy);
                const leftX = toPxX(-3);
                const rightX = toPxX(plotW + 3);

                return (
                  <g key={`grid_y_${idx}`}>
                    <line x1={leftX + 14} y1={pxY} x2={rightX - 14} y2={pxY} stroke="#0284c7" strokeWidth="1.2" strokeDasharray="8 4" />
                    {/* Left Bubble */}
                    <circle cx={leftX} cy={pxY} r="12" fill="#0f172a" stroke="#0284c7" strokeWidth="1.8" />
                    <text x={leftX} y={pxY + 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">{gridLabel}</text>
                    {/* Right Bubble */}
                    <circle cx={rightX} cy={pxY} r="12" fill="#0f172a" stroke="#0284c7" strokeWidth="1.8" />
                    <text x={rightX} y={pxY + 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">{gridLabel}</text>
                  </g>
                );
              })}

              {/* 3. CENTER-TO-CENTER & CUMULATIVE DIMENSION CHAINS */}
              {/* Individual Top X Spans */}
              {gridXCoords.slice(0, -1).map((gx, idx) => {
                const nextGx = gridXCoords[idx + 1];
                const spanFt = (nextGx - gx).toFixed(1);
                const pxX1 = toPxX(gx);
                const pxX2 = toPxX(nextGx);
                const dimY = toPxY(plotL + 1.8);

                return (
                  <g key={`span_x_${idx}`}>
                    <line x1={pxX1} y1={dimY} x2={pxX2} y2={dimY} stroke="#0284c7" strokeWidth="1" />
                    <line x1={pxX1} y1={dimY - 4} x2={pxX1} y2={dimY + 4} stroke="#0284c7" strokeWidth="1" />
                    <line x1={pxX2} y1={dimY - 4} x2={pxX2} y2={dimY + 4} stroke="#0284c7" strokeWidth="1" />
                    <rect x={(pxX1 + pxX2) / 2 - 40} y={dimY - 14} width="80" height="14" fill="#ffffff" rx="2" stroke="#cbd5e1" strokeWidth="0.5" />
                    <text x={(pxX1 + pxX2) / 2} y={dimY - 4} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0284c7">
                      Grid {String.fromCharCode(65 + idx)}-{String.fromCharCode(66 + idx)}: {spanFt}′ c/c
                    </text>
                  </g>
                );
              })}

              {/* Cumulative Top X Overall Length */}
              <g>
                <line x1={toPxX(0)} y1={toPxY(plotL + 4.5)} x2={toPxX(plotW)} y2={toPxY(plotL + 4.5)} stroke="#0f172a" strokeWidth="1.2" />
                <line x1={toPxX(0)} y1={toPxY(plotL + 4.1)} x2={toPxX(0)} y2={toPxY(plotL + 4.9)} stroke="#0f172a" strokeWidth="1.2" />
                <line x1={toPxX(plotW)} y1={toPxY(plotL + 4.1)} x2={toPxX(plotW)} y2={toPxY(plotL + 4.9)} stroke="#0f172a" strokeWidth="1.2" />
                <rect x={toPxX(plotW / 2) - 130} y={toPxY(plotL + 5.2)} width="260" height="16" fill="#0f172a" rx="3" />
                <text x={toPxX(plotW / 2)} y={toPxY(plotL + 5.2) + 11} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ffffff">
                  OVERALL LENGTH: {plotW}′-0″ ({ (plotW * 0.3048).toFixed(2) } m) | BUILDABLE: {buildable.w}′-0″
                </text>
              </g>

              {/* Individual Right Y Spans */}
              {gridYCoords.slice(0, -1).map((gy, idx) => {
                const nextGy = gridYCoords[idx + 1];
                const spanFt = (nextGy - gy).toFixed(1);
                const pxY1 = toPxY(gy);
                const pxY2 = toPxY(nextGy);
                const dimX = toPxX(plotW + 1.8);

                return (
                  <g key={`span_y_${idx}`}>
                    <line x1={dimX} y1={pxY1} x2={dimX} y2={pxY2} stroke="#0284c7" strokeWidth="1" />
                    <line x1={dimX - 4} y1={pxY1} x2={dimX + 4} y2={pxY1} stroke="#0284c7" strokeWidth="1" />
                    <line x1={dimX - 4} y1={pxY2} x2={dimX + 4} y2={pxY2} stroke="#0284c7" strokeWidth="1" />
                    <rect x={dimX + 6} y={(pxY1 + pxY2) / 2 - 6} width="85" height="12" fill="#ffffff" rx="2" stroke="#cbd5e1" strokeWidth="0.5" />
                    <text x={dimX + 48} y={(pxY1 + pxY2) / 2 + 3} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0284c7">
                      Grid {idx + 1}-{idx + 2}: {spanFt}′ c/c
                    </text>
                  </g>
                );
              })}

              {/* Cumulative Right Y Overall Width */}
              <g>
                <line x1={toPxX(plotW + 5.5)} y1={toPxY(0)} x2={toPxX(plotW + 5.5)} y2={toPxY(plotL)} stroke="#0f172a" strokeWidth="1.2" />
                <line x1={toPxX(plotW + 5.1)} y1={toPxY(0)} x2={toPxX(plotW + 5.9)} y2={toPxY(0)} stroke="#0f172a" strokeWidth="1.2" />
                <line x1={toPxX(plotW + 5.1)} y1={toPxY(plotL)} x2={toPxX(plotW + 5.9)} y2={toPxY(plotL)} stroke="#0f172a" strokeWidth="1.2" />
                <text
                  x={toPxX(plotW + 6.6)}
                  y={toPxY(plotL / 2)}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill="#0f172a"
                  transform={`rotate(90 ${toPxX(plotW + 6.6)} ${toPxY(plotL / 2)})`}
                >
                  OVERALL WIDTH: {plotL}′-0″ ({ (plotL * 0.3048).toFixed(2) } m) | BUILDABLE: {buildable.h}′-0″
                </text>
              </g>

              {/* 4. FOOTINGS & COLUMNS RENDERED AT GRID INTERSECTIONS */}
              {gridXCoords.map((gx, ix) =>
                gridYCoords.map((gy, iy) => {
                  const memberNumber = ix * gridYCoords.length + iy + 1;
                  const colMark = `C${memberNumber}`;
                  const ftMark = `F${memberNumber}`;

                  const cx = toPxX(gx);
                  const cy = toPxY(gy);

                  // Footing size in feet and px
                  const ftWidthFt = ftDimM * 3.28084;
                  const ftW_px = ftWidthFt * scale;
                  const ftH_px = ftWidthFt * scale;

                  // PCC offset = 100mm = 0.328ft = ~5.25px
                  const pccOffset_px = 0.328 * scale;

                  // Column size in px
                  const colW_px = 0.75 * scale; // 9" = 12px
                  const colH_px = 1.25 * scale; // 15" = 20px

                  return (
                    <g key={`struct_member_${memberNumber}`}>
                      {/* PCC Bed Outline */}
                      <rect
                        x={cx - ftW_px / 2 - pccOffset_px}
                        y={cy - ftH_px / 2 - pccOffset_px}
                        width={ftW_px + pccOffset_px * 2}
                        height={ftH_px + pccOffset_px * 2}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1"
                        strokeDasharray="4 3"
                      />

                      {/* Footing Outline */}
                      <rect
                        x={cx - ftW_px / 2}
                        y={cy - ftH_px / 2}
                        width={ftW_px}
                        height={ftH_px}
                        fill="url(#hatch-footing)"
                        stroke="#0284c7"
                        strokeWidth="1.5"
                      />

                      {/* Footing Callout Label */}
                      <text x={cx - ftW_px / 2 + 4} y={cy - ftH_px / 2 + 10} fontSize="7" fontWeight="bold" fill="#0284c7">
                        {ftMark} ({ftDimM.toFixed(2)}m)
                      </text>

                      {/* Column Rectangle (Solid Filled) */}
                      <rect
                        x={cx - colW_px / 2}
                        y={cy - colH_px / 2}
                        width={colW_px}
                        height={colH_px}
                        fill="#0f172a"
                        stroke="#ffffff"
                        strokeWidth="1.2"
                      />

                      {/* Column Center Crosshairs */}
                      <line x1={cx - colW_px / 2 - 3} y1={cy} x2={cx + colW_px / 2 + 3} y2={cy} stroke="#ffffff" strokeWidth="0.8" />
                      <line x1={cx} y1={cy - colH_px / 2 - 3} x2={cx} y2={cy + colH_px / 2 + 3} stroke="#ffffff" strokeWidth="0.8" />

                      {/* Column Mark Text */}
                      <rect x={cx + colW_px / 2 + 2} y={cy - 6} width="16" height="12" fill="#ffffff" opacity="0.9" rx="2" />
                      <text x={cx + colW_px / 2 + 10} y={cy + 3} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#dc2626">
                        {colMark}
                      </text>
                    </g>
                  );
                })
              )}

              {/* 5. STRUCTURAL LEGEND & TITLE BLOCK FOR PLAN VIEW */}
              <g transform={`translate(${Math.max(820, totalSvgW - 460)}, ${Math.max(680, mainGridH)})`}>
                <rect width="440" height="190" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" rx="4" />
                <text x="12" y="18" fontSize="10" fontWeight="bold" fill="#0f172a">STRUCTURAL CAD SYMBOL LEGEND &amp; CALLOUTS</text>
                <line x1="0" y1="24" x2="440" y2="24" stroke="#0f172a" strokeWidth="1" />

                <g transform="translate(12, 34)">
                  <rect width="18" height="12" fill="url(#hatch-footing)" stroke="#0284c7" strokeWidth="1" />
                  <text x="24" y="10" fontSize="8" fill="#334155">F1..Fn — Isolated RCC Footing</text>
                </g>
                <g transform="translate(220, 34)">
                  <rect width="18" height="12" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
                  <text x="24" y="10" fontSize="8" fill="#334155">PCC — Plain Cement Bed (100mm)</text>
                </g>
                <g transform="translate(12, 58)">
                  <rect width="12" height="12" fill="#0f172a" />
                  <text x="24" y="10" fontSize="8" fill="#334155">C1..Cn — RCC Structural Column</text>
                </g>
                <g transform="translate(220, 58)">
                  <circle cx="9" cy="6" r="6" fill="#0f172a" stroke="#0284c7" strokeWidth="1" />
                  <text x="24" y="10" fontSize="8" fill="#334155">A, B, 1, 2 — Grid Line Bubble</text>
                </g>
                <g transform="translate(12, 82)">
                  <line x1="0" y1="6" x2="18" y2="6" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="6 3" />
                  <text x="24" y="10" fontSize="8" fill="#334155">Center-to-Center Grid Axis</text>
                </g>
                <g transform="translate(220, 82)">
                  <line x1="0" y1="6" x2="18" y2="6" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
                  <text x="24" y="10" fontSize="8" fill="#334155">Setback Boundary Line</text>
                </g>
                <g transform="translate(12, 106)">
                  <line x1="0" y1="6" x2="18" y2="6" stroke="#dc2626" strokeWidth="2.5" />
                  <text x="24" y="10" fontSize="8" fill="#334155">Main Reinforcement (#12mm / #16mm)</text>
                </g>
                <g transform="translate(220, 106)">
                  <line x1="0" y1="6" x2="18" y2="6" stroke="#16a34a" strokeWidth="1.5" />
                  <text x="24" y="10" fontSize="8" fill="#334155">Lateral Ties / Stirrups (#8mm)</text>
                </g>
                <g transform="translate(12, 130)">
                  <rect width="416" height="48" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" rx="3" />
                  <text x="8" y="14" fontSize="8" fontWeight="bold" fill="#0f172a">STRUCTURAL ENGINEERING COMPLIANCE NOTES:</text>
                  <text x="8" y="26" fontSize="7.5" fill="#475569">1. Concrete Grade: {structuralPlanningReport?.materials.concreteGrade || "M25"} | Steel Grade: {structuralPlanningReport?.materials.reinforcementSteelGrade || "Fe500D TMT"}</text>
                  <text x="8" y="36" fontSize="7.5" fill="#475569">2. Clear Cover: Footings = 50mm, Columns = 40mm, Beams = 25mm, Slabs = 15mm.</text>
                  <text x="8" y="44" fontSize="7.5" fill="#475569">3. Code Compliance: IS 456:2000, IS 1893:2016 (Seismic), IS 13920:2016 (Ductility).</text>
                </g>
              </g>
            </g>
          )}

          {/* ========================================================================= */}
          {/* B. SPECIMEN FOOTING & COLUMN CROSS-SECTION SIDE DETAIL VIEW */}
          {/* ========================================================================= */}
          {(structuralSubview === "specimen_detail" || structuralSubview === "all_combined") && (
            <g transform={`translate(20, ${structuralSubview === "all_combined" ? mainGridH + 20 : 10})`}>
              {/* Section Container Frame */}
              <rect
                width={Math.max(1050, totalSvgW - 40)}
                height="460"
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="1.5"
                rx="6"
              />

              {/* Section Header Title */}
              <path d="M 0 0 L 1050 0 L 1050 32 L 0 32 Z" fill="#0f172a" />
              <text x="20" y="21" fontSize="12" fontWeight="bold" fill="#ffffff" letterSpacing="0.5">
                SPECIMEN CROSS-SECTION DETAIL — COMBINED TYPICAL FOOTING (F1) &amp; COLUMN (C1) SECTION
              </text>
              <text x="950" y="21" fontSize="9" fontWeight="bold" fill="#38bdf8" textAnchor="end">
                SCALE 1:20 | DETAILED PER IS 456:2000 &amp; IS 13920:2016
              </text>

              {/* Side Section Diagram Canvas Area */}
              {/* Ground Level NGL Line (Y = 120) */}
              <line x1="80" y1="120" x2="850" y2="120" stroke="#0f172a" strokeWidth="2.5" />

              {/* Soil Hatching Left & Right */}
              <rect x="80" y="120" width="160" height="240" fill="url(#hatch-pcc)" opacity="0.6" />
              <rect x="690" y="120" width="160" height="240" fill="url(#hatch-pcc)" opacity="0.6" />

              {/* Ground Level NGL Symbol */}
              <polygon points="140,120 130,105 150,105" fill="#0284c7" />
              <text x="155" y="112" fontSize="9" fontWeight="bold" fill="#0284c7">NGL (Natural Ground Level ±0.00m)</text>

              {/* Excavation Cut Lines */}
              <line x1="240" y1="120" x2="240" y2="360" stroke="#475569" strokeWidth="1.5" strokeDasharray="4 2" />
              <line x1="690" y1="120" x2="690" y2="360" stroke="#475569" strokeWidth="1.5" strokeDasharray="4 2" />

              {/* PCC Bed (100mm = 20px, Width = 470px, X: 230 to 700, Y: 340 to 360) */}
              <rect x="230" y="340" width="470" height="20" fill="url(#hatch-pcc)" stroke="#475569" strokeWidth="1.5" />
              <text x="465" y="354" fontSize="9" fontWeight="bold" fill="#1e293b" textAnchor="middle">
                PCC BED 1:3:6 (100mm THK, M10 GRADE)
              </text>

              {/* Footing Concrete Outline (Trapezoidal F1: Base X 250 to 680, Base Y=340, Edge depth=40px -> Y=300, Top pedestal X=410 to 520, Top Y=250) */}
              <polygon points="250,340 680,340 680,300 520,250 410,250 250,300" fill="url(#hatch-footing)" stroke="#0f172a" strokeWidth="2" />

              {/* Column Concrete Shaft (X: 425 to 505, Y: 60 to 250) */}
              <rect x="425" y="60" width="80" height="190" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />

              {/* Footing Bottom Main Rebar Mesh (Clear Cover = 50mm -> Y = 328) */}
              <path d="M 265,275 L 265,328 L 665,328 L 665,275" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinejoin="round" />
              {/* Distribution Bars (Dots) */}
              {Array.from({ length: 11 }).map((_, dotIdx) => (
                <circle key={`ft_dot_${dotIdx}`} cx={285 + dotIdx * 37} cy="320" r="3.5" fill="#f59e0b" />
              ))}

              {/* Column Starter Bars into Footing (Clear cover 40mm -> X: 438, 492) */}
              <path d="M 438,60 L 438,322 L 358,322" fill="none" stroke="#0284c7" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
              <path d="M 492,60 L 492,322 L 572,322" fill="none" stroke="#0284c7" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

              {/* Column Lateral Ties / Stirrups */}
              {[80, 110, 140, 170, 200, 230, 270, 300].map((tieY, tieIdx) => (
                <rect key={`tie_${tieIdx}`} x="434" y={tieY} width="68" height="4" fill="none" stroke="#16a34a" strokeWidth="1.5" />
              ))}

              {/* ANNOTATIONS & CALLOUT LEADER ARROWS */}
              {/* Callout 1: Footing Mesh */}
              <line x1="310" y1="328" x2="220" y2="390" stroke="#dc2626" strokeWidth="1" />
              <circle cx="310" cy="328" r="2.5" fill="#dc2626" />
              <rect x="50" y="380" width="220" height="35" fill="#ffffff" stroke="#dc2626" strokeWidth="1" rx="3" />
              <text x="60" y="394" fontSize="9" fontWeight="bold" fill="#dc2626">FOOTING REBAR MESH (F1)</text>
              <text x="60" y="407" fontSize="8" fill="#1e293b">#12mm @ 150mm c/c Both Ways</text>

              {/* Callout 2: Column Reinforcement */}
              <line x1="438" y1="130" x2="310" y2="80" stroke="#0284c7" strokeWidth="1" />
              <circle cx="438" cy="130" r="2.5" fill="#0284c7" />
              <rect x="170" y="65" width="210" height="45" fill="#ffffff" stroke="#0284c7" strokeWidth="1" rx="3" />
              <text x="180" y="80" fontSize="9" fontWeight="bold" fill="#0284c7">COLUMN C1 REINFORCEMENT</text>
              <text x="180" y="92" fontSize="8" fill="#1e293b">Main: 6-#16mm + 2-#12mm Fe500D</text>
              <text x="180" y="103" fontSize="8" fill="#16a34a">Ties: #8mm @ 100/150mm c/c</text>

              {/* Callout 3: Foot Anchorage Bend Ld */}
              <line x1="375" y1="322" x2="310" y2="230" stroke="#0f172a" strokeWidth="1" />
              <circle cx="375" cy="322" r="2.5" fill="#0f172a" />
              <rect x="180" y="215" width="210" height="35" fill="#ffffff" stroke="#0f172a" strokeWidth="1" rx="3" />
              <text x="190" y="230" fontSize="9" fontWeight="bold" fill="#0f172a">FOOT ANCHORAGE BEND (Ld)</text>
              <text x="190" y="242" fontSize="8" fill="#475569">Min 300mm (90° Hook in Footing)</text>

              {/* Callout 4: Clear Concrete Cover */}
              <line x1="680" y1="320" x2="720" y2="280" stroke="#16a34a" strokeWidth="1" />
              <circle cx="680" cy="320" r="2.5" fill="#16a34a" />
              <rect x="710" y="260" width="210" height="35" fill="#ffffff" stroke="#16a34a" strokeWidth="1" rx="3" />
              <text x="720" y="275" fontSize="9" fontWeight="bold" fill="#16a34a">CLEAR COVER SPECIFICATION</text>
              <text x="720" y="288" fontSize="8" fill="#1e293b">Footing: 50mm | Column: 40mm</text>

              {/* Section Dimensions */}
              {/* Depth Df = 1.50m */}
              <line x1="720" y1="120" x2="720" y2="360" stroke="#0284c7" strokeWidth="1" />
              <line x1="715" y1="120" x2="725" y2="120" stroke="#0284c7" strokeWidth="1" />
              <line x1="715" y1="360" x2="725" y2="360" stroke="#0284c7" strokeWidth="1" />
              <text x="732" y="240" fontSize="9" fontWeight="bold" fill="#0284c7">Df = 1.50 m (5′-0″)</text>

              {/* Footing Base B = 2.20m */}
              <line x1="250" y1="375" x2="680" y2="375" stroke="#0f172a" strokeWidth="1" />
              <line x1="250" y1="370" x2="250" y2="380" stroke="#0f172a" strokeWidth="1" />
              <line x1="680" y1="370" x2="680" y2="380" stroke="#0f172a" strokeWidth="1" />
              <text x="465" y="390" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                FOOTING BASE WIDTH (B) = {ftDimM.toFixed(2)} m ({(ftDimM * 3.28084).toFixed(1)} FT)
              </text>
            </g>
          )}
        </g>
      )}

    </svg>
  );
};
