
export type FeatureType =
  | "calculator_export"
  | "boq_export"
  | "drawing_export"
  | "learn_earn_export"
  | "marketplace_share"
  | "quotation_export";
/* ============================================================
   BuildMitra — Access Control
   Central helper for checking paid unlocks, featured content,
   and feature permission by path or reference code.
   ============================================================ */

const PAID_KEY_PREFIX = "bm_paid";
const UNLOCK_KEY_PREFIX = "bm_unlock";

/**
 * Returns the localStorage key for a paid unlock.
 */
function paidKey(featureType: string, referenceCode: string): string {
  return `${PAID_KEY_PREFIX}_${featureType || "any"}_${referenceCode || "any"}`;
}

/**
 * Returns the localStorage key for a generic unlock.
 */
function unlockKey(featureType: string, referenceCode: string): string {
  return `${UNLOCK_KEY_PREFIX}_${featureType || "any"}_${referenceCode || "any"}`;
}

/**
 * Check if a specific feature + reference code has been paid/unlocked.
 * Returns true when the user has paid for this specific item.
 */
export function hasPaidUnlock(
  featureType: string,
  referenceCode: string
): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = paidKey(featureType, referenceCode);
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

/**
 * Mark a feature + reference code as paid.
 */
export function setPaidUnlock(
  featureType: string,
  referenceCode: string,
  paid: boolean = true
): void {
  if (typeof window === "undefined") return;
  try {
    const key = paidKey(featureType, referenceCode);
    if (paid) {
      localStorage.setItem(key, "true");
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

/**
 * Clear a paid unlock.
 */
export function clearPaidUnlock(
  featureType: string,
  referenceCode: string
): void {
  setPaidUnlock(featureType, referenceCode, false);
}

/**
 * Check generic unlock (used for non-payment gates).
 */
export function hasUnlock(
  featureType: string,
  referenceCode: string
): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = unlockKey(featureType, referenceCode);
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

/**
 * Set generic unlock.
 */
export function setUnlock(
  featureType: string,
  referenceCode: string,
  unlocked: boolean = true
): void {
  if (typeof window === "undefined") return;
  try {
    const key = unlockKey(featureType, referenceCode);
    if (unlocked) {
      localStorage.setItem(key, "true");
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

/**
 * Determine the feature type from a URL path.
 */
export function featureFromPath(
  pathname: string,
  fallback?: string
): string {
  if (!pathname) return fallback || "unknown";
  const clean = pathname.replace(/^\//, "").split("/")[0];
  return clean || fallback || "unknown";
}

/**
 * Determine the reference code from a URL path.
 * Example: /calculators/beam-design → "beam-design"
 */
export function referenceFromPage(pathname: string): string {
  if (!pathname) return "any";
  const parts = pathname.replace(/^\//, "").split("/");
  if (parts.length >= 2) return parts[1];
  return parts[0] || "any";
}

/**
 * Check if a given feature is unlocked for a path.
 */
export function isFeatureUnlocked(
  pathname: string,
  fallbackType?: string
): boolean {
  const type = featureFromPath(pathname, fallbackType);
  const code = referenceFromPage(pathname);
  return hasPaidUnlock(type, code) || hasUnlock(type, code);
}


/**
 * Compatibility helper used by PaymentBarrier.
 * Marks a feature/reference as paid and unlocked.
 */
export function markPaidUnlock(
  featureType: FeatureType,
  referenceCode: string
): void {
  setPaidUnlock(featureType, referenceCode, true);
}

/**
 * Compatibility helper used by PaymentBarrier.
 * Executes the requested action immediately when already unlocked.
 * Otherwise opens the payment barrier through onLocked.
 */
export function requireUnlock(
  featureType: FeatureType,
  referenceCode: string,
  onUnlocked: () => void,
  onLocked: () => void
): void {
  if (
    hasPaidUnlock(featureType, referenceCode) ||
    hasUnlock(featureType, referenceCode)
  ) {
    onUnlocked();
    return;
  }

  onLocked();
}
/**
 * Default export for flexible imports.
 */
export default {
  hasPaidUnlock,
  setPaidUnlock,
  clearPaidUnlock,
  hasUnlock,
  setUnlock,
  featureFromPath,
  referenceFromPage,
  isFeatureUnlocked
};

