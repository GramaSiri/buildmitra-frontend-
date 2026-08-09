import React from "react";
import { FloorPlanModel, SolvedFloor } from "./types";

type RendererProps = {
  model: FloorPlanModel;
  activeLevel: number;
  compact?: boolean;
};

/**
 * PROFESSIONAL RENDERER RULE (RULE 9 ENFORCEMENT)
 * This component DOES NOT generate rooms or call generateVastuFloorPlan.
 * It ONLY receives an already solved FloorPlanModel and renders it cleanly.
 */
export const ProfessionalFloorPlanRenderer: React.FC<RendererProps> = ({
  model,
  activeLevel,
  compact = false,
}) => {
  const plotW = model.plot.width;
  const plotL = model.plot.length;
  const facing = model.plot.facing;

  const scale = compact ? 12 : 16;
  const padX = compact ? 60 : 120;
  const padY = compact ? 60 : 120;

  const mainW = padX * 2 + plotW * scale;
  const mainH = padY * 2 + plotL * scale;

  const toPxX = (x: number) => padX + x * scale;
  const toPxY = (y: number) => padY + (plotL - y) * scale;

  const currentFloor: SolvedFloor =
    model.floors.find((f) => f.level === activeLevel) || model.floors[0];

  return (
    <svg
      viewBox={`0 0 ${mainW} ${mainH}`}
      width="100%"
      style={{
        background: "#ffffff",
        borderRadius: "8px",
        boxShadow: compact ? "none" : "0 4px 24px rgba(0,0,0,0.08)",
      }}
    >
      <defs>
        <pattern id="hatch-wall-prof" width="8" height="8" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="8" y2="8" stroke="#1e293b" strokeWidth="1" />
        </pattern>
        <pattern id="hatch-stair-prof" width="6" height="6" patternUnits="userSpaceOnUse">
          <line x1="0" y1="6" x2="6" y2="0" stroke="#94a3b8" strokeWidth="0.8" />
        </pattern>
      </defs>

      {/* PLOT BOUNDARY (OUTER DASHED LINE) */}
      <rect
        x={toPxX(0)}
        y={toPxY(plotL)}
        width={plotW * scale}
        height={plotL * scale}
        fill="none"
        stroke="#64748b"
        strokeWidth="1.5"
        strokeDasharray="6 4"
      />

      {/* SETBACK BOUNDARY (RED DOTTED LINE) */}
      <rect
        x={toPxX(model.setbacks.left)}
        y={toPxY(plotL - model.setbacks.rear)}
        width={model.buildable.w * scale}
        height={model.buildable.h * scale}
        fill="none"
        stroke="#ef4444"
        strokeWidth="2"
        strokeDasharray="4 3"
      />

      {/* ROAD BOUNDARY & FACING CALLOUT */}
      <g transform={`translate(${toPxX(0)}, ${toPxY(0) + 15})`}>
        <rect width={plotW * scale} height="30" fill="#f1f5f9" stroke="#cbd5e1" />
        <text x={(plotW * scale) / 2} y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">
          ROAD 30′-0″ WIDE — ({facing.toUpperCase()} FACING)
        </text>
      </g>

      {/* SOLVED ROOM POLYGONS */}
      {currentFloor.rooms.map((r) => {
        const rx = toPxX(r.x);
        const ry = toPxY(r.y + r.h);
        const rw = r.w * scale;
        const rh = r.h * scale;

        return (
          <g key={r.id}>
            <rect x={rx} y={ry} width={rw} height={rh} fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <text x={rx + rw / 2} y={ry + rh / 2 - 8} textAnchor="middle" fontSize={compact ? "8" : "10"} fontWeight="bold" fill="#0f172a">
              {r.name}
            </text>
            <text x={rx + rw / 2} y={ry + rh / 2 + 5} textAnchor="middle" fontSize={compact ? "7" : "8"} fill="#334155">
              {r.w.toFixed(0)}′-0″ × {r.h.toFixed(0)}′-0″
            </text>
            <text x={rx + rw / 2} y={ry + rh / 2 + 16} textAnchor="middle" fontSize={compact ? "7" : "8"} fontWeight="bold" fill="#0284c7">
              {r.areaSqFt} SQ.FT
            </text>
          </g>
        );
      })}

      {/* CAD DOUBLE-LINE WALLS (9" OUTER, 4.5" INNER) */}
      {currentFloor.walls.map((w) => (
        <line
          key={w.id}
          x1={toPxX(w.x1)}
          y1={toPxY(w.y1)}
          x2={toPxX(w.x2)}
          y2={toPxY(w.y2)}
          stroke={w.isExternal ? "#1e293b" : "#475569"}
          strokeWidth={(w.thicknessInches / 12) * scale}
          strokeLinecap="square"
        />
      ))}

      {/* DOORS WITH 90° INWARD RADIAL ARCS */}
      {currentFloor.rooms.flatMap((r) =>
        r.doors.map((d) => {
          const dx = toPxX(d.x);
          const dy = toPxY(d.y);
          const dw = d.widthFt * scale;

          return (
            <g key={d.id} transform={`translate(${dx}, ${dy})`}>
              <rect x={-dw / 2} y="-8" width={dw} height="16" fill="#ffffff" />
              <line x1={-dw / 2} y1="0" x2={dw / 2} y2="0" stroke="#0284c7" strokeWidth="2" />
              <path d={`M ${-dw / 2} 0 A ${dw} ${dw} 0 0 1 ${dw / 2} ${dw * 0.7}`} fill="none" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="3 2" />
              <text x="0" y="-10" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#0284c7">
                {d.label}
              </text>
            </g>
          );
        })
      )}

      {/* WINDOWS & VENTILATORS */}
      {currentFloor.rooms.flatMap((r) =>
        r.windows.map((w) => {
          const wx = toPxX(w.x);
          const wy = toPxY(w.y);
          const ww = w.widthFt * scale;

          return (
            <g key={w.id} transform={`translate(${wx}, ${wy})`}>
              <rect x={-ww / 2} y="-6" width={ww} height="12" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
              <line x1={-ww / 2} y1="0" x2={ww / 2} y2="0" stroke="#0284c7" strokeWidth="2" />
              <text x="0" y="-8" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#0284c7">
                {w.label}
              </text>
            </g>
          );
        })
      )}

      {/* STAIRCASE CORE (ST1) WITH TREAD LINES & UP ARROW */}
      {currentFloor.staircase && (
        <g transform={`translate(${toPxX(currentFloor.staircase.x)}, ${toPxY(currentFloor.staircase.y + currentFloor.staircase.h)})`}>
          <rect width={currentFloor.staircase.w * scale} height={currentFloor.staircase.h * scale} fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`st_tr_${i}`} x1="0" y1={(currentFloor.staircase.h * scale / 8) * i} x2={currentFloor.staircase.w * scale} y2={(currentFloor.staircase.h * scale / 8) * i} stroke="#64748b" strokeWidth="1" />
          ))}
          <line x1={(currentFloor.staircase.w * scale) / 2} y1={currentFloor.staircase.h * scale - 6} x2={(currentFloor.staircase.w * scale) / 2} y2="10" stroke="#0284c7" strokeWidth="2" />
          <text x={(currentFloor.staircase.w * scale) / 2} y={(currentFloor.staircase.h * scale) / 2} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0284c7">
            ST1 STAIR (UP)
          </text>
        </g>
      )}

      {/* LIFT SHAFT (L1) */}
      {currentFloor.lift && (
        <g transform={`translate(${toPxX(currentFloor.lift.x)}, ${toPxY(currentFloor.lift.y + currentFloor.lift.h)})`}>
          <rect width={currentFloor.lift.w * scale} height={currentFloor.lift.h * scale} fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
          <rect x="4" y="4" width={currentFloor.lift.w * scale - 8} height={currentFloor.lift.h * scale - 8} fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 2" />
          <text x={(currentFloor.lift.w * scale) / 2} y={(currentFloor.lift.h * scale) / 2} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0f172a">
            L1 LIFT ({currentFloor.lift.capacity})
          </text>
        </g>
      )}

      {/* NORTH ARROW */}
      <g transform={`translate(${mainW - 60}, 60)`}>
        <circle cx="0" cy="0" r="18" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
        <path d="M 0 -14 L -6 8 L 0 4 L 6 8 Z" fill="#0f172a" />
        <text x="0" y="-20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">
          N
        </text>
      </g>
    </svg>
  );
};
