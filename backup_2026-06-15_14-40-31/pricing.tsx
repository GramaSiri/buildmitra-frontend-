import React from "react";

export default function PricingPage() {
  return React.createElement("div", { style: { padding: "24px", backgroundColor: "#f0f2f5", minHeight: "100vh" } },
    React.createElement("div", { style: { backgroundColor: "#800020", color: "white", padding: "16px", borderRadius: "12px", marginBottom: "20px" } },
      React.createElement("h1", { style: { margin: 0 } }, "💰 Pricing Plans"),
      React.createElement("p", null, "Subscription plans for every need")
    ),
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" } },
      React.createElement("div", { style: { backgroundColor: "white", borderRadius: "12px", padding: "24px", textAlign: "center" } },
        React.createElement("h2", { style: { color: "#800020" } }, "Basic"),
        React.createElement("p", { style: { fontSize: "28px", fontWeight: "bold" } }, "₹250", React.createElement("span", { style: { fontSize: "14px" } }, "/month")),
        React.createElement("p", null, "✓ 5 Projects"),
        React.createElement("p", null, "✓ Basic Support")
      ),
      React.createElement("div", { style: { backgroundColor: "white", borderRadius: "12px", padding: "24px", textAlign: "center", border: "2px solid #800020" } },
        React.createElement("h2", { style: { color: "#800020" } }, "Professional"),
        React.createElement("p", { style: { fontSize: "28px", fontWeight: "bold" } }, "₹350", React.createElement("span", { style: { fontSize: "14px" } }, "/month")),
        React.createElement("p", null, "✓ Unlimited Projects"),
        React.createElement("p", null, "✓ Priority Support")
      ),
      React.createElement("div", { style: { backgroundColor: "white", borderRadius: "12px", padding: "24px", textAlign: "center" } },
        React.createElement("h2", { style: { color: "#800020" } }, "Enterprise"),
        React.createElement("p", { style: { fontSize: "28px", fontWeight: "bold" } }, "₹450", React.createElement("span", { style: { fontSize: "14px" } }, "/month")),
        React.createElement("p", null, "✓ Everything Unlimited"),
        React.createElement("p", null, "✓ 24/7 Dedicated Support")
      )
    )
  );
}
