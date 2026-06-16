import { roundPrice } from "./money";

export type CheckoutLinePricing = {
  subtotalBruto: number;
  subtotalNeto: number;
  precioUnitarioNeto: number;
};

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

  const subtotalBruto = roundPrice(precioBaseUnitario * cantidad);
  const subtotalNeto = roundPrice(
    precioBaseUnitario * cantidad * (1 - descuentoPorcentaje / 100)
  );
  const precioUnitarioNeto = roundPrice(subtotalNeto / cantidad);

  return {
    subtotalBruto,
    subtotalNeto,
    precioUnitarioNeto,
  };
};
