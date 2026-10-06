import type { CartItem, Product } from "../types";

const keyOf = (weight: number) => weight.toString();

export function getVariantWholesalePrice(product: Product, color: string, weight: number) {
  const colorPrice = product.colors
    ?.find((variant) => variant.name.toLowerCase() === color.toLowerCase())
    ?.wholesalePrices?.[keyOf(weight)];
  const weightPrice = product.weights?.find((variant) => variant.weight === weight)?.wholesalePrice;
  return product.isWholesaleCatalog ? colorPrice ?? weightPrice : undefined;
}

export function getWholesaleCartState(items: CartItem[]) {
  const minimumPurchase = items.find((item) => item.product.isWholesaleCatalog)
    ?.product.wholesaleMinimumPurchase ?? 0;
  const subtotal = items.reduce((sum, item) =>
    sum + (getVariantWholesalePrice(item.product, item.color, item.weight) ?? 0) * item.quantity, 0);
  return {
    isWholesale: minimumPurchase > 0,
    minimumPurchase,
    subtotal,
    missing: Math.max(0, minimumPurchase - subtotal),
    canCheckout: minimumPurchase === 0 || subtotal >= minimumPurchase,
  };
}

export function stripWholesaleProduct(product: Product): Product {
  return {
    ...product,
    price: product.retailPrice ?? product.price,
    isWholesaleCatalog: false,
    wholesalePriceFrom: undefined,
    wholesaleMinimumPurchase: undefined,
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
