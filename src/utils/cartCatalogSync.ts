import { CartItem, Product } from "../types";
import { getCartItemPrice, getVariantItemId } from "./pricing";

const weightKey = (weight: number) => weight.toString();

const findProductByVariantItemId = (
  products: Product[],
  itemId: string,
  weight: number
): Product | undefined => {
  const key = weightKey(weight);

  return products.find((product) => {
    if (product.id === itemId) return true;

    return product.colors?.some((color) => {
      return color.itemIds?.[key] === itemId || color.itemId === itemId;
    });
  });
};

const sameCartPricingSnapshot = (currentItem: CartItem, freshProduct: Product) => {
  const currentItemId = getVariantItemId(
    currentItem.product,
    currentItem.color,
    currentItem.weight
  );
  const freshItemId = getVariantItemId(
    freshProduct,
    currentItem.color,
    currentItem.weight
  );
  const currentPrice = getCartItemPrice(currentItem);
  const freshPrice = getCartItemPrice({
    ...currentItem,
    product: freshProduct,
  });

  return currentItemId === freshItemId && currentPrice === freshPrice;
};

export type CartCatalogSyncResult = {
  items: CartItem[];
  removedItems: CartItem[];
  updatedItems: CartItem[];
  hasChanges: boolean;
};

export const syncCartItemsWithCatalog = (
  cartItems: CartItem[],
  products: Product[]
): CartCatalogSyncResult => {
  const removedItems: CartItem[] = [];
  const updatedItems: CartItem[] = [];
  const items: CartItem[] = [];

  cartItems.forEach((item) => {
    const currentItemId = getVariantItemId(
      item.product,
      item.color,
      item.weight
    );
    const freshProduct =
      findProductByVariantItemId(products, currentItemId, item.weight) ??
      products.find((product) => product.id === item.product.id);

    if (!freshProduct) {
      removedItems.push(item);
      return;
    }

    const freshItem = {
      ...item,
      product: freshProduct,
    };

    if (!sameCartPricingSnapshot(item, freshProduct)) {
      updatedItems.push(freshItem);
    }

    items.push(freshItem);
  });

  return {
    items,
    removedItems,
    updatedItems,
    hasChanges: removedItems.length > 0 || updatedItems.length > 0,
  };
};
