// Configuración de descuentos por cantidad
export const QUANTITY_DISCOUNTS = {
  1: 0.15,    // 15% descuento base
  5: 0.17,    // 17% descuento por 5+ productos
  10: 0.20,   // 20% descuento por 10+ productos
  50: 0.22,   // 22% descuento por 50+ productos
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
