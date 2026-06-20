import React from "react";
import Sidebar from "../components/Sidebar";
import OriginalDashboard from "./' + $d.file + '";

export default function DashboardWithSidebar() {
  return React.createElement(Sidebar, { currentPath: "/' + $d.name + '-dashboard" },
    React.createElement(OriginalDashboard, null)
  );
}
