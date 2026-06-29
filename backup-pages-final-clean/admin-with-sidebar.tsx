import React from "react";
import Sidebar from "../components/Sidebar";
import OriginalDashboard from "./admin-dashboard";

export default function AdminWithSidebar() {
  return React.createElement(Sidebar, { currentPath: "/admin-dashboard" },
    React.createElement(OriginalDashboard, null)
  );
}

