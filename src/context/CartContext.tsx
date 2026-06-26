import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Product, CartItem, CartContextType } from "../types";
import {
  calculateDiscountedLineTotalForProduct,
  getEffectiveQuantityForProductDiscount,
  getEligibleQuantityDiscountCartQuantity,
} from "../utils/discounts";
import {
  getVariantStock,
  isFilamentProduct,
} from "../utils/cartPurchase";
import { syncCartItemsWithCatalog } from "../utils/cartCatalogSync";
import { getCartItemPrice } from "../utils/pricing";

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "cartItems";

const getStoredCartItems = (): CartItem[] => {
  try {
    const savedItems = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!savedItems) return [];

    const parsedItems = JSON.parse(savedItems);
    if (!Array.isArray(parsedItems)) return [];

    return parsedItems.filter((item): item is CartItem => {
      return (
        item &&
        typeof item === "object" &&
        item.product &&
        typeof item.product.id === "string" &&
        typeof item.color === "string" &&
        typeof item.weight === "number" &&
        typeof item.quantity === "number"
      );
    });
  } catch (error) {
    console.warn("No se pudo leer el carrito guardado. Se inicia vacío.", error);
    return [];
  }
};

const persistCartItems = (items: CartItem[]) => {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn("No se pudo guardar el carrito.", error);
  }
};

const removeStoredCartItems = () => {
  try {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.warn("No se pudo borrar el carrito guardado.", error);
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(getStoredCartItems);

  useEffect(() => {
    persistCartItems(items);
  }, [items]);

  const addToCart = useCallback(
    (product: Product, color: string, weight: number, quantity: number) => {
      setItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) =>
            item.product.id === product.id &&
            item.color === color &&
            item.weight === weight
        );

        if (isFilamentProduct(product)) {
          const availableStock = getVariantStock(product, color, weight);
          const alreadyInCart = existingItem?.quantity ?? 0;

          if (availableStock <= 0) {
            return currentItems;
          }

          if (alreadyInCart + quantity > availableStock) {
            return currentItems;
          }
        }

        if (existingItem) {
          return currentItems.map((item) =>
            item.product.id === product.id &&
            item.color === color &&
            item.weight === weight
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                }
              : item
          );
        }
        return [
          ...currentItems,
          {
            product,
            color,
            weight,
            quantity,
          },
        ];
      });
    },
    []
  );

  const removeFromCart = useCallback(
    (productId: string, color: string, weight: number) => {
      setItems((currentItems) =>
        currentItems.filter(
          (item) =>
            !(
              item.product.id === productId &&
              item.color === color &&
              item.weight === weight
            )
        )
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, color: string, weight: number) => {
      setItems((currentItems) =>
        currentItems
          .map((item) => {
            if (
              item.product.id === productId &&
              item.color === color &&
              item.weight === weight
            ) {
              return {
                ...item,
                quantity: Math.max(1, quantity),
              };
            }
            return item;
          })
          .filter((item) => item.quantity > 0)
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
    removeStoredCartItems();
  }, []);

  const syncCartWithProducts = useCallback((products: Product[]) => {
    const result = syncCartItemsWithCatalog(items, products);

    if (result.hasChanges) {
      setItems(result.items);
    }

    return {
      removedItems: result.removedItems,
      updatedItems: result.updatedItems,
      hasChanges: result.hasChanges,
    };
  }, [items]);

  const eligibleQuantityDiscountCartQuantity = useMemo(
    () => getEligibleQuantityDiscountCartQuantity(items),
    [items]
  );

  const calculateItemTotal = (item: CartItem) => {
    const originalPrice = getCartItemPrice(item);
    
    if (originalPrice) {
      const effectiveQuantity = getEffectiveQuantityForProductDiscount(
        item.product,
        item.quantity,
        item.weight,
        eligibleQuantityDiscountCartQuantity
      );

      return calculateDiscountedLineTotalForProduct(
        item.product,
        originalPrice,
        item.quantity,
        item.weight,
        effectiveQuantity
      );
    }
    
    return 0;
  };

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + calculateItemTotal(item);
    }, 0);
  }, [items, eligibleQuantityDiscountCartQuantity]);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncCartWithProducts,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
