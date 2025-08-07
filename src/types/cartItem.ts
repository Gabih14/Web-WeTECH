import { Product } from "./types";

export interface CartItem {
  product: Product;
  color: string;
  weight: number;
  quantity: number;
}