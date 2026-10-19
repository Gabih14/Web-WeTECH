export interface MaterialClassification {
  material: string;
  submaterial: string | null;
}

export interface MaterialGroup {
  material: string;
  label: string;
  submaterials: string[];
}

type MaterialProduct = {
  material?: string;
  materialClassifications?: MaterialClassification[];
};

export const normalizeMaterial = (value: string) =>
  value.trim().toLocaleUpperCase();

export const materialGroupValue = (material: string) =>
  material.trim().replace(/\+$/, "").trim();

export const materialLabel = (material: string, hasPlusVariant = false) => {
  const groupedMaterial = materialGroupValue(material);
  return normalizeMaterial(groupedMaterial) === "PLA" || hasPlusVariant
    ? `${groupedMaterial} / ${groupedMaterial}+`
    : groupedMaterial;
};

export function buildMaterialGroups(products: MaterialProduct[]): MaterialGroup[] {
  const groups = new Map<string, {
    material: string;
    hasPlusVariant: boolean;
    submaterials: Map<string, string>;
  }>();

  products.forEach((product) => {
    const classifications = product.materialClassifications?.length
      ? product.materialClassifications
      : product.material?.trim()
        ? [{ material: product.material.trim(), submaterial: null }]
        : [];

    classifications.forEach(({ material, submaterial }) => {
      const cleanMaterial = material.trim();
      if (!cleanMaterial) return;
      const groupedMaterial = materialGroupValue(cleanMaterial);
      const materialKey = normalizeMaterial(groupedMaterial);
      const group = groups.get(materialKey) ?? {
        material: groupedMaterial,
        hasPlusVariant: false,
        submaterials: new Map<string, string>(),
      };
      if (normalizeMaterial(cleanMaterial).endsWith("+")) group.hasPlusVariant = true;
      const cleanSubmaterial = submaterial?.trim();
      if (cleanSubmaterial) {
        const submaterialKey = normalizeMaterial(cleanSubmaterial);
        if (!group.submaterials.has(submaterialKey)) {
          group.submaterials.set(submaterialKey, cleanSubmaterial);
        }
      }
      groups.set(materialKey, group);
    });
  });

  return Array.from(groups.values())
    .map(({ material, hasPlusVariant, submaterials }) => ({
      material,
      label: materialLabel(material, hasPlusVariant),
      submaterials: Array.from(submaterials.values()).sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => {
      const aIsPla = normalizeMaterial(a.material) === "PLA";
      const bIsPla = normalizeMaterial(b.material) === "PLA";
      return aIsPla === bIsPla ? a.material.localeCompare(b.material) : aIsPla ? -1 : 1;
    });
}

export function matchesMaterialFilter(
  product: MaterialProduct,
  material: string | null,
  submaterial: string | null,
) {
  if (!material) return true;
  const materialKey = normalizeMaterial(materialGroupValue(material));
  const submaterialKey = submaterial ? normalizeMaterial(submaterial) : null;
  const classificationMatches = product.materialClassifications?.some(
    (value) =>
      normalizeMaterial(materialGroupValue(value.material)) === materialKey &&
      (!submaterialKey ||
        (value.submaterial && normalizeMaterial(value.submaterial) === submaterialKey)),
  );

  return classificationMatches ||
    (!submaterialKey &&
      !!product.material &&
      normalizeMaterial(materialGroupValue(product.material)) === materialKey);
}

export function setMaterialSearchParams(
  current: URLSearchParams,
  material: string | null,
  submaterial: string | null,
) {
  const next = new URLSearchParams(current);
  if (material) next.set("material", material);
  else next.delete("material");
  if (material && submaterial) next.set("submaterial", submaterial);
  else next.delete("submaterial");
  return next;
}
