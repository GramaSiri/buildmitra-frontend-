// BuildMitra Audit Logging Engine
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
}

const STORAGE_KEY = "buildmitra_audit_logs";

export function logAuditAction(action: string, module: string, details: string): AuditLogEntry {
  let userId = "GUEST";
  let userRole = "CONTRACTOR";

  if (typeof window !== "undefined") {
    userId = sessionStorage.getItem("uniqueCode") || sessionStorage.getItem("userName") || "USER-" + Math.floor(1000 + Math.random() * 9000);
    userRole = sessionStorage.getItem("userRole") || "CONTRACTOR";
  }

  const entry: AuditLogEntry = {
    id: "LOG-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    userId,
    userRole,
    action,
    module,
    details,
    ipAddress: "127.0.0.1 (Client Verified)"
  };

  if (typeof window !== "undefined") {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      existing.unshift(entry);
      // Keep last 100 audit logs
      const trimmed = existing.slice(0, 100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (err) {
      console.warn("Could not save audit log locally", err);
    }
  }

  return entry;
}

export function getAuditLogs(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearAuditLogs(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
