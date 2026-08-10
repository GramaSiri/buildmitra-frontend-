import {
  RealEstateProject,
  InventoryUnit,
  MediaDrawing,
  calculateUnitCommission,
} from "../../utils/affiliate/commissionEngine";

export function createNewProjectHelper(
  newProject: any,
  projects: RealEstateProject[]
): { created: RealEstateProject; updated: RealEstateProject[] } {
  const created: RealEstateProject = {
    ...newProject,
    id: "proj-" + Date.now(),
    status: "Active",
    mediaDrawings: [],
    inventory: [],
    offers: [],
    createdAt: new Date().toISOString().split("T")[0],
  };
  return { created, updated: [created, ...projects] };
}

export function createNewUnitHelper(
  newUnit: any,
  selectedProject: RealEstateProject,
  projects: RealEstateProject[]
): { createdUnit: InventoryUnit; updatedProjects: RealEstateProject[] } {
  const totalCost = newUnit.areaSqFt * newUnit.baseRatePerSqFt;
  const calcComm = calculateUnitCommission(
    {
      totalUnitCost: totalCost,
      negotiatedCommissionType: newUnit.negotiatedCommissionType,
      negotiatedCommissionValue: newUnit.negotiatedCommissionValue,
      negotiatedMarginDiff: newUnit.negotiatedMarginDiff,
    },
    totalCost
  );

  const createdUnit: InventoryUnit = {
    ...newUnit,
    id: "unit-" + Date.now(),
    totalUnitCost: totalCost,
    calculatedCommission: calcComm,
  };

  const updatedProjects = projects.map((p) => {
    if (p.id === selectedProject.id) {
      return {
        ...p,
        inventory: [...(p.inventory || []), createdUnit],
        totalUnits: (p.inventory || []).length + 1,
      };
    }
    return p;
  });

  return { createdUnit, updatedProjects };
}

export function toggleUnitStatusHelper(
  unitId: string,
  newStatus: string,
  selectedProject: RealEstateProject,
  projects: RealEstateProject[]
): RealEstateProject[] {
  return projects.map((p) => {
    if (p.id === selectedProject.id) {
      const updatedInventory = (p.inventory || []).map((u) => {
        if (u.id === unitId) {
          return { ...u, status: newStatus as any };
        }
        return u;
      });
      return { ...p, inventory: updatedInventory };
    }
    return p;
  });
}

export function addMediaHelper(
  newMedia: any,
  selectedProject: RealEstateProject,
  projects: RealEstateProject[]
): { createdMedia: MediaDrawing; updatedProjects: RealEstateProject[] } {
  const createdMedia: MediaDrawing = {
    ...newMedia,
    id: "media-" + Date.now(),
  };

  const updatedProjects = projects.map((p) => {
    if (p.id === selectedProject.id) {
      return {
        ...p,
        mediaDrawings: [...(p.mediaDrawings || []), createdMedia],
      };
    }
    return p;
  });

  return { createdMedia, updatedProjects };
}
