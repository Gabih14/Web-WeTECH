export type CheckoutLinePricing = {
  subtotalBruto: number;
  subtotalNeto: number;
  precioUnitarioNeto: number;
};

export const normalizeBackendBasePrice = (price: number): number =>
  Math.round(price);

export const calculateCheckoutLinePricing = (
  precioBaseUnitario: number,
  cantidad: number,
  descuentoPorcentaje: number
): CheckoutLinePricing => {
  if (cantidad <= 0) {
    return {
      subtotalBruto: 0,
      subtotalNeto: 0,
      precioUnitarioNeto: 0,
    };
  }

  const normalizedBasePrice =
    normalizeBackendBasePrice(precioBaseUnitario);
  const subtotalBruto = Math.round(normalizedBasePrice * cantidad);
  const subtotalNeto = Math.round(
    normalizedBasePrice *
      cantidad *
      (1 - descuentoPorcentaje / 100)
  );
  const precioUnitarioNeto = Math.round(subtotalNeto / cantidad);

  return {
    subtotalBruto,
    subtotalNeto,
    precioUnitarioNeto,
  };
};
