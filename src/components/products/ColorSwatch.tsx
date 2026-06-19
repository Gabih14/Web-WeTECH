import { CSSProperties } from "react";
import { ColorGroup } from "../../types";

interface ColorSwatchProps {
  hex?: string | null;
  colorGroup?: Pick<ColorGroup, "name"> | null;
  className?: string;
}

const MULTICOLOR_SWATCH_STYLE: CSSProperties = {
  background:
    "conic-gradient(#ef4444, #f97316, #facc15, #22c55e, #06b6d4, #3b82f6, #a855f7, #ef4444)",
};

export function getColorSwatchStyle(
  hex?: string | null,
  colorGroup?: Pick<ColorGroup, "name"> | null
): CSSProperties {
  if (colorGroup?.name.trim().toLowerCase() === "multicolor") {
    return MULTICOLOR_SWATCH_STYLE;
  }

  return { backgroundColor: hex?.trim() || "#f3f4f6" };
}

export function ColorSwatch({
  hex,
  colorGroup,
  className = "",
}: ColorSwatchProps) {
  return (
    <span
      className={`rounded-full border shadow-sm ${className}`}
      style={getColorSwatchStyle(hex, colorGroup)}
      aria-hidden="true"
    />
  );
}
