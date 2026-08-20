export type ReferenceFacing =
  | "East"
  | "West"
  | "North"
  | "South";

export type ReferenceFloorMode =
  | "GF"
  | "G+1"
  | "G+2";

export type ProfessionalReferencePlan = {
  id: string;
  code: string;

  plotWidth: number;
  plotLength: number;

  facing: ReferenceFacing;
  floorMode: ReferenceFloorMode;

  image: string;

  crop: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
};


/*
  BUILDMITRA PROFESSIONAL REFERENCE LIBRARY
  -----------------------------------------
  SHEET-01
  Plot: 20' x 30'
  All facings
  GF / G+1 / G+2

  The crop values are percentages of the complete source sheet.
  We retain the original professional drawing untouched.
*/

export const PROFESSIONAL_REFERENCE_PLANS:
  ProfessionalReferencePlan[] = [

  // ============================================================
  // GF
  // ============================================================

  {
    id: "BMF-2030-E-GF-001",
    code: "E-2030-GF-001",
    plotWidth: 20,
    plotLength: 30,
    facing: "East",
    floorMode: "GF",
    image: "/floor-plan-library/BMF-2030-BATCH1.png",
    crop: { x: 0.5, y: 11.0, w: 16.3, h: 37.0 }
  },

  {
    id: "BMF-2030-W-GF-001",
    code: "W-2030-GF-001",
    plotWidth: 20,
    plotLength: 30,
    facing: "West",
    floorMode: "GF",
    image: "/floor-plan-library/BMF-2030-BATCH1.png",
    crop: { x: 16.8, y: 11.0, w: 16.4, h: 37.0 }
  },

  {
    id: "BMF-2030-N-GF-001",
    code: "N-2030-GF-001",
    plotWidth: 20,
    plotLength: 30,
    facing: "North",
    floorMode: "GF",
    image: "/floor-plan-library/BMF-2030-BATCH1.png",
    crop: { x: 33.2, y: 11.0, w: 16.4, h: 37.0 }
  },

  {
    id: "BMF-2030-S-GF-001",
    code: "S-2030-GF-001",
    plotWidth: 20,
    plotLength: 30,
    facing: "South",
    floorMode: "GF",
    image: "/floor-plan-library/BMF-2030-BATCH1.png",
    crop: { x: 49.7, y: 11.0, w: 16.3, h: 37.0 }
  },


  // ============================================================
  // G+1
  // ============================================================

  {
    id: "BMF-2030-E-G1-001",
    code: "E-2030-G1-001",
    plotWidth: 20,
    plotLength: 30,
    facing: "East",
    floorMode: "G+1",
    image: "/floor-plan-library/BMF-2030-BATCH1.png",
    crop: { x: 66.1, y: 11.0, w: 16.3, h: 37.0 }
  },

  {
    id: "BMF-2030-W-G1-001",
    code: "W-2030-G1-001",
    plotWidth: 20,
    plotLength: 30,
    facing: "West",
    floorMode: "G+1",
    image: "/floor-plan-library/BMF-2030-BATCH1.png",
    crop: { x: 82.5, y: 11.0, w: 17.0, h: 37.0 }
  },

  {
    id: "BMF-2030-N-G1-001",
    code: "N-2030-G1-001",
    plotWidth: 20,
    plotLength: 30,
    facing: "North",
    floorMode: "G+1",
    image: "/floor-plan-library/BMF-2030-BATCH1.png",
    crop: { x: 0.5, y: 48.5, w: 16.3, h: 36.0 }
  },

  {
    id: "BMF-2030-S-G1-001",
    code: "S-2030-G1-001",
    plotWidth: 20,
    plotLength: 30,
    facing: "South",
    floorMode: "G+1",
    image: "/floor-plan-library/BMF-2030-BATCH1.png",
    crop: { x: 16.8, y: 48.5, w: 16.4, h: 36.0 }
  },


  // ============================================================
  // G+2
  // ============================================================

  {
    id: "BMF-2030-E-G2-001",
    code: "E-2030-G2-001",
    plotWidth: 20,
    plotLength: 30,
    facing: "East",
    floorMode: "G+2",
    image: "/floor-plan-library/BMF-2030-BATCH1.png",
    crop: { x: 33.2, y: 48.5, w: 16.4, h: 36.0 }
  },

  {
    id: "BMF-2030-W-G2-001",
    code: "W-2030-G2-001",
    plotWidth: 20,
    plotLength: 30,
    facing: "West",
    floorMode: "G+2",
    image: "/floor-plan-library/BMF-2030-BATCH1.png",
    crop: { x: 49.7, y: 48.5, w: 16.3, h: 36.0 }
  },

  {
    id: "BMF-2030-N-G2-001",
    code: "N-2030-G2-001",
    plotWidth: 20,
    plotLength: 30,
    facing: "North",
    floorMode: "G+2",
    image: "/floor-plan-library/BMF-2030-BATCH1.png",
    crop: { x: 66.1, y: 48.5, w: 16.3, h: 36.0 }
  },

  {
    id: "BMF-2030-S-G2-001",
    code: "S-2030-G2-001",
    plotWidth: 20,
    plotLength: 30,
    facing: "South",
    floorMode: "G+2",
    image: "/floor-plan-library/BMF-2030-BATCH1.png",
    crop: { x: 82.5, y: 48.5, w: 17.0, h: 36.0 }
  }

];


export function findProfessionalReferencePlan(
  plotWidth: number,
  plotLength: number,
  facing: string,
  floors: number
) {

  const floorMode: ReferenceFloorMode =
    floors <= 1
      ? "GF"
      : floors === 2
      ? "G+1"
      : "G+2";

  return PROFESSIONAL_REFERENCE_PLANS.find(
    plan =>
      plan.plotWidth === Number(plotWidth) &&
      plan.plotLength === Number(plotLength) &&
      plan.facing.toLowerCase() ===
        String(facing).toLowerCase() &&
      plan.floorMode === floorMode
  ) || null;
}
