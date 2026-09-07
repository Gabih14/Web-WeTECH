export const DEFAULT_SITE_URL: string;
export const STRUCTURED_DATA_ID: string;
export function absoluteHttpUrl(value: unknown, siteUrl?: string): string | undefined;
export function serializeStructuredData(value: unknown): string;
export interface ProductSchemaInput {
  name: string;
  url: string;
  description?: string;
  image?: string;
  sku?: string;
  brand?: string;
  category?: string;
  currency?: string;
  price?: number;
  stock?: number;
}
export function buildProductSchema(product: ProductSchemaInput, siteUrl?: string): Record<string, unknown> | null;
