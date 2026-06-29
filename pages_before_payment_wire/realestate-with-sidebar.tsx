import React from "react";
import Sidebar from "../components/Sidebar";
import OriginalDashboard from "./realestate-dashboard";

export default function RealestateWithSidebar() {
  return React.createElement(Sidebar, { currentPath: "/realestate-dashboard" },
    React.createElement(OriginalDashboard, null)
  );
}
