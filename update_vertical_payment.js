const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";
let code = fs.readFileSync(filePath, "utf8");

// 1. Transform Payment Entry Modal to pure vertical stack (row over row)
const oldPaymentModalRegex = /showPaymentEntryModal && React\.createElement\("div", \{ style: styles\.modal[\s\S]*?Save Payment"\)\s*\)\s*\)\s*\)/;

const newPaymentModal = `showPaymentEntryModal && React.createElement("div", { style: styles.modal, onClick: () => setShowPaymentEntryModal(false) },
      React.createElement("div", { style: { ...styles.modalContent, width: "min(460px, 94vw)", maxWidth: "460px" }, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", { style: { color: "#2d6a4f", margin: "0 0 14px 0", fontSize: "16px", borderBottom: "1.5px solid #2d6a4f", paddingBottom: "6px" } }, "💰 Record Payment - ", selectedProjectData?.name),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" } },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Milestone / Work Description *"),
            React.createElement("input", { placeholder: "e.g. Foundation, Advance, Plinth", value: newPayment.milestoneName, onChange: (e) => setNewPayment({...newPayment, milestoneName: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Payment Amount (₹) * (up to 6+ digits)"),
            React.createElement("input", { type: "number", min: 0, "data-bm-digits": "8", placeholder: "e.g. 250000", value: newPayment.amount, onChange: (e) => setNewPayment({...newPayment, amount: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Payment Date *"),
            React.createElement("input", { type: "date", value: newPayment.date, onChange: (e) => setNewPayment({...newPayment, date: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Payment Status *"),
            React.createElement("select", { value: newPayment.status, onChange: (e) => setNewPayment({...newPayment, status: e.target.value}), style: styles.select },
              React.createElement("option", { value: "Paid" }, "Paid"),
              React.createElement("option", { value: "Pending" }, "Pending"),
              React.createElement("option", { value: "Partially Paid" }, "Partially Paid")
            )
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Cheque / UTR / Reference"),
            React.createElement("input", { placeholder: "UTR or Cheque No", value: newPayment.reference, onChange: (e) => setNewPayment({...newPayment, reference: e.target.value}), style: styles.input })
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" } },
          React.createElement("button", { onClick: () => setShowPaymentEntryModal(false), style: { ...styles.buttonDanger, padding: "6px 14px" } }, "Cancel"),
          React.createElement("button", { onClick: saveManualPayment, style: { ...styles.buttonSuccess, padding: "6px 20px", fontWeight: "bold" } }, "Save Payment")
        )
      )
    )`;

code = code.replace(oldPaymentModalRegex, newPaymentModal);

// 2. Transform Payment Release Modal to pure vertical stack (row over row)
const oldReleaseModalRegex = /showPaymentModal && selectedMilestone && React\.createElement\("div", \{ style: styles\.modal[\s\S]*?Confirm Paid"\)\s*\)\s*\)\s*\)/;

const newReleaseModal = `showPaymentModal && selectedMilestone && React.createElement("div", { style: styles.modal, onClick: () => setShowPaymentModal(false) },
      React.createElement("div", { style: { ...styles.modalContent, width: "min(460px, 94vw)", maxWidth: "460px" }, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", { style: { marginTop: 0, marginBottom: "14px", fontSize: "16px", borderBottom: "1.5px solid #800020", paddingBottom: "6px" } }, "Mark Invoice Paid - ", selectedMilestone.name),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" } },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Payment Amount (₹) * (up to 6+ digits)"),
            React.createElement("input", { type: "number", min: 0, "data-bm-digits": "8", value: actualPaymentAmount, onChange: (e) => setActualPaymentAmount(e.target.value), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Payment Date *"),
            React.createElement("input", { type: "date", value: paymentDate, onChange: (e) => setPaymentDate(e.target.value), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Payment Mode *"),
            React.createElement("select", { value: paymentMode, onChange: (e) => setPaymentMode(e.target.value), style: styles.select },
              React.createElement("option", { value: "" }, "Select Mode"),
              React.createElement("option", { value: "UPI" }, "UPI"),
              React.createElement("option", { value: "NEFT/RTGS" }, "NEFT/RTGS"),
              React.createElement("option", { value: "Cheque" }, "Cheque"),
              React.createElement("option", { value: "Cash" }, "Cash")
            )
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Reference / UTR *"),
            React.createElement("input", { placeholder: "Reference / UTR", value: paymentReference, onChange: (e) => setPaymentReference(e.target.value), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Payment Remarks *"),
            React.createElement("input", { placeholder: "Remarks", value: paymentRemarks, onChange: (e) => setPaymentRemarks(e.target.value), style: styles.input })
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: "10px", justifyContent: "flex-end" } },
          React.createElement("button", { onClick: () => setShowPaymentModal(false), style: { ...styles.buttonDanger, padding: "6px 14px" } }, "Cancel"),
          React.createElement("button", { onClick: releasePayment, style: { ...styles.buttonSuccess, padding: "6px 20px", fontWeight: "bold" } }, "Confirm Paid")
        )
      )
    )`;

code = code.replace(oldReleaseModalRegex, newReleaseModal);

fs.writeFileSync(filePath, code, "utf8");
console.log("PAYMENT_FORMS_VERTICAL_STACKED_WITH_6_DIGITS");
