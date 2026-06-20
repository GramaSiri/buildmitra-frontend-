import React from "react";
import Sidebar from "../components/Sidebar";
import OriginalDashboard from "./supplier-dashboard";

export default function SupplierWithSidebar() {
  return React.createElement(Sidebar, { currentPath: "/supplier-dashboard" },
    React.createElement(OriginalDashboard, null)
  );
}
