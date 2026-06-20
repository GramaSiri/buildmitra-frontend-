import React from "react";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children, currentPath }) {
  return React.createElement(Sidebar, { currentPath: currentPath },
    React.createElement("div", { style: { width: "100%" } }, children)
  );
}
