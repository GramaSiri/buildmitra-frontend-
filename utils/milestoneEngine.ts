export type MilestoneGenerationInput = {
  startDate: string;
  endDate: string;
  bua: number;
  floors: number;
  totalAmount: number;
};

type MilestoneDefinition = {
  name: string;
  category: string;
  description: string;
  baseDuration: number;
  paymentPercent: number;
};

const DEFINITIONS: MilestoneDefinition[] = [
  { name: "Site Cleaning / Site Clearing", category: "Pre-Construction", description: "Clear vegetation, debris and obstructions and prepare the site for setting out.", baseDuration: 2, paymentPercent: 1 },
  { name: "Temporary Site Setup", category: "Pre-Construction", description: "Install temporary fencing, storage, water, power and site safety facilities.", baseDuration: 3, paymentPercent: 0.5 },
  { name: "Soil Testing / Investigation", category: "Pre-Construction", description: "Complete soil investigation and establish foundation design parameters.", baseDuration: 4, paymentPercent: 1 },
  { name: "Survey and Marking", category: "Pre-Construction", description: "Set out building lines, grid lines, levels and reference benchmarks.", baseDuration: 2, paymentPercent: 0.5 },
  { name: "Excavation", category: "Foundation", description: "Excavate foundations to approved lines, levels and dimensions.", baseDuration: 7, paymentPercent: 3 },
  { name: "PCC Bed", category: "Foundation", description: "Lay plain cement concrete below foundations and footings.", baseDuration: 3, paymentPercent: 2 },
  { name: "Footing Reinforcement", category: "Foundation", description: "Cut, bend and place footing reinforcement with required cover.", baseDuration: 5, paymentPercent: 4 },
  { name: "Footing Concrete", category: "Foundation", description: "Place, compact and cure reinforced concrete footings.", baseDuration: 3, paymentPercent: 4 },
  { name: "Column Starter", category: "Foundation", description: "Cast column starters and align reinforcement for the substructure.", baseDuration: 2, paymentPercent: 2 },
  { name: "Plinth Beam", category: "Foundation", description: "Complete plinth beam reinforcement, shuttering and concreting.", baseDuration: 5, paymentPercent: 4 },
  { name: "Foundation Backfilling", category: "Foundation", description: "Backfill around foundations in compacted layers to plinth level.", baseDuration: 4, paymentPercent: 2 },
  { name: "Ground Floor Columns", category: "Structure", description: "Complete ground-floor column reinforcement, formwork and concrete.", baseDuration: 7, paymentPercent: 5 },
  { name: "Ground Floor Slab Shuttering", category: "Structure", description: "Erect and level slab and beam formwork with supports.", baseDuration: 8, paymentPercent: 4 },
  { name: "Ground Floor Slab Steel", category: "Structure", description: "Place beam and slab reinforcement and embedded services.", baseDuration: 7, paymentPercent: 5 },
  { name: "Ground Floor Slab Concrete", category: "Structure", description: "Pour, compact, finish and cure ground-floor slab concrete.", baseDuration: 3, paymentPercent: 5 },
  { name: "First Floor / Typical Floor Columns", category: "Structure", description: "Complete upper or typical floor columns for the planned floors.", baseDuration: 8, paymentPercent: 5 },
  { name: "First Floor / Typical Floor Slab", category: "Structure", description: "Complete upper or typical floor beams and slab construction.", baseDuration: 12, paymentPercent: 7 },
  { name: "Staircase Work", category: "Structure", description: "Complete staircase reinforcement, shuttering, concreting and curing.", baseDuration: 7, paymentPercent: 3 },
  { name: "Brick / Block Masonry", category: "Masonry", description: "Build internal and external masonry walls including lintel interfaces.", baseDuration: 14, paymentPercent: 7 },
  { name: "Electrical Concealed Conduits", category: "MEP", description: "Install concealed electrical conduits, boxes and sleeves.", baseDuration: 5, paymentPercent: 2 },
  { name: "Plumbing Concealed Lines", category: "MEP", description: "Install concealed water, waste and vent lines and pressure test them.", baseDuration: 5, paymentPercent: 2 },
  { name: "Internal Plastering", category: "Plastering", description: "Complete internal wall and ceiling plaster to approved finish.", baseDuration: 12, paymentPercent: 5 },
  { name: "External Plastering", category: "Plastering", description: "Complete weather-resistant external plaster and façade preparation.", baseDuration: 8, paymentPercent: 3 },
  { name: "Waterproofing", category: "Waterproofing", description: "Waterproof wet areas, terraces and other specified locations and test them.", baseDuration: 7, paymentPercent: 3 },
  { name: "Flooring", category: "Finishing", description: "Install floor finishes, skirting and associated base preparation.", baseDuration: 12, paymentPercent: 6 },
  { name: "Doors and Windows", category: "Finishing", description: "Install frames, shutters, glazing, hardware and sealants.", baseDuration: 10, paymentPercent: 4 },
  { name: "Painting / Finishing", category: "Finishing", description: "Complete putty, primer, paint and final architectural finishes.", baseDuration: 12, paymentPercent: 5 },
  { name: "Electrical and Plumbing Fixtures", category: "MEP", description: "Install and test final electrical and plumbing fixtures.", baseDuration: 5, paymentPercent: 3 },
  { name: "Final Cleaning and Snag Correction", category: "Handover", description: "Deep clean the project and close inspection and snag-list items.", baseDuration: 5, paymentPercent: 1 },
  { name: "Handover", category: "Handover", description: "Complete final documentation, keys, demonstrations and owner handover.", baseDuration: 2, paymentPercent: 1 }
];

