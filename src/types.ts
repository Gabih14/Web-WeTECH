export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  subcategory?: string;
  weights?: number[];
  colors?: {
    name: string;
    hex: string;
    stock: { [weight: string]: number };
  }[];
  stock?: number; // Añadir esta línea para incluir el stock general
}

export type Category = {
  name: string;
  id: string;
  subcategories?: { name: string; id: string }[];
};

export interface CartItem {
  product: Product;
  color: string;
  weight: number;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, color: string, weight: number, quantity: number) => void;
  removeFromCart: (productId: string, color: string, weight: number) => void;
  updateQuantity: (productId: string, quantity: number, color: string, weight: number) => void;
  total: number;
}