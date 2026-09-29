import type { ShippingQuote } from "../types";

export type ShippingAddress = {
  street: string;
  number: string;
  addressWithoutNumber: boolean;
  city: string;
  postalCode: string;
};

const normalizeLocationPart = (value: string): string =>
  value.trim().replace(/\s+/g, " ").toLocaleLowerCase("es-AR");

export const buildShippingAddressFingerprint = (
  address: ShippingAddress
): string =>
  [
    address.street,
    address.addressWithoutNumber ? "s/n" : address.number,
    address.city,
    address.postalCode,
  ]
    .map(normalizeLocationPart)
    .join("|");

export const isShippingQuoteCurrent = (
  quote: ShippingQuote | null,
  address: ShippingAddress,
  province = "Mendoza"
): quote is ShippingQuote =>
  Boolean(
    quote &&
      Number.isFinite(quote.distanciaEnvio) &&
      quote.distanciaEnvio >= 0 &&
      quote.itemId.trim() &&
      Number.isFinite(quote.costoTotal) &&
      quote.costoTotal >= 0 &&
      normalizeLocationPart(quote.provinciaEnvio) ===
        normalizeLocationPart(province) &&
      normalizeLocationPart(quote.departamentoEnvio) ===
        normalizeLocationPart(address.city) &&
      quote.addressFingerprint === buildShippingAddressFingerprint(address)
  );

export const buildShippingOrderPayloadFields = (
  deliveryMethod: "pickup" | "shipping",
  quote: ShippingQuote | null,
  effectiveShippingCost: number
): {
  costo_envio: number;
  distancia_envio?: number;
  provincia_envio?: string;
  departamento_envio?: string;
} => {
  if (deliveryMethod === "pickup" || !quote) {
    return { costo_envio: 0 };
  }

  return {
    costo_envio: effectiveShippingCost,
    distancia_envio: quote.distanciaEnvio,
    provincia_envio: quote.provinciaEnvio,
    departamento_envio: quote.departamentoEnvio,
  };
};
