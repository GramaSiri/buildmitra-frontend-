import React from "react";
import Sidebar from "../components/Sidebar";
import OriginalDashboard from "./vendor-dashboard";

export default function VendorWithSidebar() {
  return React.createElement(Sidebar, { currentPath: "/vendor-dashboard" },
    React.createElement(OriginalDashboard, null)
  );
}

