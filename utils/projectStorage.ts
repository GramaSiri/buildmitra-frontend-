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
  projectSummary: true,
  milestones: true,
  inventory: true,
  labour: true,
  siteMedia: true,
  payments: true,
  reports: true,
  quotations: true
};

export const PRIVATE_PROJECT_PERMISSIONS = {
  projectSummary: false,
  milestones: false,
  inventory: false,
  labour: false,
  siteMedia: false,
  payments: false,
  reports: false,
  quotations: false
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

const normalizeMediaRecord = (media: any, projectId: string) => {
  const metadata = media || {};
  const uploadDate = metadata.uploadDate || metadata.date || new Date().toISOString();
  const description = metadata.description || metadata.title || "";
  const mediaType = metadata.mediaType || metadata.type || metadata.category || "document";
  return {
    id: metadata.id || `MEDIA-${Date.now()}`,
    fileName: metadata.fileName || metadata.title || "Site media",
    fileSize: Number(metadata.fileSize || 0),
    fileType: metadata.fileType || metadata.mimeType || "",
    uploadDate,
    description,
    mediaType,
    projectId: metadata.projectId || projectId,
    // Lightweight compatibility fields used by the existing galleries and invoice list.
    type: mediaType,
    title: description || metadata.fileName || "Site media",
    category: metadata.category || (mediaType === "document" ? "document" : "progress"),
    date: String(uploadDate).split("T")[0],
    uploadedBy: metadata.uploadedBy || "Contractor",
    milestoneName: metadata.milestoneName,
    amount: metadata.amount
  };
};

const compactLegacyMediaPayloads = () => {
  ["sharedProjects", "contractorProjects"].forEach((key) => {
    const projects = readArray(key);
    if (!projects.length) return;
    const compacted = projects.map((project) => {
      const projectId = String(project?.projectUniqueId || project?.projectId || project?.id || "");
      const sourceMedia = Array.isArray(project?.siteMedia) ? project.siteMedia : Array.isArray(project?.media) ? project.media : [];
      return {
        ...project,
        siteMedia: sourceMedia.map((media: any) => normalizeMediaRecord(media, projectId)),
        media: undefined
      };
    });
    try {
      localStorage.setItem(key, JSON.stringify(compacted));
    } catch {}
  });
};

const saveCanonicalProjects = (projects: any[]) => {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    window.dispatchEvent(new Event("buildmitraProjectsUpdated"));
    return true;
  } catch (error) {
    compactLegacyMediaPayloads();
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
      window.dispatchEvent(new Event("buildmitraProjectsUpdated"));
      return true;
    } catch (retryError) {
      console.error("BuildMitra project save failed", retryError || error);
      window.alert("Unable to save project updates because browser storage is full. Site files are saved as metadata only; please remove old browser data or try again.");
      window.dispatchEvent(new CustomEvent("buildmitraProjectsSaveFailed"));
      return false;
    }
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
  const normalizedProjectId = String(normalized.projectUniqueId || normalized.projectId || normalized.id || "");
  normalized.siteMedia = normalized.siteMedia.map((media: any) => normalizeMediaRecord(media, normalizedProjectId));
  const hasBuyerCode = Boolean(String(normalized.buyerCode || "").trim());
  const isLegacyBuyerLink = normalized.sharedWithBuyer == null && hasBuyerCode;
  normalized.sharedWithBuyer = normalized.sharedWithBuyer === true || isLegacyBuyerLink;
  normalized.permissions = !normalized.sharedWithBuyer
    ? { ...PRIVATE_PROJECT_PERMISSIONS }
    : isLegacyBuyerLink
      ? { ...DEFAULT_PROJECT_PERMISSIONS, ...(normalized.permissions || {}) }
      : { ...PRIVATE_PROJECT_PERMISSIONS, ...(normalized.permissions || {}) };
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

  compactLegacyMediaPayloads();

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
  if (saveCanonicalProjects(canonical)) {
    try {
      localStorage.setItem(markerKey, "complete");
    } catch {}
  }
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
  saveCanonicalProjects(nextProjects);
  return nextProjects;
};

export const saveProjectsForBuyer = (buyerCode: string, buyerProjects: any[]) => {
  const normalizedBuyerCode = String(buyerCode || "").toUpperCase();
  const otherProjects = getAllProjects().filter(
    (project) => String(project.buyerCode || "").toUpperCase() !== normalizedBuyerCode
  );
  const nextProjects = [...otherProjects, ...buyerProjects.map(normalizeProjectRecord)];
  saveCanonicalProjects(nextProjects);
  return nextProjects;
};

export const findBuyerByCode = (buyerCode: string) => {
  const normalizedCode = buyerCode.trim().toUpperCase();
  return readArray("users").find(
    (user) => user.role === "buyer" && String(user.uniqueCode || "").toUpperCase() === normalizedCode
  );
};
