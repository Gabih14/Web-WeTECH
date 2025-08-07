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
  discountQuantity?: { [quantity: number]: number };
  promotionalPrice?: number;
  colors?: {
    name: string;
    hex: string;
    stock: { [weight: string]: number };
  }[];
  stock?: number;
}