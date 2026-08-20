export type ProfessionalFloorPlanBatch = {
  id: string;
  sheet: string;

  plotWidth: number;
  plotLength: number;

  title: string;

  supportedFacings: (
    | "East"
    | "West"
    | "North"
    | "South"
  )[];

  supportedFloorModes: (
    | "GF"
    | "G+1"
    | "G+2"
  )[];

  houseType:
    | "Independent"
    | "Duplex"
    | "Mixed";

  notes?: string;
};


export const PROFESSIONAL_FLOOR_PLAN_BATCHES:
  ProfessionalFloorPlanBatch[] = [

  {
    id: "BMF-BATCH-2030",
    sheet: "/floor-plan-library/batches/sheet-01.png",
    plotWidth: 20,
    plotLength: 30,
    title: "20×30 Professional Floor Plans",
    supportedFacings: ["East","West","North","South"],
    supportedFloorModes: ["GF","G+1","G+2"],
    houseType: "Independent"
  },

  {
    id: "BMF-BATCH-2040",
    sheet: "/floor-plan-library/batches/sheet-02.png",
    plotWidth: 20,
    plotLength: 40,
    title: "20×40 Professional Floor Plans",
    supportedFacings: ["East","West","North","South"],
    supportedFloorModes: ["GF","G+1","G+2"],
    houseType: "Independent"
  },

  {
    id: "BMF-BATCH-2050",
    sheet: "/floor-plan-library/batches/sheet-03.png",
    plotWidth: 20,
    plotLength: 50,
    title: "20×50 Professional Floor Plans",
    supportedFacings: ["East","West","North","South"],
    supportedFloorModes: ["GF","G+1","G+2"],
    houseType: "Independent"
  },

  {
    id: "BMF-BATCH-2060",
    sheet: "/floor-plan-library/batches/sheet-04.png",
    plotWidth: 20,
    plotLength: 60,
    title: "20×60 Professional Floor Plans",
    supportedFacings: ["East","West","North","South"],
    supportedFloorModes: ["GF","G+1","G+2"],
    houseType: "Independent"
  },

  {
    id: "BMF-BATCH-2080",
    sheet: "/floor-plan-library/batches/sheet-05.png",
    plotWidth: 20,
    plotLength: 80,
    title: "20×80 Professional Floor Plans",
    supportedFacings: ["East","West","North","South"],
    supportedFloorModes: ["GF","G+1","G+2"],
    houseType: "Independent"
  },

  {
    id: "BMF-BATCH-2030-LARGE",
    sheet: "/floor-plan-library/batches/sheet-06.png",
    plotWidth: 20,
    plotLength: 30,
    title: "20×30 Expanded Professional Floor Plans",
    supportedFacings: ["East","West","North","South"],
    supportedFloorModes: ["GF","G+1","G+2"],
    houseType: "Mixed"
  },

  {
    id: "BMF-BATCH-2540",
    sheet: "/floor-plan-library/batches/sheet-08.png",
    plotWidth: 25,
    plotLength: 40,
    title: "25×40 Professional Floor Plans",
    supportedFacings: ["East","West","North","South"],
    supportedFloorModes: ["GF","G+1","G+2"],
    houseType: "Independent"
  },

  {
    id: "BMF-BATCH-3040",
    sheet: "/floor-plan-library/batches/sheet-09.png",
    plotWidth: 30,
    plotLength: 40,
    title: "30×40 Professional Floor Plans",
    supportedFacings: ["East","West","North","South"],
    supportedFloorModes: ["GF","G+1","G+2"],
    houseType: "Independent"
  },

  {
    id: "BMF-BATCH-3050",
    sheet: "/floor-plan-library/batches/sheet-10.png",
    plotWidth: 30,
    plotLength: 50,
    title: "30×50 Professional Floor Plans",
    supportedFacings: ["East","West","North","South"],
    supportedFloorModes: ["GF","G+1","G+2"],
    houseType: "Independent"
  },

  {
    id: "BMF-BATCH-3060",
    sheet: "/floor-plan-library/batches/sheet-11.png",
    plotWidth: 30,
    plotLength: 60,
    title: "30×60 Professional Floor Plans",
    supportedFacings: ["East","West","North","South"],
    supportedFloorModes: ["GF","G+1","G+2"],
    houseType: "Independent"
  },

  {
    id: "BMF-BATCH-4040",
    sheet: "/floor-plan-library/batches/sheet-12.png",
    plotWidth: 40,
    plotLength: 40,
    title: "40×40 Professional Floor Plans",
    supportedFacings: ["East","West","North","South"],
    supportedFloorModes: ["GF","G+1","G+2"],
    houseType: "Independent"
  },

  {
    id: "BMF-BATCH-4050",
    sheet: "/floor-plan-library/batches/sheet-13.png",
    plotWidth: 40,
    plotLength: 50,
    title: "40×50 Professional Floor Plans",
    supportedFacings: ["East","West","North","South"],
    supportedFloorModes: ["GF","G+1","G+2"],
    houseType: "Independent"
  },

  {
    id: "BMF-BATCH-5060",
    sheet: "/floor-plan-library/batches/sheet-14.png",
    plotWidth: 50,
    plotLength: 60,
    title: "50×60 Professional Floor Plans",
    supportedFacings: ["East","West","North","South"],
    supportedFloorModes: ["GF","G+1","G+2"],
    houseType: "Independent"
  },

  {
    id: "BMF-BATCH-6080",
    sheet: "/floor-plan-library/batches/sheet-15.png",
    plotWidth: 60,
    plotLength: 80,
    title: "60×80 Professional Floor Plans",
    supportedFacings: ["East","West","North","South"],
    supportedFloorModes: ["GF","G+1","G+2"],
    houseType: "Independent"
  },

  {
    id: "BMF-BATCH-7090",
    sheet: "/floor-plan-library/batches/sheet-16.png",
    plotWidth: 70,
    plotLength: 90,
    title: "70×90 Professional Floor Plans",
    supportedFacings: ["East","West","North","South"],
    supportedFloorModes: ["GF","G+1","G+2"],
    houseType: "Independent"
  },

  {
    id: "BMF-DUPLEX-2030",
    sheet: "/floor-plan-library/batches/sheet-17.png",
    plotWidth: 20,
    plotLength: 30,
    title: "20×30 Duplex House Plans",
    supportedFacings: ["East","West","North","South"],
    supportedFloorModes: ["GF","G+1","G+2"],
    houseType: "Duplex"
  },

  {
    id: "BMF-DUPLEX-2540",
    sheet: "/floor-plan-library/batches/sheet-18.png",
    plotWidth: 25,
    plotLength: 40,
    title: "25×40 Duplex House Plans",
    supportedFacings: ["East","West","North","South"],
    supportedFloorModes: ["GF","G+1","G+2"],
    houseType: "Duplex"
  },

  {
    id: "BMF-DUPLEX-3050",
    sheet: "/floor-plan-library/batches/sheet-19.png",
    plotWidth: 30,
    plotLength: 50,
    title: "30×50 Duplex House Plans",
    supportedFacings: ["East","West","North","South"],
    supportedFloorModes: ["GF","G+1","G+2"],
    houseType: "Duplex"
  }

];


