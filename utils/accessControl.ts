export type FeatureType =
  | "calculator_export"
  | "boq_export"
  | "drawing_export"
  | "learn_earn_export"
  | "marketplace_share"
  | "quotation_export";

export type PaymentInfo = {
  amount?: number;
  paymentMode?: string;
  status?: string;
  date?: string;
  transactionId?: string;
};

export type PaidUnlock = {
  userId: string;
  featureType: FeatureType;
  referenceCode: string;
  amount: number;
  date: string;
  status: "Paid";
  paymentMode: string;
  transactionId: string;
};

const UNLOCK_KEY = "bm_paid_unlocks";

function safeJson<T>(value: string | null, fallback: T): T {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function getCurrentUser(): any | null {
  if (typeof window === "undefined") return null;
  return (
    safeJson(localStorage.getItem("loggedInUser"), null) ||
    safeJson(localStorage.getItem("currentUser"), null) ||
    safeJson(localStorage.getItem("buildmitraUser"), null)
  );
}

export function getUserId(): string | null {
  const user = getCurrentUser();
  if (!user) return null;
  return String(user.userId || user.id || user.uniqueCode || user.email || user.mobile || user.name || "guest");
}

export function hasActiveSubscription(): boolean {
  if (typeof window === "undefined") return false;
  const user = getCurrentUser();
  const subscription = safeJson<any>(localStorage.getItem("buildmitraSubscription"), null);
  const userSubscription = safeJson<any>(localStorage.getItem("bm_active_subscription"), null);
  const now = Date.now();
  const validUntil = subscription?.validUntil || userSubscription?.validUntil || user?.subscriptionValidUntil;
  return Boolean(
    user?.subscriptionActive ||
      user?.isSubscribed ||
      subscription?.active ||
      userSubscription?.active ||
      (validUntil && new Date(validUntil).getTime() > now)
  );
}

export function getUnlockKey(featureType: FeatureType, referenceCode = "global"): string {
  return `${getUserId() || "anonymous"}::${featureType}::${referenceCode || "global"}`;
}

export function getPaidUnlocks(): Record<string, PaidUnlock> {
  if (typeof window === "undefined") return {};
  return safeJson<Record<string, PaidUnlock>>(localStorage.getItem(UNLOCK_KEY), {});
}

export function hasPaidUnlock(featureType: FeatureType, referenceCode = "global"): boolean {
  if (hasActiveSubscription()) return true;
  const userId = getUserId();
  if (!userId || typeof window === "undefined") return false;
  const unlocks = getPaidUnlocks();
  const exact = unlocks[getUnlockKey(featureType, referenceCode)];
  const global = unlocks[getUnlockKey(featureType, "global")];
  return exact?.status === "Paid" || global?.status === "Paid";
}

function appendLocalStorageArray(key: string, record: any) {
  const existing = safeJson<any[]>(localStorage.getItem(key), []);
  localStorage.setItem(key, JSON.stringify([record, ...existing].slice(0, 500)));
}

export function markPaidUnlock(featureType: FeatureType, referenceCode = "global", paymentInfo: PaymentInfo = {}): PaidUnlock {
  if (typeof window === "undefined") {
    throw new Error("Payment unlock can only be stored in browser localStorage.");
  }
  const userId = getUserId() || "anonymous";
  const amount = Number(paymentInfo.amount || defaultUnlockAmount(featureType));
  const record: PaidUnlock = {
    userId,
    featureType,
    referenceCode: referenceCode || "global",
    amount,
    date: paymentInfo.date || new Date().toISOString(),
    status: "Paid",
    paymentMode: paymentInfo.paymentMode || "UPI",
    transactionId: paymentInfo.transactionId || `BM-PAY-${Date.now()}`
  };
  const unlocks = getPaidUnlocks();
  unlocks[getUnlockKey(featureType, referenceCode)] = record;
  localStorage.setItem(UNLOCK_KEY, JSON.stringify(unlocks));
  appendLocalStorageArray("bm_payment_transactions", record);
  appendLocalStorageArray("adminTransactions", record);
  appendLocalStorageArray("buildmitraTransactions", record);
  return record;
}

export function requireUnlock(
  featureType: FeatureType,
  referenceCode: string | undefined,
  onAllowed: () => void,
  onBlocked: () => void
) {
  if (hasActiveSubscription() || hasPaidUnlock(featureType, referenceCode || "global")) {
    onAllowed();
    return true;
  }
  onBlocked();
  return false;
}

export function defaultUnlockAmount(featureType: FeatureType): number {
  switch (featureType) {
    case "drawing_export":
      return 199;
    case "boq_export":
      return 149;
    case "calculator_export":
      return 49;
    case "learn_earn_export":
      return 99;
    case "marketplace_share":
      return 29;
    case "quotation_export":
      return 99;
    default:
      return 99;
  }
}

export function featureLabel(featureType: FeatureType): string {
  return featureType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
