import { loadXLSX } from "./lazyLibs";

export const exportProjectReport = async (reportType: string, project: any, rows: any[]) => {
  const generated = new Date().toLocaleString();
  const metadata = [
    ["BuildMitra"],
    ["Report Type", reportType],
    ["Project Name", project?.name || project?.projectName || "All Projects"],
    ["Project ID", project?.projectId || project?.projectUniqueId || project?.id || "-"],
    ["Buyer Code", project?.buyerCode || "-"],
    ["Contractor Code", project?.contractorCode || "-"],
    ["Generated Date", generated],
    []
  ];
  const XLSX = await loadXLSX();
  const worksheet = XLSX.utils.aoa_to_sheet(metadata);
  XLSX.utils.sheet_add_json(worksheet, rows, { origin: "A9" });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "BuildMitra Report");
  XLSX.writeFile(workbook, `BuildMitra_${reportType}_${new Date().toISOString().split("T")[0]}.xlsx`);
};
