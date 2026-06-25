import { roundPrice } from "./money";

export type FacturaTipo = "none" | "A" | "B";

// IVA general para factura A/B. Cuando se incorporen impresoras al carrito,
// no deben usar esta alicuota: las impresoras llevan IVA del 10.5%.
export const INVOICE_SURCHARGE_RATE = 0.21;

export const requiresInvoice = (facturaTipo: FacturaTipo): facturaTipo is "A" | "B" =>
  facturaTipo === "A" || facturaTipo === "B";

export const round2 = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const calculateInvoiceTotal = (subtotalSinIva: number) => {
  const iva = round2(subtotalSinIva * INVOICE_SURCHARGE_RATE);
  const total = round2(subtotalSinIva + iva);

  return { iva, total };
};

export const calculateInvoiceSurcharge = (
  amount: number,
  facturaTipo: FacturaTipo
): number => {
  if (!requiresInvoice(facturaTipo)) return 0;

  return roundPrice(amount * INVOICE_SURCHARGE_RATE);
};

export const applyInvoiceSurcharge = (
  amount: number,
  facturaTipo: FacturaTipo
): number => {
  if (!requiresInvoice(facturaTipo)) return roundPrice(amount);

  return roundPrice(amount * (1 + INVOICE_SURCHARGE_RATE));
};
