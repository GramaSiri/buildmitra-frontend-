export const PROJECTS_STORAGE_KEY = "buildmitraProjects";
const PROJECTS_MIGRATION_VERSION = "phase-1.1-v1";

export type BuildMitraUser = {
  userId?: string | number;
  id?: string | number;
  uniqueCode?: string;
  name?: string;
  role?: string;
};

const PROJECT_ARRAY_FIELDS = [
  "milestones",
  "inventory",
  "suppliers",
  "labour",
  "labourAttendance",
  "payments",
  "siteMedia",
  "extraWorks",
  "quotations"
];

export const DEFAULT_PROJECT_PERMISSIONS = {
  milestones: true,
  inventory: true,
  labour: true,
  siteMedia: true,
  payments: true,
  reports: true,
  quotations: true
};

const readArray = (key: string): any[] => {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export const normalizeProjectRecord = (project: any) => {
  const normalized = { ...(project || {}) };
  PROJECT_ARRAY_FIELDS.forEach((field) => {
    if (field === "siteMedia" && !Array.isArray(normalized[field]) && Array.isArray(normalized.media)) {
      normalized[field] = normalized.media;
    } else if (!Array.isArray(normalized[field])) {
      normalized[field] = [];
    }
  });
  normalized.permissions = {
    ...DEFAULT_PROJECT_PERMISSIONS,
    ...(normalized.permissions || {})
  };
  return normalized;
};

const projectKey = (project: any) =>
  String(project.projectUniqueId || project.projectId || project.id || "");

// Existing canonical records always win field-level conflicts. Legacy data can
// only fill missing projects and missing fields during its one migration pass.
const mergeWithExistingPriority = (existing: any[], incoming: any[]) => {
  const result = existing.map(normalizeProjectRecord);
  incoming.forEach((rawProject) => {
    const project = normalizeProjectRecord(rawProject);
    const key = projectKey(project);
    const index = result.findIndex((item) => projectKey(item) === key && key !== "");
    if (index >= 0) {
      result[index] = normalizeProjectRecord({ ...project, ...result[index] });
    } else {
      result.push(project);
    }
  });
  return result;
};

const migrationMarkerKey = (user: BuildMitraUser) => {
  const identity = user.userId ?? user.id ?? user.uniqueCode ?? "unknown";
  return `buildmitraProjectsMigration:${PROJECTS_MIGRATION_VERSION}:${user.role || "guest"}:${identity}`;
};

export const getLoggedInUser = (): BuildMitraUser | null => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("loggedInUser") || "null");
  } catch {
    return null;
  }
};

export const getAllProjects = (): any[] =>
  readArray(PROJECTS_STORAGE_KEY).map(normalizeProjectRecord);

export const migrateLegacyProjects = (user: BuildMitraUser | null): any[] => {
  if (typeof window === "undefined" || !user) return getAllProjects();

  const markerKey = migrationMarkerKey(user);
  if (localStorage.getItem(markerKey) === "complete") {
    return getAllProjects();
  }

  let canonical = getAllProjects();
  const sharedProjects = readArray("sharedProjects");
  const contractorProjects = readArray("contractorProjects");

  if (user.role === "contractor") {
    const contractorId = user.userId ?? user.id;
    const ownedLegacy = contractorProjects.map((project) => normalizeProjectRecord({
      ...project,
      contractorId: project.contractorId ?? contractorId,
      contractorName: project.contractorName || user.name || "",
      contractorCode: project.contractorCode || user.uniqueCode || ""
    }));

    const ownedKeys = new Set(ownedLegacy.map(projectKey).filter(Boolean));
    const matchingShared = sharedProjects
      .filter((project) => {
        if (project.contractorId != null) {
          return String(project.contractorId) === String(contractorId);
        }
        return ownedKeys.has(projectKey(project));
      })
      .map((project) => normalizeProjectRecord({
        ...project,
        contractorId: project.contractorId ?? contractorId,
        contractorName: project.contractorName || user.name || "",
        contractorCode: project.contractorCode || user.uniqueCode || ""
      }));

    const legacyForContractor = mergeWithExistingPriority(ownedLegacy, matchingShared);
    canonical = mergeWithExistingPriority(canonical, legacyForContractor);
  } else if (user.role === "buyer") {
    // Buyers never claim legacy records. Only already-linked projects migrate.
    const linkedShared = sharedProjects
      .filter((project) => project.buyerCode && project.contractorId != null)
      .map(normalizeProjectRecord);
    canonical = mergeWithExistingPriority(canonical, linkedShared);
  }

  canonical = canonical.map(normalizeProjectRecord);
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(canonical));
  localStorage.setItem(markerKey, "complete");
  return canonical;
};

export const saveProjectsForContractor = (
  contractorId: string | number,
  contractorProjects: any[]
) => {
  const allProjects = getAllProjects();
  const otherProjects = allProjects.filter(
    (project) => String(project.contractorId) !== String(contractorId)
  );
  const nextProjects = [
    ...otherProjects,
    ...contractorProjects.map(normalizeProjectRecord)
  ];
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(nextProjects));
  window.dispatchEvent(new Event("buildmitraProjectsUpdated"));
  return nextProjects;
};

export const saveProjectsForBuyer = (buyerCode: string, buyerProjects: any[]) => {
  const normalizedBuyerCode = String(buyerCode || "").toUpperCase();
  const otherProjects = getAllProjects().filter(
    (project) => String(project.buyerCode || "").toUpperCase() !== normalizedBuyerCode
  );
  const nextProjects = [...otherProjects, ...buyerProjects.map(normalizeProjectRecord)];
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(nextProjects));
  window.dispatchEvent(new Event("buildmitraProjectsUpdated"));
  return nextProjects;
};

export const findBuyerByCode = (buyerCode: string) => {
  const normalizedCode = buyerCode.trim().toUpperCase();
  return readArray("users").find(
    (user) => user.role === "buyer" && String(user.uniqueCode || "").toUpperCase() === normalizedCode
  );
};
