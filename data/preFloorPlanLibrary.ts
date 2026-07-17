export type Facing = "North" | "South" | "East" | "West";
export type Parking = "Full Parking" | "Half Parking" | "No Parking";
export type BuildingType = "Own Use" | "Rental Use" | "Duplex" | "Multi-unit";

export type FloorPlanTemplate = {
  id: string;
  title: string;
  plotWidth: number;
  plotLength: number;
  minWidth: number;
  maxWidth: number;
  minLength: number;
  maxLength: number;
  facing: Facing;
  supportedFloors: number[];
  bedroomOptions: number[];
  toiletOptions: number[];
  buildingTypes: BuildingType[];
  parkingOptions: Parking[];
  liftSupported: boolean;
  vaastu: boolean;
  features: {
    pooja: boolean;
    utility: boolean;
    balcony: boolean;
    store: boolean;
  };
  style: "compact" | "standard" | "premium";
  architectVerified: boolean;
  tags: string[];
};

export type FloorPlanRequirement = {
  plotWidth: number;
  plotLength: number;
  facing: Facing;
  floors: number;
  bedrooms: number;
  toilets: number;
  buildingType: BuildingType;
  parking: Parking;
  lift: boolean;
  vaastu: boolean;
  pooja: boolean;
  utility: boolean;
  balcony: boolean;
};

const sizes: Array<[number, number]> = [
  [20, 30], [20, 40], [25, 40], [30, 40], [30, 45], [30, 50],
  [35, 40], [35, 50], [40, 40], [40, 50], [40, 60], [50, 60],
];
const facings: Facing[] = ["North", "South", "East", "West"];

function classify(width: number, length: number) {
  const area = width * length;
  if (area <= 900) return { style: "compact" as const, beds: [1, 2], toilets: [1, 2], floors: [1, 2] };
  if (area <= 1600) return { style: "standard" as const, beds: [2, 3], toilets: [2, 3], floors: [1, 2, 3] };
  return { style: "premium" as const, beds: [3, 4], toilets: [3, 4], floors: [1, 2, 3] };
}

export const PRE_FLOOR_PLAN_LIBRARY: FloorPlanTemplate[] = sizes.flatMap(([width, length]) =>
  facings.map((facing, index) => {
    const c = classify(width, length);
    const area = width * length;
    return {
      id: `BM-${facing.charAt(0)}-${width}${length}-${String(index + 1).padStart(2, "0")}`,
      title: `${width} × ${length} ${facing}-Facing Vaastu Plan`,
      plotWidth: width,
      plotLength: length,
      minWidth: Math.max(15, width - 2),
      maxWidth: width + 3,
      minLength: Math.max(20, length - 3),
      maxLength: length + 4,
      facing,
      supportedFloors: c.floors,
      bedroomOptions: c.beds,
      toiletOptions: c.toilets,
      buildingTypes: area >= 1200 ? ["Own Use", "Rental Use", "Duplex"] : ["Own Use", "Rental Use"],
      parkingOptions: width >= 30 ? ["Full Parking", "Half Parking", "No Parking"] : ["Half Parking", "No Parking"],
      liftSupported: area >= 1200,
      vaastu: true,
      features: {
        pooja: area >= 900,
        utility: area >= 800,
        balcony: length >= 40,
        store: area >= 1500,
      },
      style: c.style,
      architectVerified: true,
      tags: [facing, `${width}x${length}`, c.style, area >= 1200 ? "family-home" : "compact-home"],
    };
  })
);

function optionScore<T>(value: T, options: T[], exact: number, near: number) {
  if (options.includes(value)) return exact;
  return near;
}

export function scoreTemplate(template: FloorPlanTemplate, r: FloorPlanRequirement) {
  let score = 0;
  const reasons: string[] = [];
  const differences: string[] = [];

  if (template.facing === r.facing) { score += 25; reasons.push("Road facing matched"); }
  else differences.push(`${template.facing} facing instead of ${r.facing}`);

  const widthDiff = Math.abs(template.plotWidth - r.plotWidth);
  const lengthDiff = Math.abs(template.plotLength - r.plotLength);
  score += Math.max(0, 12.5 - widthDiff * 2.2);
  score += Math.max(0, 12.5 - lengthDiff * 1.6);
  if (widthDiff <= 2 && lengthDiff <= 3) reasons.push("Plot size is within close matching range");
  else differences.push(`Template plot is ${template.plotWidth} × ${template.plotLength} ft`);

  score += optionScore(r.floors, template.supportedFloors, 15, 5);
  if (template.supportedFloors.includes(r.floors)) reasons.push(`${r.floors} floor option supported`);
  else differences.push(`Closest supported floors: ${template.supportedFloors.join(", ")}`);

  score += optionScore(r.bedrooms, template.bedroomOptions, 12, 4);
  if (template.bedroomOptions.includes(r.bedrooms)) reasons.push(`${r.bedrooms} bedroom option supported`);
  else differences.push(`Bedroom options: ${template.bedroomOptions.join("/")}`);

  score += optionScore(r.toilets, template.toiletOptions, 4, 1);
  if (template.buildingTypes.includes(r.buildingType)) score += 8;
  else differences.push(`${r.buildingType} is not the primary use type`);

  if (template.parkingOptions.includes(r.parking)) score += 5;
  else differences.push(`${r.parking} not included in base template`);

  if (template.liftSupported === r.lift || !r.lift) score += 3;
  else differences.push("Lift requires architect adjustment");

  if (!r.vaastu || template.vaastu) { score += 2; if (r.vaastu) reasons.push("Vaastu-oriented template"); }

  const requestedFeatures: Array<[boolean, boolean, string]> = [
    [r.pooja, template.features.pooja, "Pooja room"],
    [r.utility, template.features.utility, "Utility"],
    [r.balcony, template.features.balcony, "Balcony"],
  ];
  requestedFeatures.forEach(([wanted, available, label]) => {
    if (!wanted) return;
    if (available) score += 0.33;
    else differences.push(`${label} needs adjustment`);
  });

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    reasons,
    differences,
  };
}

export function findBestTemplates(r: FloorPlanRequirement, limit = 8) {
  return PRE_FLOOR_PLAN_LIBRARY
    .map(template => ({ template, ...scoreTemplate(template, r) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
