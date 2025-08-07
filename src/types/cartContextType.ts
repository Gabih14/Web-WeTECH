import { CartItem } from "./cartItem";
import { Product } from "./product";

export interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: Product,
    color: string,
    weight: number,
    quantity: number
  ) => void;
  removeFromCart: (productId: string, color: string, weight: number) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    color: string,
    weight: number
  ) => void;
  total: number;
}