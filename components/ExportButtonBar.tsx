import React from "react";

export interface ExportButtonBarProps {
  onDownloadPDF: () => void;
  onExportExcel: () => void;
  onShareWhatsApp: () => void;
  extraButtons?: React.ReactNode;
  containerStyle?: React.CSSProperties;
}

export const ExportButtonBar: React.FC<ExportButtonBarProps> = ({
  onDownloadPDF,
  onExportExcel,
  onShareWhatsApp,
  extraButtons,
  containerStyle
}) => {
  return (
    <div style={{
      display: "flex",
      gap: "12px",
      alignItems: "center",
      flexWrap: "wrap",
      marginTop: "16px",
      marginBottom: "16px",
      ...containerStyle
    }}>
      <button
        type="button"
        onClick={onDownloadPDF}
        style={{
          backgroundColor: "#0284c7",
          color: "#ffffff",
          border: "none",
          padding: "10px 18px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "700",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 2px 6px rgba(2, 132, 199, 0.25)",
          transition: "all 0.2s ease"
        }}
      >
        📄 PDF
      </button>

      <button
        type="button"
        onClick={onExportExcel}
        style={{
          backgroundColor: "#16a34a",
          color: "#ffffff",
          border: "none",
          padding: "10px 18px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "700",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 2px 6px rgba(22, 163, 74, 0.25)",
          transition: "all 0.2s ease"
        }}
      >
        📊 Export in Excel
      </button>

      <button
        type="button"
        onClick={onShareWhatsApp}
        style={{
          backgroundColor: "#25D366",
          color: "#ffffff",
          border: "none",
          padding: "10px 18px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "700",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 2px 6px rgba(37, 211, 102, 0.25)",
          transition: "all 0.2s ease"
        }}
      >
        📲 WhatsApp
      </button>

      {extraButtons}
    </div>
  );
};

export default ExportButtonBar;

