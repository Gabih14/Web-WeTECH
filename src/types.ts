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
  }[];
}

export type Category = {
  name: string;
  id: string;
  subcategories?: { name: string; id: string }[];
};