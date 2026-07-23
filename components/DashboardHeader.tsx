import React from "react";
import { BuildMitraHeader } from "./ui/DesignSystem";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  role?: string;
  showBackToDashboard?: boolean;
}

export default function DashboardHeader({
  title = "Dashboard",
  subtitle = "Manage ongoing construction projects, enquiries, and BOQ items",
  role = "User",
  showBackToDashboard = false
}: DashboardHeaderProps) {
  return (
    <BuildMitraHeader
      moduleTitle={`${role} Module`}
      pageTitle={title}
      subtitle={subtitle}
      showBackToDashboard={showBackToDashboard}
    />
  );
}
