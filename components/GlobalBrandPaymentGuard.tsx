import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import BuildMitraLogo from "./BuildMitraLogo";

type PendingAction = {
  element: HTMLElement;
  eventType: string;
};

type ContextValue = {
  runProtectedAction: (action: () => void) => void;
  isUnlocked: boolean;
};

const ProtectedActionContext = createContext<ContextValue>({
  runProtectedAction: (action) => action(),
  isUnlocked: false
});

const PROTECTED_WORDS = [
  "download",
  "export",
  "pdf",
  "excel",
  "print",
  "share",
  "whatsapp",
  "generate",
  "boq",
  "drg",
  "report",
  "layout",
  "floor plan",
  "certificate",
  "letter",
  "quote",
  "estimate"
];

function readUser(): any {
  if (typeof window === "undefined") return {};

  const keys = [
    "currentUser",
    "loggedInUser",
    "user",
    "buildmitraUser"
  ];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);

      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed?.user || parsed;
      }
    } catch {
      // Ignore malformed legacy data.
    }
  }

  return {};
}

function hasActiveSubscription() {
  if (typeof window === "undefined") return false;

  const user = readUser();

  const role = String(user.role || "").toLowerCase();
  if (role === "admin" || user.isAdmin === true) return true;

  const status = String(
    user.subscriptionStatus ||
    user.paymentStatus ||
    user.planStatus ||
    ""
  ).toLowerCase();

  const activeBoolean =
    user.subscriptionActive === true ||
    user.isSubscribed === true ||
    user.paid === true;

  const activeStatus = [
    "active",
    "paid",
    "approved",
    "subscribed",
    "valid"
  ].includes(status);

  let expiryValid = false;
  const expiry =
    user.subscriptionExpiry ||
    user.subscriptionEndDate ||
    user.planExpiry;

  if (expiry) {
    const expiryTime = new Date(expiry).getTime();
    expiryValid = Number.isFinite(expiryTime) && expiryTime > Date.now();
  }

  return (
    activeBoolean ||
    activeStatus ||
    expiryValid
  );
}

