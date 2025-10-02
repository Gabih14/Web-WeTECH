// Configuración de descuentos por cantidad (legacy por compatibilidad)
export const QUANTITY_DISCOUNTS = {
  1: 0.15,    // 15% descuento base
  5: 0.17,    // 17% descuento por 5+ productos
  10: 0.20,   // 20% descuento por 10+ productos
  50: 0.22,   // 22% descuento por 50+ productos
};

// Reglas por categoría (extensible). Ejemplo: solo FILAMENTOS tiene descuentos.
// Puedes agregar otras categorías con su propia escala sin tocar componentes.
export const DISCOUNT_RULES: Record<string, { discounts: Record<number, number> } > = {
  FILAMENTOS: { discounts: { ...QUANTITY_DISCOUNTS } },
  // Otras categorías: agregar aquí si en el futuro aplican descuentos
  // "IMPRESORAS": { discounts: { 1: 0.05, 3: 0.08 } }
};

// Helper: obtener el mejor descuento dado un mapa {minQty: rate}
const getTieredDiscount = (discounts: Record<number, number>, quantity: number): number => {
  const thresholds = Object.keys(discounts)
    .map((k) => Number(k))
    .sort((a, b) => a - b);
  let rate = 0;
  for (const t of thresholds) {
    if (quantity >= t) rate = discounts[t];
  }
  return rate;
};

// API basada en producto/categoría
export const shouldApplyDiscount = (product: { category: string }): boolean => {
  return Boolean(DISCOUNT_RULES[product.category]);
};

export const getDiscountForQuantityForProduct = (product: { category: string }, quantity: number): number => {
  const rule = DISCOUNT_RULES[product.category];
  if (!rule) return 0;
  return getTieredDiscount(rule.discounts, quantity);
};

export const calculateDiscountedPriceForProduct = (
  product: { category: string },
  originalPrice: number,
  quantity: number
): number => {
  const rate = getDiscountForQuantityForProduct(product, quantity);
  if (!rate) return originalPrice;
  return originalPrice * (1 - rate);
};

export const getDiscountPercentageForProduct = (product: { category: string }, quantity: number): string => {
  const rate = getDiscountForQuantityForProduct(product, quantity);
  return `${Math.round(rate * 100)}%`;
};

export const isDiscountAppliedForProduct = (product: { category: string }, quantity: number): boolean => {
  return getDiscountForQuantityForProduct(product, quantity) > 0;
};

// Función para calcular el descuento basado en la cantidad
export const getDiscountForQuantity = (quantity: number): number => {
  if (quantity >= 50) return QUANTITY_DISCOUNTS[50];
  if (quantity >= 10) return QUANTITY_DISCOUNTS[10];
  if (quantity >= 5) return QUANTITY_DISCOUNTS[5];
  return QUANTITY_DISCOUNTS[1];
};

// Función para calcular el precio con descuento
export const calculateDiscountedPrice = (originalPrice: number, quantity: number): number => {
  const discount = getDiscountForQuantity(quantity);
  return originalPrice * (1 - discount);
};

// Función para obtener el porcentaje de descuento como string
export const getDiscountPercentage = (quantity: number): string => {
  const discount = getDiscountForQuantity(quantity);
  return `${Math.round(discount * 100)}%`;
};

// Función para calcular el ahorro total
export const calculateSavings = (originalPrice: number, quantity: number): number => {
  const discount = getDiscountForQuantity(quantity);
  return originalPrice * quantity * discount;
};

// Función para obtener el siguiente nivel de descuento
export const getNextDiscountLevel = (currentQuantity: number): { quantity: number; discount: string } | null => {
  if (currentQuantity < 5) {
    return { quantity: 5, discount: '17%' };
  }
  if (currentQuantity < 10) {
    return { quantity: 10, discount: '20%' };
  }
  if (currentQuantity < 50) {
    return { quantity: 50, discount: '22%' };
  }
  return null; // Ya está en el máximo nivel
};

// Versiones product-aware de ahorro y siguiente nivel
export const calculateSavingsForProduct = (
  product: { category: string },
  originalPrice: number,
  quantity: number
): number => {
  const rate = getDiscountForQuantityForProduct(product, quantity);
  return originalPrice * quantity * rate;
};

export const getNextDiscountLevelForProduct = (
  product: { category: string },
  currentQuantity: number
): { quantity: number; discount: string } | null => {
  const rule = DISCOUNT_RULES[product.category];
  if (!rule) return null;
  const thresholds = Object.keys(rule.discounts)
    .map((k) => Number(k))
    .sort((a, b) => a - b);
  for (const t of thresholds) {
    if (currentQuantity < t) {
      const rate = rule.discounts[t];
      return { quantity: t, discount: `${Math.round(rate * 100)}%` };
    }
  }
  return null;
};
