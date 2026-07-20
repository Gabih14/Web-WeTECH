import { Product } from "../types";

const GAMAS = ["PREMIUM", "INTERMEDIO", "BASICO"];
const ORIGENES = ["NACIONAL", "IMPORTADO"];

export const FILAMENT_SECTION_TITLES = [
  "NIVEL",
  "IMPRESORA",
  "TEMPERATURAS",
  "UNA VEZ IMPRESO",
  "PARA QUE SIRVE",
  "POR QUE ELEGIRLO",
  "ADVERTENCIA",
] as const;

export const PRINTER_SECTION_TITLES = [
  "VENTAJA WETECH",
  "FACILIDAD DE USO",
  "ESPECIFICACIONES",
  "MATERIALES COMPATIBLES",
  "COMPATIBLE CON",
  "PARA QUE SIRVE",
  "POR QUE ELEGIRLA",
  "PUESTA EN MARCHA",
  "ADVERTENCIA",
] as const;

export const ACCESSORY_SECTION_TITLES = [
  "VENTAJA WETECH",
  "ESPECIFICACIONES",
  "COMPATIBLE CON",
  "PARA QUE SIRVE",
  "POR QUE ELEGIRLA",
  "PUESTA EN MARCHA",
  "ADVERTENCIA",
] as const;

export type ProductDescriptionKind = "filament" | "printer" | "accessory";

export type ProductSections = Record<string, string>;

export interface GamaOrigen {
  gama: string | null;
  origen: string | null;
}

const normalize = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

const titleCase = (value: string): string => {
  const clean = value.trim().toLowerCase();
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : "";
};

export const parseGamaOrigen = (description = ""): GamaOrigen => {
  const parts = description.split("|").map((part) => part.trim());

  for (const part of parts) {
    const words = part.split(/\s+/).filter(Boolean);
    const firstWord = normalize(words[0] ?? "");

    if (GAMAS.includes(firstWord)) {
      const origin = words.find((word) => ORIGENES.includes(normalize(word)));
      return {
        gama: titleCase(words[0] ?? ""),
        origen: origin ? titleCase(origin) : null,
      };
    }
  }

  return { gama: null, origen: null };
};

export const parseSections = (
  observations = "",
  validTitles: readonly string[],
): ProductSections => {
  const normalizedTitleByLine = new Map(
    validTitles.map((title) => [normalize(title), title]),
  );
  const sections: ProductSections = {};
  let activeTitle: string | null = null;

  observations.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    const title = normalizedTitleByLine.get(normalize(trimmed));

    if (title) {
      activeTitle = title;
      sections[activeTitle] = "";
      return;
    }

    if (!activeTitle) {
      return;
    }

    sections[activeTitle] = [sections[activeTitle], line]
      .filter((value) => value.length > 0)
      .join("\n");
  });

  Object.keys(sections).forEach((key) => {
    sections[key] = sections[key].trim();
  });

  return sections;
};

export const getProductDescriptionKind = (
  product: Pick<Product, "category" | "subcategory" | "description">,
): ProductDescriptionKind => {
  const category = normalize(product.category);
  const subcategory = normalize(product.subcategory ?? "");
  const description = normalize(product.description);

  if (category === "FILAMENTO 3D" || category === "FILAMENTOS") {
    return "filament";
  }

  if (
    category.includes("ACCESORIO") ||
    category.includes("REPUESTO") ||
    subcategory.includes("ACCESORIO") ||
    description.includes("AMS") ||
    description.includes("CFS")
  ) {
    return "accessory";
  }

  return "printer";
};

export const getSectionTitlesForKind = (
  kind: ProductDescriptionKind,
): readonly string[] => {
  if (kind === "filament") return FILAMENT_SECTION_TITLES;
  if (kind === "accessory") return ACCESSORY_SECTION_TITLES;
  return PRINTER_SECTION_TITLES;
};
