export interface MaterialClassification {
  material: string;
  submaterial: string | null;
  grupoWebValues?: string[];
}

export interface MaterialSubmaterial {
  value: string;
  label: string;
  grupoWebValues: string[];
}

export interface MaterialGroup {
  material: string;
  label: string;
  grupoWebValues: string[];
  submaterials: MaterialSubmaterial[];
}

type MaterialProduct = {
  material?: string;
  grupoWeb?: string;
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

export const grupoWebLabel = (grupoWeb: string) =>
  normalizeMaterial(grupoWeb) === "ESTANDAR" ? "General" : grupoWeb;

const compareGrupoWeb = (a: string, b: string) => {
  const aIsGeneral = normalizeMaterial(a) === "ESTANDAR";
  const bIsGeneral = normalizeMaterial(b) === "ESTANDAR";
  return aIsGeneral === bIsGeneral ? a.localeCompare(b) : aIsGeneral ? -1 : 1;
};

export function buildMaterialGroups(products: MaterialProduct[]): MaterialGroup[] {
  const groups = new Map<string, {
    material: string;
    hasPlusVariant: boolean;
    grupoWebValues: Map<string, string>;
    submaterials: Map<string, {
      value: string;
      grupoWebValues: Map<string, string>;
    }>;
  }>();

  products.forEach((product) => {
    const classifications = product.materialClassifications?.length
      ? product.materialClassifications
      : product.material?.trim()
        ? [{
            material: product.material.trim(),
            submaterial: null,
            grupoWebValues: product.grupoWeb?.trim() ? [product.grupoWeb.trim()] : [],
          }]
        : [];

    classifications.forEach(({ material, submaterial, grupoWebValues }) => {
      const cleanMaterial = material.trim();
      if (!cleanMaterial) return;
      const groupedMaterial = materialGroupValue(cleanMaterial);
      const materialKey = normalizeMaterial(groupedMaterial);
      const group = groups.get(materialKey) ?? {
        material: groupedMaterial,
        hasPlusVariant: false,
        grupoWebValues: new Map<string, string>(),
        submaterials: new Map(),
      };
      if (normalizeMaterial(cleanMaterial).endsWith("+")) group.hasPlusVariant = true;
      const effectiveGrupoWebValues = grupoWebValues?.length
        ? grupoWebValues
        : product.grupoWeb?.trim()
          ? [product.grupoWeb.trim()]
          : [];
      effectiveGrupoWebValues.forEach((grupoWeb) => {
        const cleanGrupoWeb = grupoWeb.trim();
        if (!cleanGrupoWeb) return;
        const grupoWebKey = normalizeMaterial(cleanGrupoWeb);
        if (!group.grupoWebValues.has(grupoWebKey)) {
          group.grupoWebValues.set(grupoWebKey, cleanGrupoWeb);
        }
      });
      const cleanSubmaterial = submaterial?.trim();
      if (cleanSubmaterial) {
        const submaterialKey = normalizeMaterial(cleanSubmaterial);
        const submaterialOption = group.submaterials.get(submaterialKey) ?? {
          value: cleanSubmaterial,
          grupoWebValues: new Map<string, string>(),
        };
        effectiveGrupoWebValues.forEach((grupoWeb) => {
          const cleanGrupoWeb = grupoWeb.trim();
          if (!cleanGrupoWeb) return;
          const grupoWebKey = normalizeMaterial(cleanGrupoWeb);
          if (!submaterialOption.grupoWebValues.has(grupoWebKey)) {
            submaterialOption.grupoWebValues.set(grupoWebKey, cleanGrupoWeb);
          }
        });
        group.submaterials.set(submaterialKey, submaterialOption);
      }
      groups.set(materialKey, group);
    });
  });

  return Array.from(groups.values())
    .map(({ material, hasPlusVariant, grupoWebValues, submaterials }) => ({
      material,
      label: materialLabel(material, hasPlusVariant),
      grupoWebValues: Array.from(grupoWebValues.values()).sort(compareGrupoWeb),
      submaterials: Array.from(submaterials.values())
        .map(({ value, grupoWebValues: submaterialGrupoWebValues }) => ({
          value,
          label: value,
          grupoWebValues: Array.from(submaterialGrupoWebValues.values())
            .sort(compareGrupoWeb),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
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
  grupoWeb: string | null = null,
) {
  if (!material) return true;
  const materialKey = normalizeMaterial(materialGroupValue(material));
  const submaterialKey = submaterial ? normalizeMaterial(submaterial) : null;
  const grupoWebKey = grupoWeb ? normalizeMaterial(grupoWeb) : null;
  const classificationMatches = product.materialClassifications?.some(
    (value) =>
      normalizeMaterial(materialGroupValue(value.material)) === materialKey &&
      (!submaterialKey ||
        (value.submaterial && normalizeMaterial(value.submaterial) === submaterialKey)) &&
      (!grupoWebKey ||
        (value.grupoWebValues?.some(
          (candidate) => normalizeMaterial(candidate) === grupoWebKey,
        ) || (!!product.grupoWeb && normalizeMaterial(product.grupoWeb) === grupoWebKey))),
  );

  return classificationMatches ||
    (!submaterialKey &&
      !!product.material &&
      normalizeMaterial(materialGroupValue(product.material)) === materialKey &&
      (!grupoWebKey ||
        (!!product.grupoWeb && normalizeMaterial(product.grupoWeb) === grupoWebKey)));
}

export function grupoWebValuesForSelection(
  group: MaterialGroup,
  submaterial: string | null,
): string[] {
  if (!submaterial) return group.grupoWebValues;
  return group.submaterials.find(
    ({ value }) => normalizeMaterial(value) === normalizeMaterial(submaterial),
  )?.grupoWebValues ?? [];
}

export function isGrupoWebAvailable(
  group: MaterialGroup,
  submaterial: string | null,
  grupoWeb: string,
) {
  return grupoWebValuesForSelection(group, submaterial).some(
    (value) => normalizeMaterial(value) === normalizeMaterial(grupoWeb),
  );
}

export function submaterialsForGrupoWeb(
  group: MaterialGroup,
  grupoWeb: string,
): MaterialSubmaterial[] {
  const grupoWebKey = normalizeMaterial(grupoWeb);
  return group.submaterials.filter(({ grupoWebValues }) =>
    grupoWebValues.some(
      (value) => normalizeMaterial(value) === grupoWebKey,
    ),
  );
}

export function setMaterialSearchParams(
  current: URLSearchParams,
  material: string | null,
  submaterial: string | null,
  grupoWeb: string | null = null,
) {
  const next = new URLSearchParams(current);
  if (material) next.set("material", material);
  else next.delete("material");
  if (material && submaterial) next.set("submaterial", submaterial);
  else next.delete("submaterial");
  if (material && grupoWeb) next.set("grupoWeb", grupoWeb);
  else next.delete("grupoWeb");
  return next;
}
