import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

type PaymentBarrierContextValue = {
  runProtectedAction: (action: () => void) => void;
};

const PaymentBarrierContext =
  createContext<PaymentBarrierContextValue>({
    runProtectedAction: (action) => action()
  });

const ACTION_KEYWORDS = [
  "download",
  "export",
  "pdf",
  "excel",
  "xlsx",
  "xls",
  "csv",
  "print",
  "share",
  "whatsapp",
  "save report",
  "save file",
  "generate report",
  "generate boq",
  "generate drg",
  "generate drawing",
  "generate layout",
  "floor plan",
  "quotation",
  "estimate",
  "certificate",
  "letter"
];

const FILE_PATTERN =
  /\.(pdf|xlsx|xls|csv|doc|docx|zip|png|jpg|jpeg|svg)$/i;

function readCurrentUser(): any {
  if (typeof window === "undefined") return {};

  const keys = [
    "loggedInUser",
    "currentUser",
    "user",
    "buildmitraUser"
  ];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) continue;

      const parsed = JSON.parse(raw);
      return parsed?.user || parsed;
    } catch {
      // Ignore invalid old session values.
    }
  }

  return {};
}

function hasActiveSubscription(): boolean {
  if (typeof window === "undefined") return false;

  const user = readCurrentUser();
  const role = String(user?.role || "").toLowerCase();

  if (role === "admin" || user?.isAdmin === true) {
    return true;
  }

  const status = String(
    user?.subscriptionStatus ||
    user?.paymentStatus ||
    user?.planStatus ||
    user?.subscription?.status ||
    ""
  ).toLowerCase();

  const activeFlag =
    user?.subscriptionActive === true ||
    user?.isSubscribed === true ||
    user?.paid === true ||
    user?.subscription?.active === true;

  const activeStatus = [
    "active",
    "paid",
    "approved",
    "subscribed",
    "valid"
  ].includes(status);

  const expiry =
    user?.subscriptionExpiry ||
    user?.subscriptionEndDate ||
    user?.planExpiry ||
    user?.subscription?.expiry;

  let validExpiry = false;

  if (expiry) {
    const expiryTime = new Date(expiry).getTime();

    validExpiry =
      Number.isFinite(expiryTime) &&
      expiryTime > Date.now();
  }

  return activeFlag || activeStatus || validExpiry;
}

function getClickable(target: HTMLElement | null) {
  return target?.closest(
    "button, a, [role='button'], input[type='button'], input[type='submit']"
  ) as HTMLElement | null;
}

