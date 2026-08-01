import React from "react";
import { BUILDMITRA_LOGO_DATA_URI } from "../utils/logoDataUri";

type Props = {
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  showText?: boolean;
};

export default function BuildMitraLogo({
  width = 150,
  height = "auto",
  className,
  style,
  showText = false
}: Props) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", ...style }} className={className}>
      <img
        src={BUILDMITRA_LOGO_DATA_URI || "/images/buildmitra-logo.jpeg"}
        alt="BuildMitra"
        style={{
          display: "block",
          width,
          height,
          maxWidth: "100%",
          objectFit: "contain",
          borderRadius: "8px"
        }}
      />
      {showText && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 900, fontSize: "16px", color: "#0f172a", letterSpacing: "-0.3px" }}>
            BUILDMITRA
          </span>
          <span style={{ fontSize: "10px", fontWeight: "700", color: "#0284c7", textTransform: "uppercase" }}>
            Infra & Construction
          </span>
        </div>
      )}
    </div>
  );
}