export function findProfessionalBatch(
  plotWidth: number,
  plotLength: number,
  buildingType?: string
) {

  const w = Number(plotWidth);
  const l = Number(plotLength);

  const duplex =
    String(buildingType || "")
      .toLowerCase()
      .includes("duplex");

  const exact =
    PROFESSIONAL_FLOOR_PLAN_BATCHES.find(
      batch =>
        batch.plotWidth === w &&
        batch.plotLength === l &&
        (
          duplex
            ? batch.houseType === "Duplex"
            : batch.houseType !== "Duplex"
        )
    );

  if (exact) {
    return exact;
  }


  // Closest aspect/size fallback.
  const candidates =
    PROFESSIONAL_FLOOR_PLAN_BATCHES.filter(
      batch =>
        duplex
          ? batch.houseType === "Duplex"
          : batch.houseType !== "Duplex"
    );


  return [...candidates]
    .sort((a,b) => {

      const aScore =
        Math.abs(a.plotWidth - w) +
        Math.abs(a.plotLength - l) +
        Math.abs(
          (a.plotWidth / a.plotLength) -
          (w / l)
        ) * 10;

      const bScore =
        Math.abs(b.plotWidth - w) +
        Math.abs(b.plotLength - l) +
        Math.abs(
          (b.plotWidth / b.plotLength) -
          (w / l)
        ) * 10;

      return aScore - bScore;

    })[0] || null;
}
