import {
  calculateCheckoutLinePricing,
  normalizeBackendBasePrice,
} from "./checkoutPricing";
import {
  calculateInvoiceLine,
  FacturaTipo,
  INVOICE_SURCHARGE_RATE,
  requiresInvoice,
  round2,
} from "./invoice";

export type OrderLineAmounts = {
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  ajuste_porcentaje: number;
};

export type NamedOrderLine = OrderLineAmounts & {
  nombre: string;
};

export type OrderProductPricingInput = {
  nombre: string;
  cantidad: number;
  precioBaseUnitario: number;
  ajustePorcentaje: number;
  couponApplied?: boolean;
};

export const isShippingProductName = (name: string): boolean =>
  /^ENV-\d+K-GM-DELIVERY$/i.test(name);

type CalculatedOrderProduct = {
  line: OrderLineAmounts;
  netSubtotal: number;
  couponDiscount: number;
};

const calculateOrderProduct = ({
  cantidad,
  precioBaseUnitario,
  ajustePorcentaje,
  couponApplied = false,
  facturaTipo = "none",
}: Omit<OrderProductPricingInput, "nombre"> & {
  facturaTipo?: FacturaTipo;
}): CalculatedOrderProduct => {
  if (requiresInvoice(facturaTipo)) {
    const normalizedBasePrice =
      normalizeBackendBasePrice(precioBaseUnitario);
    const invoiceLine = calculateInvoiceLine({
      precioMinoristaConIva: normalizedBasePrice,
      cantidad,
      descuentoPorcentaje: ajustePorcentaje,
    });

    return {
      line: {
        cantidad,
        precio_unitario: invoiceLine.precio_unitario,
        // El backend valida el subtotal bruto con IVA previo al descuento.
        subtotal: invoiceLine.subtotal,
        ajuste_porcentaje: ajustePorcentaje,
      },
      netSubtotal: invoiceLine.netoFinal,
      couponDiscount: couponApplied
        ? Math.round(
            normalizedBasePrice * cantidad - invoiceLine.netoFinal
          )
        : 0,
    };
  }

  const pricing = calculateCheckoutLinePricing(
    precioBaseUnitario,
    cantidad,
    ajustePorcentaje
  );
  const normalizedBasePrice =
    normalizeBackendBasePrice(precioBaseUnitario);

  return {
    line: {
      cantidad,
      precio_unitario: pricing.precioUnitarioNeto,
      subtotal: pricing.subtotalNeto,
      ajuste_porcentaje: ajustePorcentaje,
    },
    netSubtotal: pricing.subtotalNeto,
    couponDiscount: couponApplied
      ? Math.round(
          normalizedBasePrice * cantidad - pricing.subtotalNeto
        )
      : 0,
  };
};

export const calculateOrderLineAmounts = (
  input: Omit<OrderProductPricingInput, "nombre"> & {
    facturaTipo?: FacturaTipo;
  }
): OrderLineAmounts => calculateOrderProduct(input).line;

export const calculateShippingLineAmounts = ({
  shippingCost,
  ajustePorcentaje = 0,
  facturaTipo = "none",
}: {
  shippingCost: number;
  ajustePorcentaje?: number;
  facturaTipo?: FacturaTipo;
}): OrderLineAmounts =>
  ajustePorcentaje === 100
    ? {
        cantidad: 1,
        precio_unitario: requiresInvoice(facturaTipo)
          ? round2(shippingCost)
          : Math.round(shippingCost),
        subtotal: 0,
        ajuste_porcentaje: 100,
      }
    : calculateOrderProduct({
        cantidad: 1,
        precioBaseUnitario: requiresInvoice(facturaTipo)
          ? round2(shippingCost)
          : Math.round(shippingCost),
        ajustePorcentaje,
        couponApplied: false,
        facturaTipo,
      }).line;

export const calculateOrderTotal = (
  netProductSubtotals: number[],
  netShippingCost: number,
  facturaTipo: FacturaTipo = "none"
): number => {
  const normalizedShippingCost = requiresInvoice(facturaTipo)
    ? round2(netShippingCost)
    : Math.round(netShippingCost);
  const subtotal =
    netProductSubtotals.reduce((sum, lineSubtotal) => {
      return sum + lineSubtotal;
    }, 0) + normalizedShippingCost;

  if (!requiresInvoice(facturaTipo)) {
    return subtotal;
  }

  const subtotalSinIva = round2(subtotal);
  const ivaImporte = round2(
    subtotalSinIva * INVOICE_SURCHARGE_RATE
  );
  return round2(subtotalSinIva + ivaImporte);
};

