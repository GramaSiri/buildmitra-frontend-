import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import PaymentBarrierModal from "../components/PaymentBarrierModal";
import {
  FeatureType,
  getUserId,
  hasPaidUnlock,
  markPaidUnlock,
  requireUnlock
} from "../utils/accessControl";

type BlockedFeature = {
  featureType: FeatureType;
  referenceCode: string;
  loginRequired?: boolean;
  callback?: () => void;
};

type PaymentBarrierContextValue = {
  isPaymentOpen: boolean;
  blockedFeature: BlockedFeature | null;
  checkAndRun: (featureType: FeatureType, referenceCode: string | undefined, callback: () => void) => void;
  closePayment: () => void;
  confirmPayment: () => void;
};

const PaymentBarrierContext = createContext<PaymentBarrierContextValue | null>(null);

function featureFromPath(pathname: string, text: string): FeatureType {
  const lower = `${pathname} ${text}`.toLowerCase();
  if (lower.includes("boq")) return "boq_export";
  if (lower.includes("drg") || lower.includes("drawing") || lower.includes("layout")) return "drawing_export";
  if (lower.includes("learn")) return "learn_earn_export";
  if (lower.includes("marketplace")) return "marketplace_share";
  if (lower.includes("quotation") || lower.includes("quote")) return "quotation_export";
  return "calculator_export";
}

function referenceFromPage(pathname: string): string {
  if (typeof window === "undefined") return pathname;
  const text = document.body?.innerText || "";
  const codeMatch = text.match(/\b(?:DRG|BOQ)-\d{8}-\d{6}\b/);
  return codeMatch?.[0] || pathname.replace(/^\//, "") || "global";
}

function isLockedActionText(text: string, pathname: string = "") {
  if (pathname.includes("contractor-dashboard") || pathname.includes("buyer-dashboard")) return false;
  const label = text.trim().toLowerCase();
  if (!label) return false;
  if (label.includes("permission") || label.includes("buyer & project code") || label.includes("geofence") || label.includes("attendance") || label.includes("labour")) return false;
  if (label.includes("generate drawing") || label.includes("generate boq") || label.includes("calculate") || label.includes("reset")) return false;
  if (label.includes("share with buyer") || label.includes("confirm share") || label.includes("buyer share") || label.includes("share permission")) return false;
  return /(export|download|pdf|excel|image|png|dxf|whatsapp|share|certificate)/i.test(label);
}

export function PaymentBarrierProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [blockedFeature, setBlockedFeature] = useState<BlockedFeature | null>(null);
  const pendingCallback = useRef<(() => void) | null>(null);

  const closePayment = useCallback(() => {
    pendingCallback.current = null;
    setBlockedFeature(null);
  }, []);

  const checkAndRun = useCallback((arg1: any, arg2?: any, arg3?: any) => {
    let featureType: FeatureType = "calculator_export";
    let referenceCode = "global";
    let callback: (() => void) | null = null;

    if (typeof arg1 === "function") {
      callback = arg1;
      featureType = featureFromPath(router.pathname, "");
      referenceCode = referenceFromPage(router.pathname);
    } else if (typeof arg3 === "function") {
      featureType = arg1;
      referenceCode = arg2 || referenceFromPage(router.pathname);
      callback = arg3;
    } else if (typeof arg2 === "function") {
      featureType = arg1;
      callback = arg2;
      referenceCode = referenceFromPage(router.pathname);
    }

    if (!callback) return;

    requireUnlock(
      featureType,
      referenceCode,
      callback,
      () => {
        pendingCallback.current = callback;
        setBlockedFeature({ featureType, referenceCode, callback: callback! });
      }
    );
  }, [router.pathname]);

  const confirmPayment = useCallback(() => {
    if (!blockedFeature) return;
    markPaidUnlock(blockedFeature.featureType, blockedFeature.referenceCode);
    const callback = pendingCallback.current || blockedFeature.callback;
    pendingCallback.current = null;
    setBlockedFeature(null);
    if (typeof callback === "function") {
      setTimeout(() => callback(), 100);
    }
  }, [blockedFeature]);

  const isExecutingRef = useRef(false);

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      if (isExecutingRef.current) return;
      const target = event.target as HTMLElement | null;
      const button = target?.closest?.("button, a") as HTMLElement | null;
      if (!button) return;
      const text = button.innerText || button.textContent || "";
      if (!isLockedActionText(text, router.pathname)) return;
      const featureType = featureFromPath(router.pathname, text);
      const referenceCode = referenceFromPage(router.pathname);
      if (hasPaidUnlock(featureType, referenceCode)) return;
      event.preventDefault();
      event.stopPropagation();
      if (typeof (event as any).stopImmediatePropagation === "function") (event as any).stopImmediatePropagation();
      checkAndRun(featureType, referenceCode, () => {
        isExecutingRef.current = true;
        button.click();
        setTimeout(() => {
          isExecutingRef.current = false;
        }, 300);
      });
    };
    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [checkAndRun, router.pathname]);

  const value = useMemo<PaymentBarrierContextValue>(() => ({
    isPaymentOpen: Boolean(blockedFeature),
    blockedFeature,
    checkAndRun,
    closePayment,
    confirmPayment
  }), [blockedFeature, checkAndRun, closePayment, confirmPayment]);

  return (
    <PaymentBarrierContext.Provider value={value}>
      {children}
      <PaymentBarrierModal
        open={Boolean(blockedFeature)}
        featureType={blockedFeature?.featureType}
        referenceCode={blockedFeature?.referenceCode}
        loginRequired={blockedFeature?.loginRequired}
        onCancel={closePayment}
        onConfirmPaid={confirmPayment}
      />
    </PaymentBarrierContext.Provider>
  );
}

export function usePaymentBarrier() {
  const context = useContext(PaymentBarrierContext);
  if (!context) {
    throw new Error("usePaymentBarrier must be used inside PaymentBarrierProvider");
  }
  return context;
}
