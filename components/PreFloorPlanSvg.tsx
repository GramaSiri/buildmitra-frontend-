import React from "react";
import type {
  Facing,
  FloorPlanRequirement,
  FloorPlanTemplate,
} from "../data/preFloorPlanLibrary";
import { generateVastuFloorPlan } from "../utils/drg/layoutEngine";

type Props = {
  template: FloorPlanTemplate;
  requirement: FloorPlanRequirement;
  floor: number;
  compact?: boolean;
};

const WALL = "#111827";
const THIN = "#475569";
const TEXT = "#111827";
const DIM = "#334155";

function HorizontalDimension({
  x1,
  x2,
  y,
  label,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
}) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={DIM} strokeWidth="1" />
      <line x1={x1} y1={y - 6} x2={x1} y2={y + 6} stroke={DIM} />
      <line x1={x2} y1={y - 6} x2={x2} y2={y + 6} stroke={DIM} />
      <path d={`M${x1},${y} l8,-4 v8 z`} fill={DIM} />
      <path d={`M${x2},${y} l-8,-4 v8 z`} fill={DIM} />
      <rect x={(x1 + x2) / 2 - 28} y={y - 10} width="56" height="15" fill="white" />
      <text x={(x1 + x2) / 2} y={y + 1} textAnchor="middle" fontSize="9" fontWeight="700">
        {label}
      </text>
    </g>
  );
}

function VerticalDimension({
  x,
  y1,
  y2,
  label,
}: {
  x: number;
  y1: number;
  y2: number;
  label: string;
}) {
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={DIM} />
      <line x1={x - 6} y1={y1} x2={x + 6} y2={y1} stroke={DIM} />
      <line x1={x - 6} y1={y2} x2={x + 6} y2={y2} stroke={DIM} />
      <path d={`M${x},${y1} l-4,8 h8 z`} fill={DIM} />
      <path d={`M${x},${y2} l-4,-8 h8 z`} fill={DIM} />
      <text
        x={x - 8}
        y={(y1 + y2) / 2}
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        transform={`rotate(-90 ${x - 8} ${(y1 + y2) / 2})`}
      >
        {label}
      </text>
    </g>
  );
}

function NorthArrow({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <text x="0" y="-26" textAnchor="middle" fontSize="15" fontWeight="900">
        N
      </text>
      <path d="M0,-20 L-9,14 L0,8 L9,14 Z" fill={WALL} />
      <circle cx="0" cy="0" r="19" fill="none" stroke={THIN} />
    </g>
  );
}

