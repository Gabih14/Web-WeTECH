import { apiFetch } from "./api";
import type { CatalogFacet } from "../utils/catalogFacets";

export async function fetchCatalogFacets(): Promise<CatalogFacet[]> {
  const response = await apiFetch("/stk-item/atributos/facetas");
  return Array.isArray(response) ? response as CatalogFacet[] : [];
}
