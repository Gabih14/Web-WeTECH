import type { CartItem, Product } from "../types";
import { isFilamentProduct } from "./cartPurchase";

const keyOf = (weight: number) => weight.toString();
export const formatKg = (value: number) => value.toLocaleString("es-AR", { maximumFractionDigits: 3 });

export function getVariantWholesalePrice(product: Product, color: string, weight: number) {
  if (!isFilamentProduct(product)) return undefined;
  const colorPrice = product.colors
    ?.find((variant) => variant.name.toLowerCase() === color.toLowerCase())
    ?.wholesalePrices?.[keyOf(weight)];
  const weightPrice = product.weights?.find((variant) => variant.weight === weight)?.wholesalePrice;
  return product.isWholesaleCatalog ? colorPrice ?? weightPrice : undefined;
}

export function getWholesaleCartState(items: CartItem[]) {
  const minimumPurchaseKg = items.find((item) => item.product.isWholesaleCatalog)
    ?.product.wholesaleMinimumPurchaseKg ?? 0;
  const filamentKg = items.reduce((sum, item) => {
    if (!isFilamentProduct(item.product)) return sum;
    const pesoKg = item.product.weights?.find((variant) => variant.weight === item.weight)?.pesoKg ?? 0;
    return sum + pesoKg * item.quantity;
  }, 0);
  return {
    isWholesale: minimumPurchaseKg > 0,
    minimumPurchaseKg,
    filamentKg,
    missingKg: Math.max(0, minimumPurchaseKg - filamentKg),
    reached: minimumPurchaseKg > 0 && filamentKg >= minimumPurchaseKg,
    canCheckout: true,
  };
}

export function stripWholesaleProduct(product: Product): Product {
  return {
    ...product,
    price: product.retailPrice ?? product.price,
    isWholesaleCatalog: false,
    wholesalePriceFrom: undefined,
    wholesaleMinimumPurchaseKg: undefined,
    weights: product.weights?.map(({ wholesalePrice: _wholesalePrice, ...weight }) => ({
      ...weight,
      price: weight.retailPrice ?? weight.price,
    })),
    colors: product.colors?.map(({ wholesalePrices: _wholesalePrices, ...color }) => ({
      ...color,
      prices: color.retailPrices ?? color.prices,
    })),
  };
}

export const shouldFallbackFromWholesaleStatus = (status: number) => status === 401 || status === 403;
