import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getApiBase } from "../utils/apiConfig";

export default function QuickBatchReplyPage() {
  const router = useRouter();

  const [message, setMessage] = useState(
    "Preparing official BuildMitra quotation..."
  );

  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const batchCode = String(
      router.query.batchCode || ""
    ).trim();

    const providerUserCode = String(
      router.query.provider || ""
    ).trim();

    const quickReplyCode = String(
      router.query.code || ""
    ).trim();

    if (
      !batchCode ||
      !providerUserCode ||
      !quickReplyCode
    ) {
      setError("Invalid Reply Quote link.");
      return;
    }

    const run = async () => {
      try {
        const apiBase = getApiBase();

        const response = await fetch(
          `${apiBase}/api/enquiry/batch/${encodeURIComponent(batchCode)}/quick-reply`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              providerUserCode,
              quickReplyCode,
            }),
          }
        );

        const data = await response
          .json()
          .catch(() => ({}));

        if (!response.ok || !data?.success) {
          const backendMessage =
            data?.message ||
            data?.error ||
            data?.details ||
            "No backend error message returned";

          throw new Error(
            `HTTP ${response.status}: ${backendMessage}`
          );
        }

        const buyerPhone = String(
          data.buyerPhone || ""
        )
          .replace(/\D/g, "")
          .replace(/^91/, "");

        if (!buyerPhone) {
          throw new Error(
            "Buyer WhatsApp number is missing."
          );
        }

        setMessage(
          "Quotation created and saved. Opening buyer WhatsApp..."
        );

        const encodedMessage = encodeURIComponent(
          data.whatsappMessage || ""
        );

        const isMobile =
          /Android|iPhone|iPad|iPod/i.test(
            navigator.userAgent
          );

        if (isMobile) {
          // Open installed WhatsApp directly on mobile.
          const whatsappAppUrl =
            `whatsapp://send?phone=91${buyerPhone}&text=${encodedMessage}`;

          window.location.href = whatsappAppUrl;
        } else {
          // Desktop / laptop fallback.
          const whatsappWebUrl =
            `https://wa.me/91${buyerPhone}?text=${encodedMessage}`;

          window.location.href = whatsappWebUrl;
        }

      } catch (e: any) {
        setError(
          e?.message ||
          "Could not send quotation."
        );
      }
    };

    run();

  }, [router.isReady, router.query]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 20,
        background: "#f8fafc",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "min(440px, 94vw)",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: 24,
          textAlign: "center",
          boxShadow:
            "0 12px 30px rgba(0,0,0,.08)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          BuildMitra Reply Quote
        </h2>

        {error ? (
          <>
            <p style={{ color: "#b91c1c" }}>
              {error}
            </p>

            <button
              onClick={() => router.push("/")}
              style={{
                border: 0,
                borderRadius: 8,
                padding: "10px 15px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </>
        ) : (
          <p>{message}</p>
        )}
      </div>
    </div>
  );
}


