import React from "react";
import Sidebar from "../components/Sidebar";
import BuyerDashboard from "./buyer-dashboard";

export default function BuyerWithSidebar() {
  return (
    <Sidebar currentPath="/buyer-dashboard">
      <BuyerDashboard />
    </Sidebar>
  );
}