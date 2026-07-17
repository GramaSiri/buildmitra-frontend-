import React from "react";
import type {
  Facing,
  FloorPlanRequirement,
  FloorPlanTemplate,
} from "../data/preFloorPlanLibrary";

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

function Door({
  x,
  y,
  side,
  size = 32,
}: {
  x: number;
  y: number;
  side: "north" | "south" | "east" | "west";
  size?: number;
}) {
  if (side === "north") {
    return (
      <g>
        <line x1={x} y1={y} x2={x + size} y2={y} stroke="white" strokeWidth="10" />
        <line x1={x} y1={y} x2={x} y2={y + size} stroke={WALL} strokeWidth="2" />
        <path
          d={`M ${x + size} ${y} A ${size} ${size} 0 0 1 ${x} ${y + size}`}
          fill="none"
          stroke={THIN}
          strokeWidth="1.5"
        />
      </g>
    );
  }

  if (side === "south") {
    return (
      <g>
        <line x1={x} y1={y} x2={x + size} y2={y} stroke="white" strokeWidth="10" />
        <line x1={x + size} y1={y} x2={x + size} y2={y - size} stroke={WALL} strokeWidth="2" />
        <path
          d={`M ${x} ${y} A ${size} ${size} 0 0 0 ${x + size} ${y - size}`}
          fill="none"
          stroke={THIN}
          strokeWidth="1.5"
        />
      </g>
    );
  }

  if (side === "west") {
    return (
      <g>
        <line x1={x} y1={y} x2={x} y2={y + size} stroke="white" strokeWidth="10" />
        <line x1={x} y1={y + size} x2={x + size} y2={y + size} stroke={WALL} strokeWidth="2" />
        <path
          d={`M ${x} ${y} A ${size} ${size} 0 0 1 ${x + size} ${y + size}`}
          fill="none"
          stroke={THIN}
          strokeWidth="1.5"
        />
      </g>
    );
  }

  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + size} stroke="white" strokeWidth="10" />
      <line x1={x} y1={y} x2={x - size} y2={y} stroke={WALL} strokeWidth="2" />
      <path
        d={`M ${x} ${y + size} A ${size} ${size} 0 0 0 ${x - size} ${y}`}
        fill="none"
        stroke={THIN}
        strokeWidth="1.5"
      />
    </g>
  );
}

function WindowSymbol({
  x,
  y,
  length = 38,
  vertical = false,
}: {
  x: number;
  y: number;
  length?: number;
  vertical?: boolean;
}) {
  if (vertical) {
    return (
      <g>
        <line x1={x} y1={y} x2={x} y2={y + length} stroke="white" strokeWidth="11" />
        <line x1={x - 3} y1={y} x2={x - 3} y2={y + length} stroke={WALL} strokeWidth="1.5" />
        <line x1={x + 3} y1={y} x2={x + 3} y2={y + length} stroke={WALL} strokeWidth="1.5" />
        <line x1={x - 6} y1={y} x2={x + 6} y2={y} stroke={WALL} />
        <line x1={x - 6} y1={y + length} x2={x + 6} y2={y + length} stroke={WALL} />
      </g>
    );
  }

  return (
    <g>
      <line x1={x} y1={y} x2={x + length} y2={y} stroke="white" strokeWidth="11" />
      <line x1={x} y1={y - 3} x2={x + length} y2={y - 3} stroke={WALL} strokeWidth="1.5" />
      <line x1={x} y1={y + 3} x2={x + length} y2={y + 3} stroke={WALL} strokeWidth="1.5" />
      <line x1={x} y1={y - 6} x2={x} y2={y + 6} stroke={WALL} />
      <line x1={x + length} y1={y - 6} x2={x + length} y2={y + 6} stroke={WALL} />
    </g>
  );
}

function Ventilator({
  x,
  y,
  vertical = false,
}: {
  x: number;
  y: number;
  vertical?: boolean;
}) {
  return (
    <g>
      <WindowSymbol x={x} y={y} length={22} vertical={vertical} />
      <text
        x={vertical ? x + 10 : x + 11}
        y={vertical ? y + 14 : y - 8}
        fontSize="8"
        fontWeight="800"
        textAnchor="middle"
      >
        V
      </text>
    </g>
  );
}

