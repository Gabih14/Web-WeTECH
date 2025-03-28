export interface Product {
  id: string;
  name: string;
  description: string;
  image?: string; /* hay que sacarle la condicionalidad */
  category: string;
  subcategory?: string;
  weights?: {
    weight: number;
    price: number;
    promotionalPrice?: number;
  }[];
  price?: number;
  discountQuantity?: {[quantity: number]: number};
  promotionalPrice?: number;
  colors?: {
    name: string;
    hex: string;
    stock: { [weight: string]: number };
  }[];
  stock?: number;
  presentatio?: string;
  currency?: string;
}

export interface StkItem {
  id: string;
  descripcion: string;
  presentacion: string;
  tipo: string;
  grupo: string;
  subgrupo: string;
}

export interface StkExistencia {
  item: string;
  deposito: string;
  cantidad: string;
  produccion: string;
  comprometido: string;
  ubicacion: string;
}

export interface StkPrecio {
  lista: string;
  item: string;
  precioVta: string;
  moneda: string;
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