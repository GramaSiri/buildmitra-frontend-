import React from "react";
import Sidebar from "../components/Sidebar";
import OriginalDashboard from "./laboursupply-dashboard";

export default function LabourWithSidebar() {
  return React.createElement(Sidebar, { currentPath: "/laboursupply-dashboard" },
    React.createElement(OriginalDashboard, null)
  );
}