function RoomLabel({
  x,
  y,
  title,
  size,
}: {
  x: number;
  y: number;
  title: string;
  size: string;
}) {
  return (
    <g>
      <text x={x} y={y} textAnchor="middle" fontSize="12" fontWeight="800" fill={TEXT}>
        {title}
      </text>
      <text x={x} y={y + 15} textAnchor="middle" fontSize="9" fill={DIM}>
        {size}
      </text>
    </g>
  );
}

function Bed({
  x,
  y,
  w = 92,
  h = 116,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill="#fffdf4" stroke={THIN} strokeWidth="1.5" />
      <rect x={x + 6} y={y + 7} width={w / 2 - 9} height={25} rx="4" fill="white" stroke={THIN} />
      <rect x={x + w / 2 + 3} y={y + 7} width={w / 2 - 9} height={25} rx="4" fill="white" stroke={THIN} />
      <path d={`M${x + 5},${y + 40} Q${x + w / 2},${y + 55} ${x + w - 5},${y + 40}`} fill="none" stroke="#94a3b8" />
      <line x1={x + 5} y1={y + 42} x2={x + 5} y2={y + h - 6} stroke="#94a3b8" />
      <line x1={x + w - 5} y1={y + 42} x2={x + w - 5} y2={y + h - 6} stroke="#94a3b8" />
    </g>
  );
}

function Wardrobe({
  x,
  y,
  w = 78,
  h = 18,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#f8fafc" stroke={THIN} />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={THIN} />
      <circle cx={x + w / 2 - 4} cy={y + h / 2} r="1.5" fill={THIN} />
      <circle cx={x + w / 2 + 4} cy={y + h / 2} r="1.5" fill={THIN} />
    </g>
  );
}

function SofaSet({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="98" height="30" rx="5" fill="#f8fafc" stroke={THIN} />
      <line x1={x + 32} y1={y + 3} x2={x + 32} y2={y + 27} stroke="#94a3b8" />
      <line x1={x + 66} y1={y + 3} x2={x + 66} y2={y + 27} stroke="#94a3b8" />

      <rect x={x - 30} y={y + 42} width="30" height="70" rx="5" fill="#f8fafc" stroke={THIN} />
      <line x1={x - 27} y1={y + 77} x2={x - 3} y2={y + 77} stroke="#94a3b8" />

      <rect x={x + 98} y={y + 42} width="30" height="70" rx="5" fill="#f8fafc" stroke={THIN} />
      <line x1={x + 101} y1={y + 77} x2={x + 125} y2={y + 77} stroke="#94a3b8" />

      <rect x={x + 20} y={y + 58} width="58" height="38" rx="3" fill="white" stroke={THIN} />
      <ellipse cx={x + 49} cy={y + 77} rx="21" ry="11" fill="none" stroke="#94a3b8" />
    </g>
  );
}

function Dining({ x, y }: { x: number; y: number }) {
  const chairs = [
    [x + 15, y - 10],
    [x + 55, y - 10],
    [x + 15, y + 58],
    [x + 55, y + 58],
    [x - 12, y + 22],
    [x + 82, y + 22],
  ];

  return (
    <g>
      <rect x={x} y={y} width="70" height="48" rx="8" fill="white" stroke={THIN} />
      {chairs.map(([cx, cy], index) => (
        <rect key={index} x={cx} y={cy} width="14" height="14" rx="3" fill="#f8fafc" stroke={THIN} />
      ))}
    </g>
  );
}

function KitchenCounter({
  x,
  y,
  w,
  h,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="22" fill="#f1f5f9" stroke={THIN} />
      <rect x={x + w - 22} y={y} width="22" height={h} fill="#f1f5f9" stroke={THIN} />

      <rect x={x + 15} y={y + 5} width="28" height="12" rx="2" fill="white" stroke={THIN} />
      <circle cx={x + 29} cy={y + 11} r="5" fill="none" stroke="#94a3b8" />

      <circle cx={x + w - 11} cy={y + 42} r="5" fill="none" stroke={THIN} />
      <circle cx={x + w - 11} cy={y + 57} r="5" fill="none" stroke={THIN} />
      <circle cx={x + w - 11} cy={y + 72} r="5" fill="none" stroke={THIN} />
    </g>
  );
}

