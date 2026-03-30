import { CartItem, Product } from "../types";
import {
  canPurchaseWithStock,
  getFilamentVariantStock,
  isFilamentProduct,
} from "./stockRules";

export function getFirstColorWithStock(product: Product): string | null {
  if (!product.colors || !product.weights) {
    return product.colors?.[0]?.name ?? null;
  }

  const defaultWeight = product.weights[0]?.weight ?? 0;
  const firstInStock = product.colors.find(
    (color) => (color.stock[defaultWeight.toString()] ?? 0) > 0
  );

  return firstInStock?.name ?? product.colors[0]?.name ?? null;
}

export function getVariantStock(
  product: Product,
  color: string | null,
  weight: number | null
): number {
  if (color && weight !== null) {
    if (isFilamentProduct(product)) {
      return getFilamentVariantStock(product, color, weight);
    }

    return (
      product.colors?.find((variantColor) => variantColor.name === color)?.stock[
        weight.toString()
      ] ?? 0
    );
  }

  return product.stock ?? 0;
}

export function getCartQuantityForVariant(
  items: CartItem[],
  productId: string,
  color: string | null,
  weight: number | null
): number {
  const selectedColor = color ?? "";
  const selectedWeight = weight ?? 0;

  return (
    items.find(
      (item) =>
        item.product.id === productId &&
        item.color === selectedColor &&
        item.weight === selectedWeight
    )?.quantity ?? 0
  );
}

export function getPurchaseState(params: {
  product: Product;
  items: CartItem[];
  selectedColor: string | null;
  selectedWeight: number | null;
  quantity: number;
}) {
  const { product, items, selectedColor, selectedWeight, quantity } = params;

  const availableStock = getVariantStock(product, selectedColor, selectedWeight);
  const cartQuantity = getCartQuantityForVariant(
    items,
    product.id,
    selectedColor,
    selectedWeight
  );
  const canAddToCart = canPurchaseWithStock(product, availableStock);
  const isOverStock = quantity + cartQuantity > availableStock;

  return {
    availableStock,
    cartQuantity,
    canAddToCart,
    isOverStock,
  };
}