function shouldProtect(element: HTMLElement | null): boolean {
  if (!element) return false;

  if (
    element.closest(
      '[data-payment-bypass="true"],' +
      '[data-no-payment-barrier="true"],' +
      ".bm-payment-modal"
    )
  ) {
    return false;
  }

  if (element.dataset.protectedAction === "true") {
    return true;
  }

  const anchor = element as HTMLAnchorElement;

  if (anchor.hasAttribute?.("download")) return true;

  if (
    String(anchor.href || "").startsWith("blob:") ||
    String(anchor.href || "").startsWith("data:") ||
    FILE_PATTERN.test(String(anchor.href || ""))
  ) {
    return true;
  }

  const text = [
    element.innerText,
    element.textContent,
    element.getAttribute("aria-label"),
    element.getAttribute("title"),
    element.getAttribute("download"),
    element.getAttribute("href"),
    element.getAttribute("class"),
    element.getAttribute("id")
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return ACTION_KEYWORDS.some((keyword) =>
    text.includes(keyword)
  );
}

export function useBuildMitraPaymentBarrier() {
  return useContext(PaymentBarrierContext);
}

export default function BuildMitraPaymentBarrier({
  children
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const pendingAction = useRef<null | (() => void)>(null);
  const bypassNextAction = useRef(false);

  const requestAction = useCallback((action: () => void) => {
    if (bypassNextAction.current) {
      bypassNextAction.current = false;
      action();
      return;
    }

    if (hasActiveSubscription()) {
      action();
      return;
    }

    pendingAction.current = action;
    setOpen(true);
  }, []);

  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      const clickable = getClickable(
        event.target as HTMLElement | null
      );

      if (!shouldProtect(clickable)) return;

      if (bypassNextAction.current) {
        bypassNextAction.current = false;
        return;
      }

      if (hasActiveSubscription()) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      pendingAction.current = () => {
        bypassNextAction.current = true;
        clickable?.click();
      };

      setOpen(true);
    };

    document.addEventListener("click", clickHandler, true);

    return () => {
      document.removeEventListener(
        "click",
        clickHandler,
        true
      );
    };
  }, []);

  useEffect(() => {
    const originalPrint = window.print.bind(window);

    window.print = () => {
      requestAction(originalPrint);
    };

    const originalAnchorClick =
      HTMLAnchorElement.prototype.click;

    HTMLAnchorElement.prototype.click = function () {
      const anchor = this;

      const isDownload =
        anchor.hasAttribute("download") ||
        anchor.href.startsWith("blob:") ||
        anchor.href.startsWith("data:") ||
        FILE_PATTERN.test(anchor.href || "");

      if (
        isDownload &&
        !anchor.closest('[data-payment-bypass="true"]')
      ) {
        requestAction(() => {
          bypassNextAction.current = true;
          originalAnchorClick.call(anchor);
        });

        return;
      }

      originalAnchorClick.call(anchor);
    };

    const originalShare =
      typeof navigator.share === "function"
        ? navigator.share.bind(navigator)
        : null;

    if (originalShare) {
      try {
        navigator.share = ((data?: ShareData) =>
          new Promise<void>((resolve, reject) => {
            requestAction(() => {
              originalShare(data || {})
                .then(resolve)
                .catch(reject);
            });
          })) as typeof navigator.share;
      } catch {
        // Browser may prevent navigator.share replacement.
      }
    }

    return () => {
      window.print = originalPrint;
      HTMLAnchorElement.prototype.click =
        originalAnchorClick;

      if (originalShare) {
        try {
          navigator.share = originalShare;
        } catch {}
      }
    };
  }, [requestAction]);

  function closePopup() {
    pendingAction.current = null;
    setOpen(false);
  }

  function openPlans() {
    sessionStorage.setItem(
      "buildmitra_pending_return_url",
      window.location.pathname + window.location.search
    );

    window.location.href = "/subscription";
  }

  function continuePendingAction() {
    const action = pendingAction.current;

    pendingAction.current = null;
    setOpen(false);

    if (action) {
      bypassNextAction.current = true;

      setTimeout(() => {
        action();
      }, 100);
    }
  }

  return (
    <PaymentBarrierContext.Provider
      value={{ runProtectedAction: requestAction }}
    >
      {children}

      {open && (
        <div className="bm-payment-overlay">
          <div
            className="bm-payment-modal"
            data-payment-bypass="true"
          >
            <button
              type="button"
              className="bm-payment-close"
              onClick={closePopup}
              data-payment-bypass="true"
            >
              ×
            </button>

            <div className="bm-payment-header">
              {/* TOP HEADER / LOGO POSITION HAS FIX QR CODE */}
              <div className="bm-header-qr-box">
                <img
                  src="/images/buildmitra-payment-qr.jpg"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/qr-code.jpg"; }}
                  alt="BuildMitra PhonePe UPI payment QR"
                  className="bm-header-qr"
                />
              </div>
              <h2>💳 BuildMitra Subscription Required</h2>
            </div>

            <h3>🔥 Subscribe BuildMitra & Save Lakhs!</h3>

            <p>Scan PhonePe UPI QR Code to Pay</p>

            {/* MAIN SCAN BOX HAS FIX BUILDMITRA LOGO */}
            <div className="bm-scan-logo-box">
              <img
                src="/logo.png"
                onError={(e) => { (e.target as HTMLImageElement).src = "/images/buildmitra-official-logo.jpg"; }}
                alt="BuildMitra Logo"
                className="bm-scan-logo"
              />
            </div>

            <div className="bm-upi-details">
              <strong>UPI ID: 9731888377@ybl</strong>
              <span>Payee: Paint House / BuildMitra</span>
            </div>

            <p className="bm-message">
              🚀 Upscale & 10X Your Construction Business with
              BuildMitra Real-Time BOQ & Materials Suite!
            </p>

            <div className="bm-plan-grid">
              <div><strong>Basic</strong><span>₹250/mo</span></div>
              <div><strong>Pro</strong><span>₹350/mo</span></div>
              <div><strong>Enterprise</strong><span>₹450/mo</span></div>
              <div><strong>Single Unlock</strong><span>₹49</span></div>
            </div>

            <button
              type="button"
              className="bm-continue"
              onClick={continuePendingAction}
              data-payment-bypass="true"
            >
              ✓ I Have Paid / Continue
            </button>

            <button
              type="button"
              className="bm-plans-button"
              onClick={openPlans}
              data-payment-bypass="true"
            >
              View Subscription Plans →
            </button>

            <small>
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
              padding: 16px;
              background: rgba(8, 20, 38, 0.78);
              backdrop-filter: blur(4px);
            }

            .bm-payment-modal {
              position: relative;
              width: min(470px, 100%);
              max-height: 94vh;
              overflow-y: auto;
              padding: 24px;
              border-radius: 18px;
              background: #ffffff;
              box-shadow: 0 24px 70px rgba(0, 0, 0, 0.32);
              text-align: center;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }

            .bm-payment-close {
              position: absolute;
              top: 8px;
              right: 13px;
              border: 0;
              background: transparent;
              font-size: 29px;
              color: white;
              cursor: pointer;
              z-index: 10;
            }

            .bm-payment-header {
              background: #800020;
              border-radius: 12px 12px 0 0;
              margin: -24px -24px 16px -24px;
              padding: 16px 12px;
              color: white;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 8px;
            }

            .bm-header-qr-box {
              background: white;
              padding: 4px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }

            .bm-header-qr {
              display: block;
              height: 65px;
              width: auto;
              object-fit: contain;
            }

            h2 {
              margin: 0;
              color: #ffffff;
              font-size: 17px;
              font-weight: 800;
            }

            h3 {
              margin: 0 0 9px;
              color: #800020;
              font-size: 17px;
              font-weight: 800;
            }

            p {
              margin: 6px 0;
              color: #56677d;
              font-weight: 600;
            }

            .bm-scan-logo-box {
              border: 2px dashed #800020;
              border-radius: 12px;
              padding: 12px;
              background: #fffef9;
              margin: 10px 0;
              display: flex;
              justify-content: center;
            }

            .bm-scan-logo {
              display: block;
              width: 150px;
              height: auto;
              object-fit: contain;
              background: white;
              padding: 6px 10px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }

            .bm-upi-details {
              display: flex;
              flex-direction: column;
              gap: 3px;
              color: #800020;
              font-weight: 700;
            }

            .bm-message {
              margin: 12px 0;
              font-weight: 600;
              font-size: 11px;
              color: #166534;
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              padding: 8px;
              border-radius: 8px;
            }

            .bm-plan-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 6px;
              margin: 14px 0;
            }

            .bm-plan-grid div {
              display: flex;
              flex-direction: column;
              gap: 3px;
              padding: 8px 2px;
              border: 1px solid #dce4ed;
              border-radius: 9px;
              background: #f7f9fc;
              font-size: 11px;
            }

            .bm-plan-grid strong {
              color: #17365d;
              font-size: 11px;
            }

            .bm-plan-grid span {
              color: #800020;
              font-weight: 800;
              font-size: 11px;
            }

            .bm-continue,
            .bm-plans-button {
              width: 100%;
              padding: 12px;
              border: 0;
              border-radius: 9px;
              color: white;
              font: inherit;
              font-weight: 700;
              cursor: pointer;
            }

            .bm-continue {
              margin-bottom: 8px;
              background: #16834a;
            }

            .bm-plans-button {
              margin-bottom: 9px;
              background: #800020;
            }

            small {
              color: #718096;
              font-size: 10px;
            }
          `}</style>
        </div>
      )}
    </PaymentBarrierContext.Provider>
  );
}