function ToiletFixtures({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse cx={x + 20} cy={y + 25} rx="12" ry="16" fill="white" stroke={THIN} />
      <rect x={x + 12} y={y + 4} width="16" height="10" rx="2" fill="white" stroke={THIN} />
      <rect x={x + 45} y={y + 8} width="30" height="18" rx="8" fill="white" stroke={THIN} />
      <circle cx={x + 60} cy={y + 17} r="4" fill="none" stroke="#94a3b8" />
      <path d={`M${x + 42},${y + 50} h36 v36 h-36 z`} fill="none" stroke="#94a3b8" strokeDasharray="3 3" />
      <line x1={x + 42} y1={y + 50} x2={x + 78} y2={y + 86} stroke="#cbd5e1" />
      <line x1={x + 78} y1={y + 50} x2={x + 42} y2={y + 86} stroke="#cbd5e1" />
    </g>
  );
}

function Staircase({
  x,
  y,
  w = 86,
  h = 135,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#ffffff" stroke={WALL} strokeWidth="2" />
      {Array.from({ length: 11 }).map((_, index) => (
        <line
          key={index}
          x1={x + 8}
          y1={y + 10 + index * 10}
          x2={x + w - 8}
          y2={y + 10 + index * 10}
          stroke={THIN}
        />
      ))}
      <line x1={x + w / 2} y1={y + h - 18} x2={x + w / 2} y2={y + 20} stroke={WALL} strokeWidth="1.5" />
      <path d={`M${x + w / 2},${y + 18} l-6,10 h12 z`} fill={WALL} />
      <text x={x + w / 2 + 10} y={y + h - 8} fontSize="8" fontWeight="800">
        UP
      </text>
    </g>
  );
}

