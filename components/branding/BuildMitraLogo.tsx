import React from "react";

export const BUILDMITRA_LOGO_URL =
  "/images/buildmitra-official-logo.jpg";

type BuildMitraLogoProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  variant?: "sidebar" | "header" | "report" | "compact";
};

export default function BuildMitraLogo({
  width,
  height = "auto",
  className = "",
  style = {},
  variant = "header"
}: BuildMitraLogoProps) {
  const defaultWidth =
    variant === "sidebar"
      ? 145
      : variant === "compact"
      ? 100
      : variant === "report"
      ? 170
      : 155;

  return (
    <img
      src={BUILDMITRA_LOGO_URL}
      alt="BuildMitra"
      className={`buildmitra-official-logo ${className}`}
      style={{
        display: "block",
        width: width ?? defaultWidth,
        height,
        maxWidth: "100%",
        objectFit: "contain",
        objectPosition: "center",
        ...style
      }}
    />
  );
}
