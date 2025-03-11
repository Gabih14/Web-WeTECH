export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  subcategory?: string;
  weights?: {
    weight: number;
    price: number;
    promotionalPrice?: number;
  }[];
  price?: number;
  promotionalPrice?: number;
  colors?: {
    name: string;
    hex: string;
    stock: { [weight: string]: number };
  }[];
  stock?: number;
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