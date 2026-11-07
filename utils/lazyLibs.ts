// Lazy loaders for heavy export libraries. Call inside click handlers:
//   const XLSX = await loadXLSX();
//   const { jsPDF, autoTable } = await loadPDF();
let _xlsx: Promise<typeof import("xlsx")> | null = null;
export const loadXLSX = () => (_xlsx ??= import("xlsx"));

let _pdf: Promise<{
  jsPDF: typeof import("jspdf").jsPDF;
  autoTable: typeof import("jspdf-autotable").default;
}> | null = null;
export const loadPDF = () =>
  (_pdf ??= Promise.all([import("jspdf"), import("jspdf-autotable")]).then(
    ([j, a]) => ({ jsPDF: j.jsPDF, autoTable: a.default })
  ));
