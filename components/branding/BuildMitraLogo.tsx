import React from "react";

export const BUILDMITRA_LOGO_URL =
  "/images/buildmitra-official-logo.jpg";

type Props = {
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
}: Props) {
  const defaultWidth =
    variant === "sidebar"
      ? 145
      : variant === "compact"
      ? 95
      : variant === "report"
      ? 155
      : 150;

  return (
    <img
      src={BUILDMITRA_LOGO_URL}
      alt="BuildMitra"
      className={className}
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


