import * as XLSX from "xlsx";

export const exportBuildMitraReport = ({ project, reportType, rows }) => {
  const generatedAt = new Date().toLocaleString();
  const metadata = [
    ["BuildMitra Construction CRM Report"],
    ["Project Name", project?.name || project?.projectName || ""],
    ["Project ID", project?.projectUniqueId || project?.projectId || project?.id || ""],
    ["Buyer", `${project?.buyerName || project?.clientName || ""}${project?.buyerCode ? ` (${project.buyerCode})` : ""}`],
    ["Contractor", `${project?.contractorName || ""}${project?.contractorCode ? ` (${project.contractorCode})` : ""}`],
    ["Date Generated", generatedAt],
    ["Report Type", reportType],
    []
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(metadata);
  XLSX.utils.sheet_add_json(worksheet, rows || [], { origin: "A9" });
  worksheet["!cols"] = [{ wch: 24 }, { wch: 28 }, { wch: 20 }, { wch: 18 }, { wch: 18 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "BuildMitra Report");
  XLSX.writeFile(workbook, `BuildMitra_${reportType}_${new Date().toISOString().split("T")[0]}.xlsx`);
};