function isProtectedElement(element: HTMLElement | null) {
  if (!element) return false;

  if (
    element.closest(
      '[data-payment-bypass="true"], [data-no-payment-barrier="true"]'
    )
  ) {
    return false;
  }

  const clickable = element.closest(
    "button, a, [role='button'], input[type='button'], input[type='submit']"
  ) as HTMLElement | null;

  if (!clickable) return false;

  if (clickable.dataset.protectedAction === "true") return true;

  const text = [
    clickable.innerText,
    clickable.textContent,
    clickable.getAttribute("aria-label"),
    clickable.getAttribute("title"),
    clickable.getAttribute("download"),
    clickable.getAttribute("href"),
    element.innerText,
    element.textContent
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return PROTECTED_WORDS.some((word) => text.includes(word));
}

export function useProtectedAction() {
  return useContext(ProtectedActionContext);
}

export default function GlobalBrandPaymentGuard({
  children
}: {
  children: React.ReactNode;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const pendingRef = useRef<PendingAction | null>(null);
  const bypassRef = useRef(false);
  const callbackRef = useRef<null | (() => void)>(null);

  const refreshSubscription = useCallback(() => {
    setUnlocked(hasActiveSubscription());
  }, []);

  useEffect(() => {
    // Clear legacy test bypass keys to ensure payment barrier is active
    try {
      localStorage.removeItem("buildmitra_export_unlock");
      sessionStorage.removeItem("buildmitra_session_unlocked");
    } catch {}

    refreshSubscription();

    window.addEventListener("storage", refreshSubscription);
    window.addEventListener(
      "buildmitra-subscription-updated",
      refreshSubscription
    );

    return () => {
      window.removeEventListener("storage", refreshSubscription);
      window.removeEventListener(
        "buildmitra-subscription-updated",
        refreshSubscription
      );
    };
  }, [refreshSubscription]);

  const runProtectedAction = useCallback(
    (action: () => void) => {
      if (hasActiveSubscription()) {
        action();
        return;
      }

      callbackRef.current = action;
      setModalOpen(true);
    },
    []
  );

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (bypassRef.current) {
        bypassRef.current = false;
        return;
      }

      const target = event.target as HTMLElement | null;

      if (!isProtectedElement(target)) return;

      if (hasActiveSubscription()) return;

      const element = target?.closest(
        "button, a, [role='button'], input[type='button'], input[type='submit']"
      ) as HTMLElement | null;

      if (!element) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      pendingRef.current = {
        element,
        eventType: "click"
      };

      setModalOpen(true);
    };

    document.addEventListener("click", handler, true);

    return () => {
      document.removeEventListener("click", handler, true);
    };
  }, []);

  function continuePendingAction() {
    setModalOpen(false);

    const callback = callbackRef.current;
    callbackRef.current = null;

    if (callback) {
      setTimeout(callback, 100);
      return;
    }

    const pending = pendingRef.current;
    pendingRef.current = null;

    if (pending?.element) {
      bypassRef.current = true;

      setTimeout(() => {
        pending.element.click();
      }, 100);
    }
  }

  function openSubscriptionPage() {
    const currentUrl =
      window.location.pathname +
      window.location.search;

    sessionStorage.setItem(
      "buildmitra_pending_return_url",
      currentUrl
    );

    window.location.href = "/subscription";
  }

  return (
    <ProtectedActionContext.Provider
      value={{
        runProtectedAction,
        isUnlocked: unlocked
      }}
    >
      {children}

      {modalOpen && (
        <div className="bm-payment-overlay">
          <div className="bm-payment-modal">
            {/* CLEAN POPUP HEADER (NO LOGO, JUST TITLE & CLOSE BUTTON) */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>
                💳 BuildMitra Subscription Required
              </h3>
              <button
                type="button"
                className="bm-close"
                onClick={() => {
                  pendingRef.current = null;
                  callbackRef.current = null;
                  setModalOpen(false);
                }}
              >
                ×
              </button>
            </div>

            {/* EYE-CATCHING QUOTE BANNER */}
            <div style={{ background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", color: "#ffffff", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "800", marginBottom: "12px", textAlign: "center", boxShadow: "0 2px 8px rgba(2, 132, 199, 0.25)" }}>
              🔥 Subscribe BuildMitra & Save Lakhs!
            </div>

            {/* FEATURED QR CODE BOX IN POPUP SCREEN */}
            <div className="bm-qr-box" style={{ marginBottom: "12px", padding: "12px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
              <img
                src="/qr-code.png"
                alt="Scan PhonePe UPI QR Code to Pay"
                style={{ width: "155px", height: "155px", objectFit: "contain", margin: "0 auto 6px", display: "block", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              />
              <div style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a" }}>UPI ID: 9731888377@ybl</div>
              <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Payee: Paint House / BuildMitra</div>
            </div>

            {/* INSPIRING BUSINESS GROWTH QUOTE BELOW QR CODE */}
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "9px 12px", borderRadius: "8px", fontSize: "11px", color: "#15803d", fontWeight: "700", marginBottom: "12px", textAlign: "center", lineHeight: "1.4" }}>
              🚀 "Upscale & 10X Your Construction Business with BuildMitra Real-Time BOQ & Materials Suite!"
            </div>

            {/* SUBSCRIPTION PLANS SELECTOR CARDS */}
            <div className="bm-plans" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "12px" }}>
              <div style={{ padding: "8px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#ffffff", textAlign: "center" }}>
                <strong style={{ fontSize: "12px", color: "#0f172a", display: "block" }}>Basic</strong>
                <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: "800" }}>₹250/mo</span>
              </div>
              <div style={{ padding: "8px", border: "1px solid #0284c7", borderRadius: "8px", background: "#f0f9ff", textAlign: "center" }}>
                <strong style={{ fontSize: "12px", color: "#0369a1", display: "block" }}>Pro</strong>
                <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: "800" }}>₹350/mo</span>
              </div>
              <div style={{ padding: "8px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#ffffff", textAlign: "center" }}>
                <strong style={{ fontSize: "12px", color: "#0f172a", display: "block" }}>Enterprise</strong>
                <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: "800" }}>₹450/mo</span>
              </div>
              <div style={{ padding: "8px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#ffffff", textAlign: "center" }}>
                <strong style={{ fontSize: "12px", color: "#0f172a", display: "block" }}>Single Unlock</strong>
                <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "800" }}>₹49</span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <button
              type="button"
              className="bm-paid"
              onClick={continuePendingAction}
            >
              ✓ I Have Paid / Continue
            </button>

            <button
              type="button"
              className="bm-subscribe"
              onClick={openSubscriptionPage}
            >
              View Subscription Plans →
            </button>

            <small style={{ marginTop: "6px", display: "block", color: "#94a3b8", fontSize: "10px" }}>
              Your inputs and generated report remain available.
            </small>
          </div>

          <style jsx>{`
            .bm-payment-overlay {
              position: fixed;
              z-index: 2147483647;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 14px;
              background: rgba(10, 24, 42, 0.75);
              backdrop-filter: blur(4px);
            }

            .bm-payment-modal {
              position: relative;
              width: min(390px, 94vw);
              padding: 16px 18px;
              border-radius: 16px;
              background: white;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
              text-align: left;
              max-height: 92vh;
              overflow-y: auto;
            }

            .bm-close {
              border: 0;
              background: transparent;
              font-size: 22px;
              font-weight: 700;
              color: #64748b;
              cursor: pointer;
              line-height: 1;
              padding: 2px 6px;
              border-radius: 4px;
            }

            .bm-close:hover {
              color: #0f172a;
              background: #f1f5f9;
            }

            .bm-subscribe,
            .bm-paid {
              width: 100%;
              padding: 10px 14px;
              border: 0;
              border-radius: 8px;
              font: inherit;
              font-size: 13px;
              font-weight: 800;
              cursor: pointer;
              transition: all 0.2s ease;
            }

            .bm-paid {
              margin-bottom: 8px;
              color: white;
              background: #16a34a;
              box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
            }

            .bm-paid:hover {
              background: #15803d;
            }

            .bm-subscribe {
              color: white;
              background: #0f172a;
            }

            .bm-subscribe:hover {
              background: #1e293b;
            }
          `}</style>
        </div>
      )}
    </ProtectedActionContext.Provider>
  );
}
