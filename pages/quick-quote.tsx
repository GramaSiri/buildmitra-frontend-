import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { BuildMitraLetterhead, BUILDMITRA_COMPANY_DETAILS } from "../components/BuildMitraLetterhead";
import { downloadBuildMitraPDF } from "../utils/pdfExport";

import { getApiBase } from "../utils/apiConfig";
const API_BASE = getApiBase();

export default function QuickQuotePage() {
  const router = useRouter();
  const { enquiryCode, action } = router.query;

  const [enquiry, setEnquiry] = useState<any>(null);
  const [rate, setRate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("Immediate / As per availability");
  const [paymentTerms, setPaymentTerms] = useState("Immediate payment before dispatch / delivery via Bank Transfer, UPI, GPay, or Paytm.");
  const [remarks, setRemarks] = useState("Rate subject to stock availability and final confirmation.");
  const [attachFile, setAttachFile] = useState<any>(null);
  const [attachFileName, setAttachFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(true);
  const [enquiryError, setEnquiryError] = useState("");
  const [showLivePreview, setShowLivePreview] = useState(false);

  const cleanPhone = (phone: string) => String(phone || "").replace(/\D/g, "").replace(/^91/, "");

  useEffect(() => {
    if (!router.isReady) return;

    const code = Array.isArray(enquiryCode)
      ? String(enquiryCode[0] || "").trim()
      : String(enquiryCode || "").trim();

    if (!code) {
      setEnquiry(null);
      setEnquiryError("Enquiry code is missing.");
      setEnquiryLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(() => {
      controller.abort();
    }, 12000);

    setEnquiryLoading(true);
    setEnquiryError("");

    fetch(
      `${API_BASE}/api/enquiry/code/${encodeURIComponent(code)}`,
      { signal: controller.signal }
    )
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.message || `Unable to load enquiry (${response.status}).`
          );
        }

        if (!data?.success || !data?.enquiry) {
          throw new Error(data?.message || "Enquiry not found.");
        }

        setEnquiry(data.enquiry);

        if (data.enquiry?.uploadedRate) {
          setRate(String(data.enquiry.uploadedRate));
        }
      })
      .catch((error) => {
        setEnquiry(null);

        if (error?.name === "AbortError") {
          setEnquiryError(
            "Enquiry loading timed out. Please use Supplier Dashboard."
          );
        } else {
          setEnquiryError(
            error?.message ||
            "Unable to load this enquiry. Please use Supplier Dashboard."
          );
        }
      })
      .finally(() => {
        window.clearTimeout(timer);
        setEnquiryLoading(false);
      });

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [router.isReady, enquiryCode]);

  const rejectEnquiry = async () => {
    if (!enquiryCode) return;
    await fetch(`${API_BASE}/api/enquiry/code/${enquiryCode}/reject`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Rejected by supplier" }),
    });
    alert("Enquiry rejected.");
  };

  useEffect(() => {
    if (action === "reject" && enquiryCode) rejectEnquiry();
  }, [action, enquiryCode]);

  const handleDownloadPDF = () => {
    if (!enquiry) return;
    const qtyNum = Number(enquiry.quantity) || 1;
    const rateNum = Number(rate) || Number(enquiry.uploadedRate) || 0;
    const subtotal = qtyNum * rateNum;
    const gst = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gst;

    downloadBuildMitraPDF({
      documentTitle: "OFFICIAL MARKETPLACE QUOTATION",
      documentNo: enquiry.enquiryCode || `BM-QT-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split("T")[0],
      buyerName: enquiry.buyerName,
      buyerCode: enquiry.buyerPhone,
      contractorName: enquiry.providerName || BUILDMITRA_COMPANY_DETAILS.name,
      contractorCode: enquiry.providerPhone || BUILDMITRA_COMPANY_DETAILS.mobile,
      items: [
        {
          sno: 1,
          description: enquiry.itemName || "Marketplace Product",
          quantity: qtyNum,
          unit: enquiry.unit || enquiry.uploadedUnit || "Unit",
          rate: rateNum,
          amount: subtotal,
          notes: remarks || enquiry.specification || enquiry.message
        }
      ],
      subtotal,
      gstAmount: gst,
      grandTotal,
      notes: `${remarks} | Delivery: ${deliveryTime} | Terms: ${paymentTerms}`,
      terms: [
        "Prices quoted are inclusive of standard loading & unloading.",
        "Quotation validity is 15 days from date of issuance.",
        "Standard payment terms: 30% Advance, 60% on site delivery, 10% on inspection.",
        "Subject to Bengaluru Jurisdiction."
      ]
    });
  };

  const sendQuote = async () => {
    if (!enquiry || !rate) {
      alert("Please enter quoted rate.");
      return;
    }

    setLoading(true);

    const quoteRes = await fetch(`${API_BASE}/api/enquiry/${enquiry._id}/quote`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quotedAmount: Number(rate),
        quoteMessage: remarks || "Please contact us for quotation details",
        quoteValidityDate: deliveryTime || "",
        paymentTerms: paymentTerms || "",
        gstIncluded: false,
        transportCharges: 0,
      }),
    });

    const quoteData = await quoteRes.json().catch(() => ({}));
    setLoading(false);

    if (quoteData.success && quoteData.enquiry) {
      const savedQuotes = JSON.parse(localStorage.getItem("buildmitra_quotes") || "[]");
      const newQuote = {
        ...quoteData.enquiry,
        enquiryCode: enquiry.enquiryCode,
        buyerName: enquiry.buyerName,
        buyerPhone: enquiry.buyerPhone,
        itemName: enquiry.itemName,
        quantity: enquiry.quantity,
        unit: enquiry.unit,
        location: enquiry.location,
        attachment: attachFileName || null,
        sentAt: new Date().toISOString(),
        status: "Sent"
      };
      savedQuotes.push(newQuote);
      localStorage.setItem("buildmitra_quotes", JSON.stringify(savedQuotes));
    }

    const quoteUnit = enquiry.unit || enquiry.uploadedUnit || "";
    const attachmentInfo = attachFileName ? `\n\n📎 Attachment: ${attachFileName}` : "";

    const msg =
`🏗️ BUILDMITRA INFRA — OFFICIAL QUOTATION
No:378, JP Nagar 9th Phase, Bengaluru- 560062 | 📱 +91 76769 42386

Quote Ref: ${enquiry.enquiryCode || "-"}
Date: ${new Date().toISOString().split("T")[0]}

Supplier: ${enquiry.providerName || "BuildMitra Verified Supplier"}
Kind Attn: ${String(enquiry.buyerName || "Buyer").replace(/^Buyer\s+/i, "")} (${enquiry.buyerPhone})

-----------------------------------------
📦 Item: ${enquiry.itemName}
📊 Qty: ${enquiry.quantity || "-"} ${quoteUnit}
📍 Location: ${enquiry.location || "-"}

💰 Quoted Rate: ₹${rate} / ${quoteUnit || "Unit"}
🚚 Delivery: ${deliveryTime}
💳 Payment Terms: ${paymentTerms}
-----------------------------------------

📜 Standard Terms:
1. Rate is subject to stock availability and final confirmation.
2. Buyer must verify material quantity and quality before unloading.
3. Payment via Bank Transfer / UPI / GPay / PhonePe.

Remarks: ${remarks}${attachmentInfo}

🌐 BuildMitra Infra & Construction Suite`;

    const buyerPhone = cleanPhone(enquiry.buyerPhone);
    if (!buyerPhone) {
      alert("Buyer phone missing.");
      return;
    }

    window.open(`https://wa.me/91${buyerPhone}?text=${encodeURIComponent(msg)}`, "_blank");
    alert("Quote saved cleanly! WhatsApp opened to buyer with official BuildMitra quotation.");
  };

  if (enquiryLoading) {
    return (
      <div style={styles.page}>
        <div style={{ maxWidth: 520, margin: "40px auto", padding: 20, textAlign: "center" }}>
          Loading enquiry...
        </div>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div style={styles.page}>
        <div
          style={{
            maxWidth: 520,
            margin: "40px auto",
            padding: 22,
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: "0 0 8px", color: "#111827" }}>
            Enquiry unavailable
          </h2>

          <p style={{ margin: "0 0 16px", color: "#6b7280", lineHeight: 1.5 }}>
            {enquiryError || "This enquiry could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/supplier-dashboard")}
            style={{
              border: 0,
              borderRadius: 9,
              padding: "10px 16px",
              background: "#16a34a",
              color: "#ffffff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Back to Supplier Dashboard
          </button>
        </div>
      </div>
    );
  }

  const qtyNum = Number(enquiry.quantity) || 1;
  const rateNum = Number(rate) || Number(enquiry.uploadedRate) || 0;
  const subtotal = qtyNum * rateNum;
  const gst = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gst;

  return (
    <div style={styles.page}>
      <div style={styles.card} className="card-compact">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h1 style={{ margin: 0, fontSize: "22px", color: "#0f172a" }}>📝 Reply Official Quotation</h1>
          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            style={{ backgroundColor: "#0284c7", color: "#fff", border: "none", borderRadius: "6px", padding: "8px 14px", fontWeight: "600", fontSize: "12px", cursor: "pointer" }}
          >
            {showLivePreview ? "✏️ Edit Quotation Form" : "👁️ View Letterhead Preview"}
          </button>
        </div>

        {showLivePreview ? (
          <div>
            <BuildMitraLetterhead
              documentTitle="OFFICIAL MARKETPLACE QUOTATION"
              documentNo={enquiry.enquiryCode}
              date={new Date().toISOString().split("T")[0]}
              buyerName={enquiry.buyerName}
              buyerCode={enquiry.buyerPhone}
              contractorName={enquiry.providerName}
              contractorCode={enquiry.providerPhone}
              items={[
                {
                  sno: 1,
                  description: enquiry.itemName,
                  quantity: qtyNum,
                  unit: enquiry.unit || "Unit",
                  rate: rateNum,
                  amount: subtotal,
                  notes: remarks || enquiry.specification
                }
              ]}
              subtotal={subtotal}
              gstAmount={gst}
              grandTotal={grandTotal}
              notes={`Delivery: ${deliveryTime} | Terms: ${paymentTerms}`}
              onPrint={handleDownloadPDF}
              onShareWhatsApp={sendQuote}
            />
            <button style={{ ...styles.button, marginTop: "20px" }} onClick={() => setShowLivePreview(false)}>
              ✏️ Back to Edit Form
            </button>
          </div>
        ) : (
          <div>
            <div style={styles.headerBox}>
              <h2 style={{ margin: 0, fontSize: "16px", color: "#065f46" }}>{enquiry.providerName || "Verified Supplier"}</h2>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#047857" }}>Phone: {enquiry.providerPhone || "-"}</p>
            </div>

            <div style={styles.box}>
              <p style={{ margin: "4px 0" }}><b>Buyer Name:</b> {String(enquiry.buyerName || "").replace(/^Buyer\s+/i, "")}</p>
              <p style={{ margin: "4px 0" }}><b>Buyer Phone:</b> {enquiry.buyerPhone}</p>
            </div>

            <div style={styles.box}>
              <h3 style={{ margin: "0 0 8px", fontSize: "14px", color: "#1e293b" }}>Requirement Details</h3>
              <p style={{ margin: "4px 0" }}><b>Enquiry Code:</b> {enquiry.enquiryCode}</p>
              <p style={{ margin: "4px 0" }}><b>Item:</b> {enquiry.itemName}</p>
              <p style={{ margin: "4px 0" }}><b>Qty:</b> {enquiry.quantity || "-"} {enquiry.unit || ""}</p>
              <p style={{ margin: "4px 0" }}><b>Location:</b> {enquiry.location || "-"} {enquiry.pincode ? `- ${enquiry.pincode}` : ""}</p>
              <p style={{ margin: "4px 0" }}><b>Specification / Notes:</b> {enquiry.specification || enquiry.message || "-"}</p>
            </div>

            <label style={styles.label} className="label-compact">Quoted Rate (₹ / {enquiry.uploadedUnit || enquiry.unit || "Unit"})</label>
            <input style={styles.input} className="input-compact" type="number" placeholder="Enter rate per unit" value={rate} onChange={(e) => setRate(e.target.value)} />
            <p style={styles.note}>Uploaded rate auto-filled. Edit rate if required.</p>

            <label style={styles.label} className="label-compact">Delivery Timeline</label>
            <input style={styles.input} className="input-compact" placeholder="Delivery Time" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} />

            <label style={styles.label} className="label-compact">Payment Terms & Conditions</label>
            <textarea style={styles.textarea} className="input-compact" placeholder="Payment Terms" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />

            <label style={styles.label} className="label-compact">Remarks / Specifications</label>
            <textarea style={styles.textarea} className="input-compact" placeholder="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button style={{ ...styles.button, flex: 1 }} onClick={sendQuote} disabled={loading}>
                {loading ? "Saving..." : "📲 Submit Quote on WhatsApp"}
              </button>
              <button style={{ ...styles.buttonInfo, flex: 1 }} onClick={handleDownloadPDF}>
                🖨️ Download PDF Quotation
              </button>
            </div>

            <button style={styles.reject} onClick={rejectEnquiry}>Reject Enquiry</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, any> = {
  page: { minHeight: "100vh", background: "#f8fafc", padding: 24, fontFamily: "Inter, system-ui, sans-serif" },
  card: { maxWidth: 760, margin: "20px auto", background: "#fff", padding: 24, borderRadius: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" },
  headerBox: { background: "#ecfdf5", padding: 14, borderRadius: 10, border: "1px solid #bbf7d0", marginBottom: 12 },
  box: { background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 12, fontSize: 13 },
  label: { fontWeight: 700, display: "block", marginTop: 12, marginBottom: 4, fontSize: 13, color: "#334155" },
  note: { color: "#047857", fontWeight: 600, fontSize: 11, marginTop: 2 },
  input: { width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 },
  textarea: { width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, minHeight: 70, fontSize: 13 },
  button: { width: "100%", padding: 12, background: "#16a34a", color: "#fff", border: 0, borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 },
  buttonInfo: { width: "100%", padding: 12, background: "#0284c7", color: "#fff", border: 0, borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 },
  reject: { width: "100%", padding: 10, background: "#ef4444", color: "#fff", border: 0, borderRadius: 8, fontWeight: 700, marginTop: 12, cursor: "pointer", fontSize: 13 },
};




