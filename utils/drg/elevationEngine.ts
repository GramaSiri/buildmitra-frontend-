import { DRGInputs, FloorLayout, ArchitecturalStyle } from "./types";

export type ElevationFeature = {
  floorLevel: number;
  floorName: string;
  heightFt: number;
  facadeStyle: ArchitecturalStyle;
  windowOpenings: { x: number; w: number; h: number }[];
  balconyDeck?: { x: number; w: number; railingType: string };
  parapetHeightFt: number;
};

/**
 * Generates front structural & architectural elevation matched to floor plan geometry
 */
export function generateFrontElevation(
  inputs: DRGInputs,
  floors: FloorLayout[]
): {
  features: ElevationFeature[];
  totalHeightFt: number;
  parapetType: string;
  claddingMaterial: string;
} {
  const floorHeightFt = 10;
  const floorsCount = Math.max(1, inputs.floors);

  const features: ElevationFeature[] = floors.map((f) => {
    const windowsOnFront = f.rooms
      .filter((r) => r.windows.some((w) => w.side === "south" || w.side === "east"))
      .map((r) => ({ x: r.x, w: r.w * 0.4, h: 4.5 }));

    const balcony = f.rooms.find((r) => r.kind === "balcony");

    return {
      floorLevel: f.level,
      floorName: f.name,
      heightFt: floorHeightFt,
      facadeStyle: inputs.stylePreference,
      windowOpenings: windowsOnFront.length > 0 ? windowsOnFront : [{ x: 5, w: 4, h: 4.5 }],
      balconyDeck: balcony ? { x: balcony.x, w: balcony.w, railingType: "Glass & SS Railing" } : undefined,
      parapetHeightFt: 3.5,
    };
  });

  const style = inputs.stylePreference;
  const claddingMaterial =
    style === "Modern"
      ? "Louvers & Exterior Texture Paint with Wooden Highlights"
      : style === "Contemporary"
      ? "Stone Cladding & Structural Glass Facade"
      : style === "Minimalist"
      ? "Clean White Texture Finish with Anthracite Trims"
      : "Teak Wood Pillars & Mangalore Tile Canopy";

  return {
    features,
    totalHeightFt: floorsCount * floorHeightFt + 3.5,
    parapetType: "3.5 ft Reinforced Parapet Wall",
    claddingMaterial,
  };
}
