export interface CatalogFacetValue {
  valor: string;
  color: string | null;
}

export interface CatalogFacet {
  clase: string;
  valores: CatalogFacetValue[];
}

const normalizeFacetValue = (value: string) =>
  value.trim().toLocaleUpperCase();

export function valuesForFacet(facets: CatalogFacet[], facetClass: string) {
  const wantedClass = normalizeFacetValue(facetClass);
  const values = new Map<string, string>();

  facets
    .filter(({ clase }) => normalizeFacetValue(clase) === wantedClass)
    .flatMap(({ valores }) => valores)
    .forEach(({ valor }) => {
      const cleanValue = valor?.trim();
      if (!cleanValue) return;
      const key = normalizeFacetValue(cleanValue);
      if (!values.has(key)) values.set(key, cleanValue);
    });

  return Array.from(values.values());
}