const hasAtMostTwoDecimals = (value: number): boolean =>
  Math.abs(value * 100 - Math.round(value * 100)) < 1e-8;

export const hasValidOrderLineAmounts = (
  lines: OrderLineAmounts[],
  facturaTipo: FacturaTipo = "none"
): boolean =>
  lines.every((line) => {
    const commonFieldsAreValid =
      Number.isInteger(line.cantidad) &&
      line.cantidad > 0 &&
      Number.isFinite(line.precio_unitario) &&
      line.precio_unitario >= 0 &&
      Number.isFinite(line.subtotal) &&
      line.subtotal >= 0 &&
      Number.isFinite(line.ajuste_porcentaje) &&
      line.ajuste_porcentaje >= 0 &&
      line.ajuste_porcentaje <= 100;

    if (!commonFieldsAreValid) return false;

    if (requiresInvoice(facturaTipo)) {
      return (
        hasAtMostTwoDecimals(line.precio_unitario) &&
        hasAtMostTwoDecimals(line.subtotal)
      );
    }

    return (
      Number.isInteger(line.precio_unitario) &&
      Number.isInteger(line.subtotal)
    );
  });

export const buildOrderAmounts = ({
  products,
  shipping,
  facturaTipo = "none",
}: {
  products: OrderProductPricingInput[];
  shipping?: { nombre: string; costo: number; ajustePorcentaje?: number };
  facturaTipo?: FacturaTipo;
}): {
  productos: NamedOrderLine[];
  total: number;
  costoEnvio: number;
  descuentoCupon: number;
  subtotalSinIva: number;
  ivaImporte: number;
} => {
  const calculatedProducts = products.map(({ nombre, ...pricingInput }) => {
    const calculated = calculateOrderProduct({
      ...pricingInput,
      facturaTipo,
    });

    return {
      ...calculated,
      line: {
        nombre,
        ...calculated.line,
      },
    };
  });

  const shippingAdjustment = shipping?.ajustePorcentaje ?? 0;
  const shippingCalculation =
    shipping && shippingAdjustment === 100
      ? {
          line: {
            cantidad: 1,
            precio_unitario: requiresInvoice(facturaTipo)
              ? round2(shipping.costo)
              : Math.round(shipping.costo),
            subtotal: 0,
            ajuste_porcentaje: 100,
          },
          netSubtotal: 0,
          couponDiscount: 0,
        }
      : shipping
        ? calculateOrderProduct({
            cantidad: 1,
            precioBaseUnitario: requiresInvoice(facturaTipo)
              ? round2(shipping.costo)
              : Math.round(shipping.costo),
            ajustePorcentaje: shippingAdjustment,
            couponApplied: false,
            facturaTipo,
          })
        : null;
  const shippingLine =
    shipping && shippingCalculation
      ? {
          nombre: shipping.nombre,
          ...shippingCalculation.line,
        }
      : null;
  const costoEnvio = shippingCalculation?.netSubtotal ?? 0;
  const productNetSubtotals = calculatedProducts.map(
    ({ netSubtotal }) => netSubtotal
  );
  const subtotalSinIva = requiresInvoice(facturaTipo)
    ? round2(
        productNetSubtotals.reduce(
          (sum, subtotal) => sum + subtotal,
          0
        ) + costoEnvio
      )
    : productNetSubtotals.reduce(
        (sum, subtotal) => sum + subtotal,
        0
      ) + costoEnvio;
  const ivaImporte = requiresInvoice(facturaTipo)
    ? round2(subtotalSinIva * INVOICE_SURCHARGE_RATE)
    : 0;

  return {
    productos: shippingLine
      ? [
          ...calculatedProducts.map(({ line }) => line),
          shippingLine,
        ]
      : calculatedProducts.map(({ line }) => line),
    total: calculateOrderTotal(
      productNetSubtotals,
      costoEnvio,
      facturaTipo
    ),
    costoEnvio,
    descuentoCupon: Math.round(
      calculatedProducts.reduce(
        (sum, { couponDiscount }) => sum + couponDiscount,
        0
      )
    ),
    subtotalSinIva,
    ivaImporte,
  };
};
