export type FacturaTipo = "none" | "A" | "B";

export const INVOICE_SURCHARGE_RATE = 0.21;

export const requiresInvoice = (facturaTipo: FacturaTipo): facturaTipo is "A" | "B" =>
  facturaTipo === "A" || facturaTipo === "B";

export const round2 = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const applyInvoiceTax = (amount: number): number =>
  round2(amount * (1 + INVOICE_SURCHARGE_RATE));

export const roundPeso = (value: number): number => Math.round(value);

export const calculateInvoiceLine = ({
  precioMinoristaConIva,
  cantidad,
  descuentoPorcentaje,
  subtotalSAOverride,
}: {
  precioMinoristaConIva: number;
  cantidad: number;
  descuentoPorcentaje: number;
  subtotalSAOverride?: number;
}) => {
  if (cantidad <= 0) {
    return {
      precio_unitario: 0,
      subtotal: 0,
      ajuste_porcentaje: descuentoPorcentaje,
      subtotalFinal: 0,
      ajuste: 0,
      netoFinal: 0,
      iva: 0,
    };
  }

  const ivaFactor = 1 + INVOICE_SURCHARGE_RATE;
  const descuentoFactor = 1 - descuentoPorcentaje / 100;
  const subtotalSA =
    subtotalSAOverride !== undefined
      ? round2(subtotalSAOverride)
      : applyInvoiceTax(precioMinoristaConIva * cantidad);
  const brutoFinalPrevio = round2(subtotalSA * descuentoFactor);
  const netoFinal = roundPeso(brutoFinalPrevio / ivaFactor);
  const iva = round2(netoFinal * INVOICE_SURCHARGE_RATE);
  const subtotalFinal = round2(netoFinal + iva);
  const precioUnitario = round2(subtotalFinal / cantidad);
  const ajuste = round2(subtotalSA - subtotalFinal);

  return {
    precio_unitario: precioUnitario,
    subtotal: subtotalSA,
    ajuste_porcentaje: descuentoPorcentaje,
    subtotalFinal,
    ajuste,
    netoFinal,
    iva,
  };
};
