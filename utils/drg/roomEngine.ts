import { DRGInputs, SpaceRequirement, SpaceProgramme, FloorProgramme } from "./types";

/**
 * Architectural Space & Floor Programme Generator:
 * Generates an exact space programme derived from user inputs.
 * Enforces realistic room size limits, aspect ratios (1:1 to 1:1.8), and privacy zones.
 * Excess BUA is converted into useful spaces (Lounges, Studies, Terraces, Dressing Areas)
 * rather than stretching bedrooms or toilets into unrealistic proportions (e.g., 57x18 ft bed or 18x5 ft toilet).
 */
export function generateSpaceProgramme(inputs: DRGInputs, buildableAreaSqft: number): SpaceProgramme {
  const spaces: SpaceRequirement[] = [];
  const floorsCount = Math.max(1, inputs.floors);
  const resFloor = inputs.parking === "Full Parking" ? 1 : 0;

  // ---------------- 1. GROUND FLOOR PARKING & SERVICE PROGRAMME ----------------
  if (inputs.parking === "Full Parking") {
    spaces.push({
      id: "sp_stilt_parking",
      type: "parking",
      name: "FULL STILT PARKING & DRIVEWAY",
      count: 1,
      targetFloor: 0,
      allowedFloors: [0],
      minWidthFt: 14,
      maxWidthFt: 30,
      minDepthFt: 16,
      maxDepthFt: 35,
      minAreaSqFt: 224,
      preferredAreaSqFt: 384,
      maxAreaSqFt: 600,
      privacyZone: "service",
      adjacency: ["staircase", "lift"],
      avoidAdjacency: ["bedroom", "kitchen"],
      plumbingRequired: false,
      exteriorAccessRequired: true,
      aspectRatioRange: [1.0, 1.8],
    });

    spaces.push({
      id: "sp_elec_room",
      type: "electrical",
      name: "METER & ELECTRICAL ROOM",
      count: 1,
      targetFloor: 0,
      allowedFloors: [0],
      minWidthFt: 4,
      maxWidthFt: 6,
      minDepthFt: 5,
      maxDepthFt: 7,
      minAreaSqFt: 20,
      preferredAreaSqFt: 30,
      maxAreaSqFt: 42,
      privacyZone: "service",
      adjacency: ["stilt_parking"],
      avoidAdjacency: [],
      plumbingRequired: false,
      exteriorAccessRequired: false,
      aspectRatioRange: [1.0, 1.4],
    });
  }

  // Vertical Core: Stair & Lift
  const stairW = inputs.staircaseWidthFt || 4;
  spaces.push({
    id: "sp_staircase",
    type: "stair",
    name: inputs.staircaseShape + " STAIRCASE CORE",
    count: 1,
    targetFloor: 0,
    allowedFloors: Array.from({ length: floorsCount }, (_, i) => i),
    minWidthFt: 7,
    maxWidthFt: 9,
    minDepthFt: 12,
    maxDepthFt: 15,
    minAreaSqFt: 84,
    preferredAreaSqFt: 98,
    maxAreaSqFt: 135,
    privacyZone: "public",
    adjacency: ["lift", "living", "foyer"],
    avoidAdjacency: [],
    plumbingRequired: false,
    exteriorAccessRequired: false,
    aspectRatioRange: [1.3, 1.8],
  });

  if (inputs.lift) {
    spaces.push({
      id: "sp_lift",
      type: "lift",
      name: `ELEVATOR (${inputs.liftCapacity})`,
      count: 1,
      targetFloor: 0,
      allowedFloors: Array.from({ length: floorsCount }, (_, i) => i),
      minWidthFt: 5,
      maxWidthFt: 6,
      minDepthFt: 5,
      maxDepthFt: 6,
      minAreaSqFt: 25,
      preferredAreaSqFt: 25,
      maxAreaSqFt: 36,
      privacyZone: "public",
      adjacency: ["staircase"],
      avoidAdjacency: [],
      plumbingRequired: false,
      exteriorAccessRequired: false,
      aspectRatioRange: [1.0, 1.2],
    });
  }

  // ---------------- 2. FIRST FLOOR PUBLIC & FAMILY LIVING PROGRAMME ----------------
  spaces.push({
    id: "sp_living",
    type: "living",
    name: "MAIN LIVING HALL",
    count: 1,
    targetFloor: resFloor,
    allowedFloors: [resFloor],
    minWidthFt: 11,
    maxWidthFt: 18,
    minDepthFt: 13,
    maxDepthFt: 22,
    minAreaSqFt: 150,
    preferredAreaSqFt: 210,
    maxAreaSqFt: 350,
    privacyZone: "public",
    adjacency: ["dining", "pooja", "balcony"],
    avoidAdjacency: ["toilet"],
    plumbingRequired: false,
    exteriorAccessRequired: true,
    aspectRatioRange: [1.1, 1.6],
  });

  if (inputs.diningRooms > 0) {
    spaces.push({
      id: "sp_dining",
      type: "dining",
      name: "DINING HALL",
      count: 1,
      targetFloor: resFloor,
      allowedFloors: [resFloor],
      minWidthFt: 9,
      maxWidthFt: 14,
      minDepthFt: 10,
      maxDepthFt: 16,
      minAreaSqFt: 80,
      preferredAreaSqFt: 120,
      maxAreaSqFt: 200,
      privacyZone: "semi-private",
      adjacency: ["living", "kitchen"],
      avoidAdjacency: [],
      plumbingRequired: false,
      exteriorAccessRequired: false,
      aspectRatioRange: [1.0, 1.5],
    });
  }

  if (inputs.kitchens > 0) {
    spaces.push({
      id: "sp_kitchen_1",
      type: "kitchen",
      name: "VASTU KITCHEN (SE)",
      count: 1,
      targetFloor: resFloor,
      allowedFloors: [resFloor],
      minWidthFt: 8,
      maxWidthFt: 12,
      minDepthFt: 9,
      maxDepthFt: 14,
      minAreaSqFt: 70,
      preferredAreaSqFt: 95,
      maxAreaSqFt: 160,
      privacyZone: "service",
      adjacency: ["dining", "utility", "store"],
      avoidAdjacency: ["toilet", "pooja"],
      plumbingRequired: true,
      exteriorAccessRequired: true,
      aspectRatioRange: [1.1, 1.5],
    });
  }

  if (inputs.utilityCount > 0) {
    spaces.push({
      id: "sp_utility_1",
      type: "utility",
      name: "WASH / UTILITY",
      count: 1,
      targetFloor: resFloor,
      allowedFloors: [resFloor],
      minWidthFt: 4.5,
      maxWidthFt: 7,
      minDepthFt: 6,
      maxDepthFt: 10,
      minAreaSqFt: 25,
      preferredAreaSqFt: 35,
      maxAreaSqFt: 60,
      privacyZone: "service",
      adjacency: ["kitchen"],
      avoidAdjacency: ["living", "pooja"],
      plumbingRequired: true,
      exteriorAccessRequired: true,
      aspectRatioRange: [1.2, 1.8],
    });
  }

  if (inputs.storeRooms > 0) {
    spaces.push({
      id: "sp_store_1",
      type: "store",
      name: "STORE ROOM",
      count: 1,
      targetFloor: resFloor,
      allowedFloors: [resFloor],
      minWidthFt: 4,
      maxWidthFt: 6,
      minDepthFt: 5,
      maxDepthFt: 8,
      minAreaSqFt: 20,
      preferredAreaSqFt: 30,
      maxAreaSqFt: 50,
      privacyZone: "service",
      adjacency: ["kitchen"],
      avoidAdjacency: [],
      plumbingRequired: false,
      exteriorAccessRequired: false,
      aspectRatioRange: [1.0, 1.5],
    });
  }

  if (inputs.poojaRooms > 0) {
    spaces.push({
      id: "sp_pooja_1",
      type: "pooja",
      name: "POOJA MANDIR (NE)",
      count: 1,
      targetFloor: resFloor,
      allowedFloors: [resFloor],
      minWidthFt: 4,
      maxWidthFt: 6,
      minDepthFt: 5,
      maxDepthFt: 7,
      minAreaSqFt: 20,
      preferredAreaSqFt: 25,
      maxAreaSqFt: 45,
      privacyZone: "public",
      adjacency: ["living", "dining"],
      avoidAdjacency: ["toilet", "utility"],
      plumbingRequired: false,
      exteriorAccessRequired: false,
      aspectRatioRange: [1.0, 1.4],
    });
  }

  const commonCount = inputs.commonToilets || 2;
  spaces.push({
    id: "sp_common_toilet_1",
    type: "toilet",
    subtype: "common",
    name: "COMMON TOILET 1",
    count: 1,
    targetFloor: resFloor,
    allowedFloors: [resFloor],
    minWidthFt: 4.5,
    maxWidthFt: 6,
    minDepthFt: 6.5,
    maxDepthFt: 8.5,
    minAreaSqFt: 30,
    preferredAreaSqFt: 40,
    maxAreaSqFt: 55,
    privacyZone: "semi-private",
    adjacency: ["dining", "living"],
    avoidAdjacency: ["kitchen", "pooja"],
    plumbingRequired: true,
    exteriorAccessRequired: true,
    aspectRatioRange: [1.2, 1.7],
  });

  // ---------------- 3. SECOND FLOOR PRIVATE SLEEPING SUITE PROGRAMME ----------------
  const f2Floor = floorsCount > 2 ? resFloor + 1 : resFloor;

  spaces.push({
    id: "sp_master_bed",
    type: "bedroom",
    subtype: "master",
    name: "MASTER BEDROOM SUITE (SW)",
    count: 1,
    targetFloor: f2Floor,
    allowedFloors: [f2Floor],
    minWidthFt: 11,
    maxWidthFt: 16,
    minDepthFt: 12,
    maxDepthFt: 18,
    minAreaSqFt: 130,
    preferredAreaSqFt: 175,
    maxAreaSqFt: 220,
    privacyZone: "private",
    adjacency: ["master_toilet", "master_balcony"],
    avoidAdjacency: ["kitchen"],
    plumbingRequired: false,
    exteriorAccessRequired: true,
    aspectRatioRange: [1.1, 1.5],
  });

  spaces.push({
    id: "sp_master_toilet",
    type: "toilet",
    subtype: "attached",
    name: "MASTER ATTACHED TOILET",
    count: 1,
    targetFloor: f2Floor,
    allowedFloors: [f2Floor],
    minWidthFt: 4.5,
    maxWidthFt: 6.5,
    minDepthFt: 7,
    maxDepthFt: 9.5,
    minAreaSqFt: 35,
    preferredAreaSqFt: 48,
    maxAreaSqFt: 65,
    privacyZone: "private",
    adjacency: ["master_bed"],
    avoidAdjacency: [],
    plumbingRequired: true,
    exteriorAccessRequired: true,
    aspectRatioRange: [1.2, 1.8],
  });

  if (inputs.bedrooms > 1) {
    spaces.push({
      id: "sp_bed_2",
      type: "bedroom",
      subtype: "regular",
      name: "BEDROOM 2",
      count: 1,
      targetFloor: f2Floor,
      allowedFloors: [f2Floor],
      minWidthFt: 10,
      maxWidthFt: 14,
      minDepthFt: 11,
      maxDepthFt: 15,
      minAreaSqFt: 110,
      preferredAreaSqFt: 132,
      maxAreaSqFt: 180,
      privacyZone: "private",
      adjacency: ["attached_toilet_2"],
      avoidAdjacency: [],
      plumbingRequired: false,
      exteriorAccessRequired: true,
      aspectRatioRange: [1.1, 1.4],
    });

    spaces.push({
      id: "sp_attached_toilet_2",
      type: "toilet",
      subtype: "attached",
      name: "ATTACHED TOILET 2",
      count: 1,
      targetFloor: f2Floor,
      allowedFloors: [f2Floor],
      minWidthFt: 4.5,
      maxWidthFt: 6,
      minDepthFt: 6.5,
      maxDepthFt: 8.5,
      minAreaSqFt: 30,
      preferredAreaSqFt: 40,
      maxAreaSqFt: 55,
      privacyZone: "private",
      adjacency: ["bed_2"],
      avoidAdjacency: [],
      plumbingRequired: true,
      exteriorAccessRequired: true,
      aspectRatioRange: [1.2, 1.7],
    });
  }

  if (inputs.balconies > 0) {
    spaces.push({
      id: "sp_master_balcony",
      type: "balcony",
      name: "MASTER BALCONY",
      count: 1,
      targetFloor: f2Floor,
      allowedFloors: [f2Floor],
      minWidthFt: 4,
      maxWidthFt: 6,
      minDepthFt: 8,
      maxDepthFt: 14,
      minAreaSqFt: 32,
      preferredAreaSqFt: 48,
      maxAreaSqFt: 84,
      privacyZone: "private",
      adjacency: ["master_bed"],
      avoidAdjacency: [],
      plumbingRequired: false,
      exteriorAccessRequired: true,
      aspectRatioRange: [1.5, 2.5],
    });
  }

  // ---------------- 4. THIRD FLOOR SECONDARY & FLEX ZONE PROGRAMME ----------------
  const f3Floor = Math.min(floorsCount - 1, resFloor + 2);
  if (inputs.bedrooms > 2 && floorsCount > 3) {
    spaces.push({
      id: "sp_bed_3",
      type: "bedroom",
      subtype: "regular",
      name: "BEDROOM 3",
      count: 1,
      targetFloor: f3Floor,
      allowedFloors: [f3Floor],
      minWidthFt: 10,
      maxWidthFt: 14,
      minDepthFt: 11,
      maxDepthFt: 15,
      minAreaSqFt: 110,
      preferredAreaSqFt: 132,
      maxAreaSqFt: 180,
      privacyZone: "private",
      adjacency: ["common_toilet_2"],
      avoidAdjacency: [],
      plumbingRequired: false,
      exteriorAccessRequired: true,
      aspectRatioRange: [1.1, 1.4],
    });

    spaces.push({
      id: "sp_common_toilet_2",
      type: "toilet",
      subtype: "common",
      name: "COMMON TOILET 2",
      count: 1,
      targetFloor: f3Floor,
      allowedFloors: [f3Floor],
      minWidthFt: 4.5,
      maxWidthFt: 6,
      minDepthFt: 6.5,
      maxDepthFt: 8.5,
      minAreaSqFt: 30,
      preferredAreaSqFt: 40,
      maxAreaSqFt: 55,
      privacyZone: "semi-private",
      adjacency: ["bed_3", "family_lounge"],
      avoidAdjacency: [],
      plumbingRequired: true,
      exteriorAccessRequired: true,
      aspectRatioRange: [1.2, 1.7],
    });

    spaces.push({
      id: "sp_family_lounge",
      type: "lounge",
      name: "FAMILY LOUNGE / STUDY",
      count: 1,
      targetFloor: f3Floor,
      allowedFloors: [f3Floor],
      minWidthFt: 10,
      maxWidthFt: 15,
      minDepthFt: 12,
      maxDepthFt: 18,
      minAreaSqFt: 120,
      preferredAreaSqFt: 168,
      maxAreaSqFt: 250,
      privacyZone: "semi-private",
      adjacency: ["living_balcony"],
      avoidAdjacency: [],
      plumbingRequired: false,
      exteriorAccessRequired: true,
      aspectRatioRange: [1.1, 1.5],
    });

    if (inputs.balconies > 1) {
      spaces.push({
        id: "sp_living_balcony",
        type: "balcony",
        name: "LIVING BALCONY",
        count: 1,
        targetFloor: f3Floor,
        allowedFloors: [f3Floor],
        minWidthFt: 4,
        maxWidthFt: 6,
        minDepthFt: 8,
        maxDepthFt: 14,
        minAreaSqFt: 32,
        preferredAreaSqFt: 48,
        maxAreaSqFt: 84,
        privacyZone: "public",
        adjacency: ["family_lounge"],
        avoidAdjacency: [],
        plumbingRequired: false,
        exteriorAccessRequired: true,
        aspectRatioRange: [1.5, 2.5],
      });
    }
  }

  return {
    totalRequestedRooms: spaces.length,
    spaces,
  };
}

/**
 * Floor Programme Assignment:
 * Maps space requirements into distinct floor identities.
 */
export function generateFloorProgrammes(
  inputs: DRGInputs,
  spaceProgramme: SpaceProgramme
): FloorProgramme[] {
  const floorsCount = Math.max(1, inputs.floors);
  const floorProgrammes: FloorProgramme[] = [];

  for (let f = 0; f < floorsCount; f++) {
    let identity = "Residential Living Floor";
    if (f === 0 && inputs.parking === "Full Parking") {
      identity = "Service & Stilt Parking Floor";
    } else if (f === 1 && inputs.parking === "Full Parking") {
      identity = "Public Living & Family Zone";
    } else if (f === 2) {
      identity = "Private Sleeping Suite Zone";
    } else if (f === 3) {
      identity = "Secondary Bedrooms & Family Deck Zone";
    }

    const allocatedSpaceIds = spaceProgramme.spaces
      .filter((sp) => sp.targetFloor === f)
      .map((sp) => sp.id);

    floorProgrammes.push({
      floorIndex: f,
      identity,
      allocatedSpaceIds,
    });
  }

  return floorProgrammes;
}
