import { Product } from "../types";

export const FILAMENT_MIN_STOCK_TO_PURCHASE = 2;

export const isFilamentProduct = (product: Product): boolean =>
  product.category === "FILAMENTO 3D";

export const getFilamentVariantStock = (
  product: Product,
  color: string,
  weight: number
): number => {
  if (!isFilamentProduct(product)) {
    return product.stock ?? 0;
  }

  return (
    product.colors?.find((variantColor) => variantColor.name === color)?.stock[
      weight.toString()
    ] ?? 0
  );
};

export const canPurchaseWithStock = (product: Product, availableStock: number): boolean => {
  if (isFilamentProduct(product)) {
    return availableStock >= FILAMENT_MIN_STOCK_TO_PURCHASE;
  }

  return availableStock > 0;
};