function Car({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="82" height="145" rx="25" fill="#f8fafc" stroke={THIN} strokeWidth="1.5" />
      <rect x={x + 11} y={y + 28} width="60" height="82" rx="18" fill="white" stroke="#94a3b8" />
      <line x1={x + 12} y1={y + 52} x2={x + 70} y2={y + 52} stroke="#94a3b8" />
      <line x1={x + 12} y1={y + 88} x2={x + 70} y2={y + 88} stroke="#94a3b8" />
      <rect x={x - 4} y={y + 30} width="6" height="28" rx="2" fill={THIN} />
      <rect x={x + 80} y={y + 30} width="6" height="28" rx="2" fill={THIN} />
      <rect x={x - 4} y={y + 90} width="6" height="28" rx="2" fill={THIN} />
      <rect x={x + 80} y={y + 90} width="6" height="28" rx="2" fill={THIN} />
    </g>
  );
}

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
  const hasParking = requirement.parking !== "No Parking";

  return (
    <g transform="translate(140 105)">
      {/* Main external wall */}
      <rect
        x="0"
        y="0"
        width="570"
        height="420"
        fill="#ffffff"
        stroke={WALL}
        strokeWidth="7"
      />

      {/* =========================
          TOP BEDROOM ZONE
      ========================== */}

      {/* Bedroom 2 */}
      <rect
        x="0"
        y="0"
        width="200"
        height="195"
        fill="#fffdf4"
        stroke={WALL}
        strokeWidth="3"
      />

      <Bed x={48} y={25} w={105} h={90} />
      <Wardrobe x={52} y={122} w={96} h={17} />

      <RoomLabel
        x={100}
        y={18}
        title="BEDROOM 2"
        size="11'-0&quot; × 12'-0&quot;"
      />

      <WindowSymbol x={68} y={0} length={58} />

      {/* Bedroom 2 attached toilet */}
      <rect
        x="200"
        y="0"
        width="85"
        height="150"
        fill="#eef9ff"
        stroke={WALL}
        strokeWidth="3"
      />

      <ToiletFixtures x={201} y={22} />

      <RoomLabel
        x={242}
        y={132}
        title="ATT. TOILET"
        size="5'-0&quot; × 8'-0&quot;"
      />

      <Ventilator x={229} y={0} />

      {/* Master attached toilet */}
      <rect
        x="285"
        y="0"
        width="85"
        height="150"
        fill="#eef9ff"
        stroke={WALL}
        strokeWidth="3"
      />

      <ToiletFixtures x={286} y={22} />

      <RoomLabel
        x={327}
        y={132}
        title="ATT. TOILET"
        size="5'-0&quot; × 8'-0&quot;"
      />

      <Ventilator x={314} y={0} />

      {/* Master bedroom */}
      <rect
        x="370"
        y="0"
        width="200"
        height="195"
        fill="#fffdf4"
        stroke={WALL}
        strokeWidth="3"
      />

      <Bed x={418} y={25} w={105} h={90} />
      <Wardrobe x={422} y={122} w={96} h={17} />

      <RoomLabel
        x={470}
        y={18}
        title="MASTER BEDROOM"
        size="13'-0&quot; × 12'-0&quot;"
      />

      <WindowSymbol x={438} y={0} length={60} />

      {/* Master-bedroom balcony */}
      {requirement.balcony && (
        <g>
          {/* Balcony slab */}
          <rect
            x="570"
            y="12"
            width="55"
            height="128"
            fill="#fff7ed"
            stroke={WALL}
            strokeWidth="2"
          />

          {/* Balcony floor tiles */}
          {Array.from({ length: 5 }).map((_, index) => (
            <line
              key={`master-balcony-tile-${index}`}
              x1={581 + index * 9}
              y1="16"
              x2={581 + index * 9}
              y2="136"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {/* Outer railing */}
          <line
            x1="624"
            y1="18"
            x2="624"
            y2="134"
            stroke={THIN}
            strokeWidth="3"
          />

          {Array.from({ length: 7 }).map((_, index) => (
            <line
              key={`master-balcony-rail-${index}`}
              x1="615"
              y1={24 + index * 17}
              x2="624"
              y2={24 + index * 17}
              stroke="#94a3b8"
              strokeWidth="1"
            />
          ))}

          {/* Planter */}
          <rect
            x="584"
            y="105"
            width="21"
            height="15"
            rx="2"
            fill="#a16207"
            stroke={THIN}
          />

          <path
            d="M594 105 C581 92 585 82 594 98 C594 80 604 81 596 100 C609 88 614 97 598 106"
            fill="none"
            stroke="#15803d"
            strokeWidth="2"
          />

          {/* Remove external wall section for balcony door */}
          <line
            x1="570"
            y1="47"
            x2="570"
            y2="91"
            stroke="#ffffff"
            strokeWidth="11"
          />

          {/* Door opens into master bedroom */}
          <Door
            x={570}
            y={49}
            side="east"
            size={38}
          />

          <text
            x="600"
            y="72"
            textAnchor="middle"
            fontSize="8"
            fontWeight="800"
            transform="rotate(-90 600 72)"
          >
            MASTER BALCONY
          </text>

          <text
            x="612"
            y="72"
            textAnchor="middle"
            fontSize="7"
            transform="rotate(-90 612 72)"
          >
            4'-0&quot; WIDE
          </text>
        </g>
      )}

      {!requirement.balcony && (
        <WindowSymbol
          x={570}
          y={47}
          length={48}
          vertical
        />
      )}

      {/* Attached-bath doors open into their respective bedrooms */}
      <Door x={200} y={52} side="east" size={27} />
      <Door x={370} y={52} side="west" size={27} />

      {/* =========================
          CENTRAL BEDROOM PASSAGE
          No passage below bedroom ends
      ========================== */}

      <rect
        x="200"
        y="150"
        width="170"
        height="45"
        fill="#ffffff"
        stroke={WALL}
        strokeWidth="3"
      />

      <text
        x="285"
        y="177"
        textAnchor="middle"
        fontSize="8"
        fontWeight="800"
        fill={DIM}
      >
        BEDROOM PASSAGE
      </text>

      {/* Bedroom 2 entry from central passage */}
      <Door
        x={200}
        y={157}
        side="east"
        size={30}
      />

      {/* Master-bedroom entry from central passage */}
      <Door
        x={370}
        y={157}
        side="west"
        size={30}
      />

      {/* =========================
          LIVING / DINING OPEN AREA
      ========================== */}

      <rect
        x="0"
        y="195"
        width="390"
        height="225"
        fill="#fffef5"
        stroke={WALL}
        strokeWidth="3"
      />

      {/* Living furniture */}
      <SofaSet x={55} y={235} />

      {/* Dining furniture */}
      <Dining x={244} y={242} />

      <RoomLabel
        x={220}
        y={337}
        title="LIVING / DINING"
        size="17'-6&quot; × 22'-6&quot;"
      />

      {/* Living balcony / sit-out */}
      {requirement.balcony && (
        <g>
          {/* Balcony slab */}
          <rect
            x="-58"
            y="232"
            width="58"
            height="128"
            fill="#fff7ed"
            stroke={WALL}
            strokeWidth="2"
          />

          {/* Balcony floor pattern */}
          {Array.from({ length: 5 }).map((_, index) => (
            <line
              key={`living-balcony-tile-${index}`}
              x1={-48 + index * 10}
              y1="237"
              x2={-48 + index * 10}
              y2="355"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {/* Outer railing */}
          <line
            x1="-57"
            y1="238"
            x2="-57"
            y2="354"
            stroke={THIN}
            strokeWidth="3"
          />

          {Array.from({ length: 7 }).map((_, index) => (
            <line
              key={`living-balcony-rail-${index}`}
              x1="-57"
              y1={243 + index * 17}
              x2="-48"
              y2={243 + index * 17}
              stroke="#94a3b8"
              strokeWidth="1"
            />
          ))}

          {/* Balcony planters */}
          <rect
            x="-45"
            y="245"
            width="22"
            height="14"
            rx="2"
            fill="#a16207"
            stroke={THIN}
          />

          <path
            d="M-34 245 C-47 232 -43 221 -34 239 C-34 220 -23 222 -32 241 C-19 229 -15 239 -31 246"
            fill="none"
            stroke="#15803d"
            strokeWidth="2"
          />

          <rect
            x="-45"
            y="329"
            width="22"
            height="14"
            rx="2"
            fill="#a16207"
            stroke={THIN}
          />

          <path
            d="M-34 329 C-47 316 -43 305 -34 323 C-34 304 -23 306 -32 325 C-19 313 -15 323 -31 330"
            fill="none"
            stroke="#15803d"
            strokeWidth="2"
          />

          {/* Remove external wall for living balcony door */}
          <line
            x1="0"
            y1="270"
            x2="0"
            y2="316"
            stroke="#ffffff"
            strokeWidth="11"
          />

          {/* Balcony door opens into living */}
          <Door
            x={0}
            y={272}
            side="west"
            size={40}
          />

          <text
            x="-29"
            y="294"
            textAnchor="middle"
            fontSize="8"
            fontWeight="800"
            transform="rotate(-90 -29 294)"
          >
            LIVING BALCONY
          </text>

          <text
            x="-17"
            y="294"
            textAnchor="middle"
            fontSize="7"
            transform="rotate(-90 -17 294)"
          >
            4'-0&quot; WIDE
          </text>
        </g>
      )}

      {!requirement.balcony && (
        <>
          <WindowSymbol
            x={0}
            y={250}
            length={52}
            vertical
          />

          <WindowSymbol
            x={0}
            y={327}
            length={52}
            vertical
          />
        </>
      )}

      {/* Wide open connection from living to bedroom passage.
          No door is provided here. */}
      <line
        x1="242"
        y1="195"
        x2="328"
        y2="195"
        stroke="#ffffff"
        strokeWidth="10"
      />

      {/* Clean ends of the open passage */}
      <line
        x1="242"
        y1="190"
        x2="242"
        y2="200"
        stroke={WALL}
        strokeWidth="2"
      />

      <line
        x1="328"
        y1="190"
        x2="328"
        y2="200"
        stroke={WALL}
        strokeWidth="2"
      />

      {/* =========================
          POOJA FROM LIVING
      ========================== */}

      <rect
        x="0"
        y="195"
        width="82"
        height="72"
        fill="#fff8dd"
        stroke={WALL}
        strokeWidth="3"
      />

      <rect
        x="17"
        y="208"
        width="48"
        height="34"
        fill="#ffffff"
        stroke={THIN}
      />

      <path
        d="M41 212 L29 231 H53 Z"
        fill="none"
        stroke={THIN}
        strokeWidth="1.2"
      />

      <circle
        cx="41"
        cy="232"
        r="4"
        fill="none"
        stroke={THIN}
      />

      <text
        x="41"
        y="257"
        textAnchor="middle"
        fontSize="9"
        fontWeight="800"
      >
        POOJA
      </text>

      {/* Pooja entry directly from living */}
      <Door x={82} y={218} side="east" size={25} />

      {/* =========================
          KITCHEN
      ========================== */}

      <rect
        x="390"
        y="195"
        width="180"
        height="135"
        fill="#f2fff2"
        stroke={WALL}
        strokeWidth="3"
      />

      <KitchenCounter
        x={405}
        y={210}
        w={145}
        h={100}
      />

      <rect
        x="408"
        y="278"
        width="32"
        height="42"
        fill="#ffffff"
        stroke={THIN}
      />

      <text
        x="424"
        y="302"
        textAnchor="middle"
        fontSize="7"
      >
        FRIDGE
      </text>

      <RoomLabel
        x={480}
        y={312}
        title="KITCHEN"
        size="10'-0&quot; × 9'-0&quot;"
      />

      <WindowSymbol x={570} y={224} length={42} vertical />

      {/* Kitchen entry from living */}
      <Door x={390} y={226} side="west" size={31} />

      {/* =========================
          UTILITY – OPEN FROM KITCHEN
      ========================== */}

      <rect
        x="390"
        y="330"
        width="180"
        height="90"
        fill="#fff8ef"
        stroke={WALL}
        strokeWidth="3"
      />

      {/* White opening hides shared wall:
          open utility connection, no door */}
      <line
        x1="424"
        y1="330"
        x2="528"
        y2="330"
        stroke="#ffffff"
        strokeWidth="9"
      />

      <line
        x1="424"
        y1="327"
        x2="424"
        y2="333"
        stroke={WALL}
        strokeWidth="2"
      />

      <line
        x1="528"
        y1="327"
        x2="528"
        y2="333"
        stroke={WALL}
        strokeWidth="2"
      />

      <rect
        x="407"
        y="350"
        width="76"
        height="31"
        fill="#ffffff"
        stroke={THIN}
      />

      <circle
        cx="445"
        cy="365"
        r="8"
        fill="none"
        stroke={THIN}
      />

      <rect
        x="500"
        y="348"
        width="45"
        height="49"
        fill="#ffffff"
        stroke={THIN}
      />

      <circle
        cx="522"
        cy="370"
        r="15"
        fill="none"
        stroke="#94a3b8"
      />

      <text
        x="522"
        y="373"
        textAnchor="middle"
        fontSize="7"
      >
        WM
      </text>

      <RoomLabel
        x={480}
        y={410}
        title="UTILITY"
        size="5'-0&quot; wide"
      />

      <WindowSymbol x={570} y={353} length={40} vertical />

      {/* =========================
          STAIRCASE NEAR MAIN ENTRY
      ========================== */}

      <rect
        x="0"
        y="330"
        width="125"
        height="90"
        fill="#ffffff"
        stroke={WALL}
        strokeWidth="3"
      />

      <Staircase
        x={7}
        y={337}
        w={110}
        h={76}
      />

      {/* Staircase access from living */}
      <Door x={125} y={352} side="east" size={28} />

      {/* =========================
          OPTIONAL PARKING INDICATION
      ========================== */}

      {hasParking && (
        <g opacity="0.75">
          <rect
            x="128"
            y="344"
            width="84"
            height="70"
            fill="#f8fafc"
            stroke="#94a3b8"
            strokeDasharray="4 3"
          />

          <text
            x="170"
            y="375"
            textAnchor="middle"
            fontSize="8"
            fontWeight="800"
            fill={DIM}
          >
            PARKING /
          </text>

          <text
            x="170"
            y="388"
            textAnchor="middle"
            fontSize="8"
            fontWeight="800"
            fill={DIM}
          >
            FOYER OPTION
          </text>
        </g>
      )}

      {/* =========================
          MAIN ENTRANCE
      ========================== */}

      {/* Main door opens into living area */}
      <Door
        x={275}
        y={420}
        side="south"
        size={43}
      />

      <text
        x="296"
        y="407"
        textAnchor="middle"
        fontSize="8"
        fontWeight="900"
        fill={DIM}
      >
        MAIN ENTRY
      </text>

      {/* Front windows */}
      <WindowSymbol x={165} y={420} length={55} />
      <WindowSymbol x={330} y={420} length={42} />

      {/* Main plot dimensions */}
      <HorizontalDimension
        x1={0}
        x2={570}
        y={-35}
        label={`${requirement.plotWidth}'-0"`}
      />

      <VerticalDimension
        x={-35}
        y1={0}
        y2={420}
        label={`${requirement.plotLength}'-0"`}
      />
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
  return (
    <g transform="translate(140 105)">
      <rect x="0" y="0" width="570" height="420" fill="white" stroke={WALL} strokeWidth="7" />

      <rect x="0" y="0" width="250" height="175" fill="#fffef5" stroke={WALL} strokeWidth="3" />
      <SofaSet x={68} y={32} />
      <RoomLabel x={125} y={160} title={typical ? "FAMILY LOUNGE" : "UPPER LIVING"} size="14'-0&quot; × 11'-0&quot;" />
      <WindowSymbol x={90} y={0} length={65} />

      <rect x="250" y="0" width="220" height="175" fill="#fffdf4" stroke={WALL} strokeWidth="3" />
      <Bed x={314} y={32} w={100} h={110} />
      <Wardrobe x={320} y={148} w={88} />
      <RoomLabel x={360} y={20} title="BEDROOM 3" size="12'-0&quot; × 11'-0&quot;" />
      <WindowSymbol x={325} y={0} length={55} />

      <rect x="470" y="0" width="100" height="175" fill="#edf8ff" stroke={WALL} strokeWidth="3" />
      <RoomLabel x={520} y={88} title={requirement.balcony ? "BALCONY" : "OPEN TERRACE"} size="5'-0&quot; wide" />
      <line x1="480" y1="18" x2="560" y2="18" stroke={THIN} strokeDasharray="5 4" />
      <line x1="480" y1="158" x2="560" y2="158" stroke={THIN} strokeDasharray="5 4" />

      <rect x="0" y="175" width="235" height="245" fill="#fffdf4" stroke={WALL} strokeWidth="3" />
      <Bed x={64} y={230} w={108} h={125} />
      <Wardrobe x={66} y={382} w={104} />
      <RoomLabel x={117} y={198} title="MASTER BEDROOM" size="13'-0&quot; × 14'-0&quot;" />
      <WindowSymbol x={0} y={254} length={55} vertical />

      <rect x="235" y="175" width="160" height="245" fill="#fffdf4" stroke={WALL} strokeWidth="3" />
      <Bed x={270} y={238} w={90} h={110} />
      <Wardrobe x={275} y={385} w={80} />
      <RoomLabel x={315} y={198} title={requirement.bedrooms >= 4 ? "BEDROOM 4" : "STUDY / BEDROOM"} size="10'-0&quot; × 12'-0&quot;" />
      <WindowSymbol x={290} y={420} length={48} />

      <rect x="395" y="175" width="90" height="115" fill="#f2fbff" stroke={WALL} strokeWidth="3" />
      <ToiletFixtures x={398} y={182} />
      <RoomLabel x={440} y={278} title="TOILET" size="5'-0&quot; × 7'-0&quot;" />
      <Ventilator x={425} y={175} />

      <rect x="485" y="175" width="85" height="115" fill="#f2fbff" stroke={WALL} strokeWidth="3" />
      <ToiletFixtures x={487} y={182} />
      <RoomLabel x={527} y={278} title="TOILET" size="5'-0&quot; × 7'-0&quot;" />
      <Ventilator x={512} y={175} />

      <Staircase x={395} y={290} w={95} h={130} />

      <rect x="490" y="290" width="80" height="130" fill="#ffffff" stroke={WALL} strokeWidth="3" />
      {requirement.lift ? (
        <>
          <rect x="505" y="315" width="50" height="72" fill="white" stroke={THIN} strokeWidth="2" />
          <line x1="530" y1="315" x2="530" y2="387" stroke={THIN} />
          <text x="530" y="405" textAnchor="middle" fontSize="10" fontWeight="800">LIFT</text>
        </>
      ) : (
        <RoomLabel x={530} y={352} title="STORE / SHAFT" size="Flexible use" />
      )}

      <Door x={250} y={70} side="west" size={32} />
      <Door x={470} y={75} side="west" size={30} />
      <Door x={235} y={260} side="west" size={30} />
      <Door x={395} y={220} side="west" size={26} />
      <Door x={485} y={220} side="west" size={26} />
      <Door x={395} y={335} side="west" size={26} />
      <Door x={490} y={335} side="west" size={25} />

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



