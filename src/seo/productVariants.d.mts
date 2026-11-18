import type { Product } from "../types";
interface ProductVariant {
  color: string;
  weight: number;
  stock: number;
  sku?: string;
  price?: number;
  image: string;
}
export function getProductVariants(product: Product): ProductVariant[];
export function findSeoCatalogProduct(products: Product[], seoProduct?: { id: string; nombre: string } | null): Product | undefined;
export function getLinkedVariant(product: Product, seoProduct?: { fotoUrl: string } | null, search?: string): ProductVariant | null;
export function buildProductGroupSchema(product: Product, url: string, siteUrl: string): Record<string, unknown> | null;
