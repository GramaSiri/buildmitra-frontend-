import * as XLSX from "xlsx";

export const exportProjectReport = (reportType: string, project: any, rows: any[]) => {
  const generated = new Date().toLocaleString();
  const metadata = [
    ["BuildMitra"],
    ["Report Type", reportType],
    ["Project Name", project?.name || project?.projectName || "All Projects"],
    ["Project ID", project?.projectId || project?.projectUniqueId || project?.id || "-"],
    ["Buyer", `${project?.buyerName || "-"}${project?.buyerCode ? ` (${project.buyerCode})` : ""}`],
    ["Contractor", `${project?.contractorName || "-"}${project?.contractorCode ? ` (${project.contractorCode})` : ""}`],
    ["Date Generated", generated],
    []
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(metadata);
  XLSX.utils.sheet_add_json(worksheet, rows, { origin: "A9" });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "BuildMitra Report");
  XLSX.writeFile(workbook, `BuildMitra_${reportType}_${new Date().toISOString().split("T")[0]}.xlsx`);
};