const parseDate = (value: string) => new Date(`${value}T00:00:00Z`);
const formatDate = (date: Date) => date.toISOString().split("T")[0];
const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const categoryFactor = (category: string, bua: number, floors: number) => {
  const scalable = ["Foundation", "Structure", "Masonry", "Plastering", "Finishing", "MEP"];
  if (!scalable.includes(category)) return 1;
  const sizeFactor = bua < 1500 ? 0.82 : bua > 5000 ? 1.3 : bua > 3000 ? 1.15 : 1;
  const extraFloors = Math.max(0, floors - 1);
  const floorFactor = category === "Structure"
    ? 1 + extraFloors * 0.14
    : 1 + extraFloors * 0.06;
  return sizeFactor * floorFactor;
};

const allocateDurations = (input: MilestoneGenerationInput) => {
  const start = parseDate(input.startDate);
  const end = parseDate(input.endDate);
  const dateRangeDays = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
  const scheduleDays = Math.max(DEFINITIONS.length, dateRangeDays);
  const weights = DEFINITIONS.map((definition) =>
    definition.baseDuration * categoryFactor(definition.category, input.bua, input.floors)
  );
  const totalWeight = weights.reduce((sum, value) => sum + value, 0);
  const raw = weights.map((value) => value / totalWeight * scheduleDays);
  const allocated = raw.map((value) => Math.max(1, Math.floor(value)));
  let difference = scheduleDays - allocated.reduce((sum, value) => sum + value, 0);
  const addOrder = raw.map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  let cursor = 0;
  while (difference > 0) {
    allocated[addOrder[cursor % addOrder.length].index] += 1;
    difference -= 1;
    cursor += 1;
  }
  const removeOrder = [...addOrder].reverse();
  cursor = 0;
  while (difference < 0) {
    const index = removeOrder[cursor % removeOrder.length].index;
    if (allocated[index] > 1) {
      allocated[index] -= 1;
      difference += 1;
    }
    cursor += 1;
  }
  return allocated;
};

export const getMilestonePaymentPercentTotal = () =>
  Number(DEFINITIONS.reduce((sum, item) => sum + item.paymentPercent, 0).toFixed(2));

export const generateCivilMilestones = (input: MilestoneGenerationInput) => {
  if (!input.startDate || !input.endDate) throw new Error("Project start and end dates are required");
  if (parseDate(input.endDate) < parseDate(input.startDate)) throw new Error("Project end date cannot be before start date");
  if (getMilestonePaymentPercentTotal() !== 100) throw new Error("Milestone payment percentages must total 100%");

  const durations = allocateDurations(input);
  let currentDate = parseDate(input.startDate);
  let allocatedAmount = 0;

  return DEFINITIONS.map((definition, index) => {
    const durationDays = durations[index];
    const startDate = formatDate(currentDate);
    const endDate = formatDate(addDays(currentDate, durationDays - 1));
    currentDate = addDays(currentDate, durationDays);
    const amount = index === DEFINITIONS.length - 1
      ? Number((input.totalAmount - allocatedAmount).toFixed(2))
      : Number((input.totalAmount * definition.paymentPercent / 100).toFixed(2));
    allocatedAmount += amount;

    return {
      id: `MS-${String(index + 1).padStart(2, "0")}`,
      name: definition.name,
      category: definition.category,
      description: definition.description,
      startDate,
      endDate,
      durationDays,
      paymentPercent: definition.paymentPercent,
      amount,
      status: "Pending",
      contractorCompleted: false,
      completionDate: null,
      ownerApproved: false,
      ownerRejected: false,
      ownerApprovalDate: null,
      ownerRejectionDate: null,
      invoiceRaised: false,
      invoiceDate: null,
      invoiceAmount: 0,
      paymentStatus: "Not Due",
      paidDate: null,
      remarks: ""
    };
  });
};

export const CIVIL_MILESTONE_NAMES = DEFINITIONS.map((item) => item.name);