function GroundFloor({
  requirement,
}: {
  requirement: FloorPlanRequirement;
}) {
  const plotW = requirement.plotWidth || 40;
  const plotL = requirement.plotLength || 60;
  const facing = requirement.facing || "South";
  const plan = generateVastuFloorPlan(plotW, plotL, facing as any, 0, { front: 5, rear: 3, left: 3, right: 3 });

  const scaleX = 570 / plotW;
  const scaleY = 420 / plotL;

  return (
    <g transform="translate(140 105)">
      {/* External Plot Boundary */}
      <rect x="0" y="0" width="570" height="420" fill="#ffffff" stroke={WALL} strokeWidth="4" />

      {plan.rooms.map((r) => {
        const rx = r.x * scaleX;
        const ry = (plotL - r.y - r.h) * scaleY;
        const rw = r.w * scaleX;
        const rh = r.h * scaleY;

        return (
          <g key={r.id}>
            <rect x={rx} y={ry} width={rw} height={rh} fill="#ffffff" stroke={WALL} strokeWidth="2.5" />
            <g>
              <rect x={rx + rw / 2 - 55} y={ry + rh / 2 - 16} width="110" height="32" fill="#ffffff" opacity="0.95" rx="3" stroke="#cbd5e1" strokeWidth="0.8" />
              <text x={rx + rw / 2} y={ry + rh / 2 - 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill={TEXT}>{r.name}</text>
              <text x={rx + rw / 2} y={ry + rh / 2 + 5} textAnchor="middle" fontSize="8" fill={DIM}>{r.w.toFixed(0)}′-0″ × {r.h.toFixed(0)}′-0″</text>
              <text x={rx + rw / 2} y={ry + rh / 2 + 13} textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#0284c7">{Math.round(r.w * r.h)} SQ.FT</text>
            </g>
          </g>
        );
      })}

      <HorizontalDimension x1={0} x2={570} y={-35} label={`${requirement.plotWidth}'-0"`} />
      <VerticalDimension x={-35} y1={0} y2={420} label={`${requirement.plotLength}'-0"`} />
    </g>
  );
}

function UpperFloor({
  requirement,
  typical,
}: {
  requirement: FloorPlanRequirement;
  typical: boolean;
}) {
  const plotW = requirement.plotWidth || 40;
  const plotL = requirement.plotLength || 60;
  const facing = requirement.facing || "South";
  const plan = generateVastuFloorPlan(plotW, plotL, facing as any, typical ? 2 : 1, { front: 5, rear: 3, left: 3, right: 3 });

  const scaleX = 570 / plotW;
  const scaleY = 420 / plotL;

  return (
    <g transform="translate(140 105)">
      {/* External Plot Boundary */}
      <rect x="0" y="0" width="570" height="420" fill="#ffffff" stroke={WALL} strokeWidth="4" />

      {plan.rooms.map((r) => {
        const rx = r.x * scaleX;
        const ry = (plotL - r.y - r.h) * scaleY;
        const rw = r.w * scaleX;
        const rh = r.h * scaleY;

        return (
          <g key={r.id}>
            <rect x={rx} y={ry} width={rw} height={rh} fill="#ffffff" stroke={WALL} strokeWidth="2.5" />
            <g>
              <rect x={rx + rw / 2 - 55} y={ry + rh / 2 - 16} width="110" height="32" fill="#ffffff" opacity="0.95" rx="3" stroke="#cbd5e1" strokeWidth="0.8" />
              <text x={rx + rw / 2} y={ry + rh / 2 - 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill={TEXT}>{r.name}</text>
              <text x={rx + rw / 2} y={ry + rh / 2 + 5} textAnchor="middle" fontSize="8" fill={DIM}>{r.w.toFixed(0)}′-0″ × {r.h.toFixed(0)}′-0″</text>
              <text x={rx + rw / 2} y={ry + rh / 2 + 13} textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#0284c7">{Math.round(r.w * r.h)} SQ.FT</text>
            </g>
          </g>
        );
      })}

      <HorizontalDimension x1={0} x2={570} y={-35} label={`${requirement.plotWidth}'-0"`} />
      <VerticalDimension x={-35} y1={0} y2={420} label={`${requirement.plotLength}'-0"`} />
    </g>
  );
}

function roadPosition(facing: Facing) {
  if (facing === "North") {
    return { x: 140, y: 555, w: 570, h: 32, rotate: 0 };
  }

  if (facing === "South") {
    return { x: 140, y: 62, w: 570, h: 32, rotate: 0 };
  }

  if (facing === "West") {
    return { x: 82, y: 105, w: 32, h: 420, rotate: -90 };
  }

  return { x: 738, y: 105, w: 32, h: 420, rotate: -90 };
}

export default function PreFloorPlanSvg({
  template,
  requirement,
  floor,
  compact = false,
}: Props) {
  const road = roadPosition(requirement.facing);
  const isGroundFloor = floor === 0;
  const typicalFloor = floor >= 2;

  const floorTitle = isGroundFloor
    ? "GROUND FLOOR PLAN"
    : typicalFloor
    ? `TYPICAL FLOOR PLAN – FLOOR ${floor}`
    : "FIRST FLOOR PLAN";

  return (
    <svg
      viewBox="0 0 850 650"
      width="100%"
      style={{
        display: "block",
        background: "#ffffff",
        minWidth: compact ? 650 : 790,
      }}
      role="img"
      aria-label={`${requirement.plotWidth} by ${requirement.plotLength} ${requirement.facing} facing floor plan`}
    >
      <rect x="8" y="8" width="834" height="634" fill="white" stroke="#64748b" strokeWidth="1.5" />
      <rect x="17" y="17" width="816" height="616" fill="none" stroke="#cbd5e1" />

      <text x="425" y="37" textAnchor="middle" fontSize="18" fontWeight="900" fill={TEXT}>
        {floorTitle}
      </text>

      <text x="425" y="54" textAnchor="middle" fontSize="10" fontWeight="700" fill={DIM}>
        PLOT {requirement.plotWidth}'-0" × {requirement.plotLength}'-0" · {requirement.facing.toUpperCase()} FACING
      </text>

      <NorthArrow x={55} y={70} />

      {isGroundFloor ? (
        <GroundFloor requirement={requirement} />
      ) : (
        <UpperFloor requirement={requirement} typical={typicalFloor} />
      )}

      <rect
        x={road.x}
        y={road.y}
        width={road.w}
        height={road.h}
        fill="#e5e7eb"
        stroke={THIN}
      />

      <line
        x1={road.rotate ? road.x + road.w / 2 : road.x}
        y1={road.rotate ? road.y + 20 : road.y + road.h / 2}
        x2={road.rotate ? road.x + road.w / 2 : road.x + road.w}
        y2={road.rotate ? road.y + road.h - 20 : road.y + road.h / 2}
        stroke="#94a3b8"
        strokeDasharray="12 8"
      />

      <text
        x={road.x + road.w / 2}
        y={road.y + road.h / 2 + 4}
        textAnchor="middle"
        fontSize="10"
        fontWeight="900"
        transform={
          road.rotate
            ? `rotate(${road.rotate} ${road.x + road.w / 2} ${road.y + road.h / 2})`
            : undefined
        }
      >
        {requirement.facing.toUpperCase()} ROAD
      </text>

      <g transform="translate(655 600)">
        <rect x="0" y="0" width="155" height="25" fill="white" stroke={THIN} />
        <text x="8" y="10" fontSize="7" fontWeight="800">BUILDMITRA DRG ENGINE</text>
        <text x="8" y="20" fontSize="6.5">
          SCALE: NTS · PRELIMINARY PLAN
        </text>
      </g>

      <text x="35" y="615" fontSize="7.5" fill="#64748b">
        Architectural concept plan. Setbacks, structure, services and authority compliance require professional verification.
      </text>
    </svg>
  );
}
