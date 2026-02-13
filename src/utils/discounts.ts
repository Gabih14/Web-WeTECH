// Configuración de descuentos por cantidad (legacy por compatibilidad)
export const QUANTITY_DISCOUNTS = {
  1: 0.15,    // 15% descuento base
  5: 0.17,    // 17% descuento por 5+ productos
  10: 0.20,   // 20% descuento por 10+ productos
  50: 0.22,   // 22% descuento por 50+ productos
};

// Descuento base para todos los filamentos por transferencia
export const BASE_FILAMENT_DISCOUNT = 0.15; // 15%

// Marcas elegibles para descuentos por cantidad (solo filamentos de 1kg)
export const ELIGIBLE_BRANDS_FOR_QUANTITY_DISCOUNT = [
  "3N3-PLA",
  "GRILON3-PLA BOUTIQUE",
  "GRILON3-PLA",
  "GST3D-PLA",
  "HELLBOT-PLA",
  "3NMAX-PLA",
  "FREMOVER-PLA"
] as const;

// Categorías que comparten la misma regla de descuento (aceptamos legacy y nuevo nombre)
const FILAMENT_CATEGORIES = ["FILAMENTO 3D", "FILAMENTOS"] as const;

// Reglas por categoría (extensible). Ejemplo: solo filamentos tienen descuentos.
// Puedes agregar otras categorías con su propia escala sin tocar componentes.
export const DISCOUNT_RULES: Record<string, { discounts: Record<number, number> }> = {
  ...FILAMENT_CATEGORIES.reduce((acc, key) => {
    acc[key] = { discounts: { ...QUANTITY_DISCOUNTS } };
    return acc;
  }, {} as Record<string, { discounts: Record<number, number> }>),
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

// Verificar si un producto es elegible para descuentos por cantidad
export const isEligibleForQuantityDiscount = (
  product: { id: string; category: string },
  weight: number
): boolean => {
  // Debe ser filamento
  if (!shouldApplyDiscount(product)) return false;
  
  // Debe ser de 1kg
  if (weight !== 1) return false;
  
  // Debe ser de una marca elegible (comparación exacta)
  const productId = product.id.toUpperCase();
  return ELIGIBLE_BRANDS_FOR_QUANTITY_DISCOUNT.some(
    brand => productId === brand
  );
};

export const getDiscountForQuantityForProduct = (product: { category: string }, quantity: number): number => {
  const rule = DISCOUNT_RULES[product.category];
  if (!rule) return 0;
  return getTieredDiscount(rule.discounts, quantity);
};

export const calculateDiscountedPriceForProduct = (
  product: { id: string; category: string },
  originalPrice: number,
  quantity: number,
  weight?: number
): number => {
  // Si no es filamento, no aplicar descuento
  if (!shouldApplyDiscount(product)) return originalPrice;
  
  // Si es elegible para descuentos por cantidad (1kg de marcas específicas)
  if (weight !== undefined && isEligibleForQuantityDiscount(product, weight)) {
    const rate = getDiscountForQuantityForProduct(product, quantity);
    return originalPrice * (1 - rate);
  }
  
  // Si es filamento pero no elegible para descuentos por cantidad, aplicar solo descuento base del 15%
  return originalPrice * (1 - BASE_FILAMENT_DISCOUNT);
};

export const getDiscountPercentageForProduct = (
  product: { id: string; category: string },
  quantity: number,
  weight?: number
): string => {
  if (!shouldApplyDiscount(product)) return '0%';
  
  // Si es elegible para descuentos por cantidad
  if (weight !== undefined && isEligibleForQuantityDiscount(product, weight)) {
    const rate = getDiscountForQuantityForProduct(product, quantity);
    return `${Math.round(rate * 100)}%`;
  }
  
  // Si es filamento pero no elegible, mostrar descuento base
  return `${Math.round(BASE_FILAMENT_DISCOUNT * 100)}%`;
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
  product: { id: string; category: string },
  originalPrice: number,
  quantity: number,
  weight?: number
): number => {
  if (!shouldApplyDiscount(product)) return 0;
  
  // Si es elegible para descuentos por cantidad
  if (weight !== undefined && isEligibleForQuantityDiscount(product, weight)) {
    const rate = getDiscountForQuantityForProduct(product, quantity);
    return originalPrice * quantity * rate;
  }
  
  // Si es filamento pero no elegible, calcular ahorro con descuento base
  return originalPrice * quantity * BASE_FILAMENT_DISCOUNT;
};

export const getNextDiscountLevelForProduct = (
  product: { id: string; category: string },
  currentQuantity: number,
  weight?: number
): { quantity: number; discount: string } | null => {
  // Solo mostrar siguiente nivel si es elegible para descuentos por cantidad
  if (weight === undefined || !isEligibleForQuantityDiscount(product, weight)) {
    return null;
  }
  
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
