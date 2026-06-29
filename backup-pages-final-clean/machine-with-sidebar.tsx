import React from "react";
import Sidebar from "../components/Sidebar";
import OriginalDashboard from "./machinehire-dashboard";

export default function MachineWithSidebar() {
  return React.createElement(Sidebar, { currentPath: "/machinehire-dashboard" },
    React.createElement(OriginalDashboard, null)
  );
}

