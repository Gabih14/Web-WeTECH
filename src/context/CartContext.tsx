import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Product, CartItem, CartContextType } from "../types";
import { calculateDiscountedPriceForProduct } from "../utils/discounts";
import {
  canPurchaseWithStock,
  getFilamentVariantStock,
  isFilamentProduct,
} from "../utils/stockRules";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedItems = localStorage.getItem("cartItems");
    return savedItems ? JSON.parse(savedItems) : [];
  });

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(items));
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
          const availableStock = getFilamentVariantStock(product, color, weight);
          const alreadyInCart = existingItem?.quantity ?? 0;

          if (!canPurchaseWithStock(product, availableStock)) {
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
    localStorage.removeItem("cartItems");
  }, []);

  const calculateItemPrice = (item: CartItem) => {
    const weightData = item.product.weights?.find(
      (w) => w.weight === item.weight
    );
    const originalPrice = weightData ? weightData.price : item.product.price;
    
    if (originalPrice) {
      return calculateDiscountedPriceForProduct(
        item.product,
        originalPrice,
        item.quantity,
        item.weight
      );
    }
    
    return 0;
  };

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const itemPrice = calculateItemPrice(item);
      const itemTotal = itemPrice ? itemPrice * item.quantity : 0;
      return sum + itemTotal;
    }, 0);
  }, [items]);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
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
