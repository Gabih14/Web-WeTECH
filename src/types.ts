export interface Product {
  id: string;
  name: string;
  description: string;
  observaciones?: string;
  image: string; // Imagen principal (primera del array)
  images?: string[]; // Array de todas las imágenes
  brand?: string;
  category: string;
  subcategory?: string;
  weights?: {
    weight: number;
    price: number;
    invoicePrice?: number;
    promotionalPrice?: number;
  }[];
  price?: number;
  invoicePrice?: number;
  discountQuantity?: { [quantity: number]: number };
  promotionalPrice?: number;
  colors?: {
    name: string;
    hex: string;
    colorGroup?: ColorGroup;
    stock: { [weight: string]: number };
    prices?: { [weight: string]: number };
    invoicePrices?: { [weight: string]: number };
    promotionalPrices?: { [weight: string]: number };
    itemIds?: { [weight: string]: string };
    images?: string[]; // Imágenes específicas por color
    itemId?: string; // ID original del ítem para este color (variante)
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
  clearCart: () => void;
  total: number;
}

export interface ShippingCost {
  distances: [InitialDistance: number, FinalDistance: number];
  cost: number;
}

export interface Coupon {
  code: string;
  porcentajeDescuento: number;
  porcentajeDescuentoTarjeta?: number;
  porcentajeDescuentoTransferencia?: number;
  activo: boolean;
  fechaDesde: Date;
  fechaHasta: Date;
  descripcion?: string;
}

export interface Colors {
  id?: number;
  name: string;
  hex: string;
  colorGroupId?: number | null;
  colorGroup?: ColorGroup;
}

export interface ColorGroup {
  id: number;
  name: string;
  hex: string | null;
  sortOrder: number;
}
