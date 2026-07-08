import { CartItem, Product } from "../types";

const weightKey = (weight: number | null | undefined) =>
  weight === null || weight === undefined ? "" : weight.toString();

const getColorVariant = (product: Product, color: string | null | undefined) => {
  if (!color) {
    return undefined;
  }

  return product.colors?.find(
    (variantColor) => variantColor.name.toLowerCase() === color.toLowerCase()
  );
};

export function getVariantPrice(
  product: Product,
  color: string | null | undefined,
  weight: number | null | undefined
): number | undefined {
  const key = weightKey(weight);
  const colorPrice = getColorVariant(product, color)?.prices?.[key];

  if (colorPrice !== undefined) {
    return colorPrice;
  }

  const weightData =
    weight !== null && weight !== undefined
      ? product.weights?.find((variantWeight) => variantWeight.weight === weight)
      : undefined;

  return weightData?.price ?? product.price;
}

export function getVariantInvoicePrice(
  product: Product,
  color: string | null | undefined,
  weight: number | null | undefined
): number | undefined {
  const key = weightKey(weight);
  const colorPrice = getColorVariant(product, color)?.invoicePrices?.[key];

  if (colorPrice !== undefined) {
    return colorPrice;
  }

  const weightData =
    weight !== null && weight !== undefined
      ? product.weights?.find((variantWeight) => variantWeight.weight === weight)
      : undefined;

  return weightData?.invoicePrice ?? product.invoicePrice ?? getVariantPrice(product, color, weight);
}

export function getVariantPromotionalPrice(
  product: Product,
  color: string | null | undefined,
  weight: number | null | undefined
): number | undefined {
  const key = weightKey(weight);
  const colorPromotionalPrice = getColorVariant(product, color)?.promotionalPrices?.[key];

  if (colorPromotionalPrice !== undefined) {
    return colorPromotionalPrice;
  }

  const weightData =
    weight !== null && weight !== undefined
      ? product.weights?.find((variantWeight) => variantWeight.weight === weight)
      : undefined;

  return weightData?.promotionalPrice ?? product.promotionalPrice;
}

export function getVariantItemId(
  product: Product,
  color: string | null | undefined,
  weight: number | null | undefined
): string {
  const key = weightKey(weight);
  const colorVariant = getColorVariant(product, color);

  return colorVariant?.itemIds?.[key] ?? colorVariant?.itemId ?? product.itemId ?? product.id;
}

export function getCartItemPrice(item: CartItem): number | undefined {
  return getVariantPrice(item.product, item.color, item.weight);
}
