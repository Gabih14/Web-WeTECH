import type { CartItem, Coupon } from "../types";
import { getComplementPresentation, getComplementDiscountPercentage, getMateComboComponent } from "./complementDiscounts";
import { getDiscountRateForProduct, getEffectiveQuantityForProductDiscount, getEligibleQuantityDiscountCartQuantity } from "./discounts";
import { getVariantItemId, getVariantPrice, getVariantInvoicePrice } from "./pricing";
import { getWholesaleCartState } from "./wholesalePricing";
import { getCouponPercentageForPaymentMethod, isCouponApplicableToProductCategory, selectCheckoutDiscount } from "./checkoutDiscount";
import { calculateCheckoutLinePricing, normalizeBackendBasePrice } from "./checkoutPricing";
import { calculateInvoiceLine, requiresInvoice, round2, type FacturaTipo } from "./invoice";
import { buildOrderAmounts, type OrderProductPricingInput } from "./orderPricing";

export type CartPricingLine = OrderProductPricingInput & { combo: boolean };
export type PricedCartGroup = { item: CartItem; lines: CartPricingLine[] };

// POST /pedido valida cada SKU original agregando sus partes de combo y sobrantes.
export const buildCartOrderProducts = (groups: PricedCartGroup[], facturaTipo: FacturaTipo) =>
  groups.map(({ lines }) => {
    const amounts = buildOrderAmounts({ products: lines, facturaTipo });
    if (lines.length === 1) return amounts.productos[0];
    const quantity = lines.reduce((sum, line) => sum + line.cantidad, 0);
    const finalAmount = requiresInvoice(facturaTipo)
      ? lines.reduce((sum, line) => sum + calculateInvoiceLine({
          precioMinoristaConIva: line.precioBaseUnitario,
          cantidad: line.cantidad,
          descuentoPorcentaje: line.ajustePorcentaje,
        }).subtotalFinal, 0)
      : amounts.total;
    return {
      ...amounts.productos[0],
      cantidad: quantity,
      subtotal: requiresInvoice(facturaTipo)
        ? round2(amounts.productos.reduce((sum, line) => sum + line.subtotal, 0))
        : amounts.total,
      precio_unitario: requiresInvoice(facturaTipo) ? round2(finalAmount / quantity) : Math.round(finalAmount / quantity),
    };
  });

export const calculateCartPricing = (
  items: CartItem[],
  { paymentMethod = "transfer", coupon = null, facturaTipo = "none" }: {
    paymentMethod?: "transfer" | "online";
    coupon?: Coupon | null;
    facturaTipo?: FacturaTipo;
  } = {}
): PricedCartGroup[] => {
  const wholesale = getWholesaleCartState(items);
  const identity = (item: CartItem) => ({
    id: getVariantItemId(item.product, item.color, item.weight),
    grupo: item.product.category,
    idPadre: item.product.parentItemId,
  });
  const quantities = new Map<string, number>();
  for (const item of items) {
    const presentation = getComplementPresentation(identity(item));
    if (presentation) quantities.set(presentation, (quantities.get(presentation) ?? 0) + item.quantity);
  }
  // El backend reúne SKU repetidos del combo antes de calcular y redondear.
  const entries: CartItem[] = [];
  for (const item of items) {
    const previous = paymentMethod === "transfer" && getMateComboComponent(identity(item))
      ? entries.find((entry) => identity(entry).id === identity(item).id && entry.product.category === item.product.category)
      : undefined;
    if (previous) previous.quantity += item.quantity;
    else entries.push({ ...item });
  }
  const eligibleQuantity = getEligibleQuantityDiscountCartQuantity(items);
  const groups = entries.map((item) => {
    const presentation = getComplementPresentation(identity(item));
    const automaticPercentage = paymentMethod === "transfer"
      ? presentation
        ? getComplementDiscountPercentage(identity(item), quantities.get(presentation) ?? item.quantity)
        : getDiscountRateForProduct(item.product, getEffectiveQuantityForProductDiscount(item.product, item.quantity, item.weight, eligibleQuantity), item.weight) * 100
      : 0;
    const decision = selectCheckoutDiscount({
      automaticPercentage,
      couponPercentage: coupon && isCouponApplicableToProductCategory({ couponCategory: coupon.categoriaAplicable, productCategory: item.product.category })
        ? getCouponPercentageForPaymentMethod(coupon, paymentMethod) : 0,
    });
    return { item, lines: [{
      nombre: identity(item).id,
      cantidad: item.quantity,
      precioBaseUnitario: normalizeBackendBasePrice((requiresInvoice(facturaTipo)
        ? getVariantInvoicePrice(item.product, item.color, item.weight)
        : getVariantPrice(item.product, item.color, item.weight, wholesale.reached)) ?? 0),
      ajustePorcentaje: decision.percentage,
      couponApplied: decision.source === "coupon",
      combo: false,
    }] };
  });
  if (paymentMethod !== "transfer") return groups;

  const components = (kind: "mate" | "bombilla") => groups
    .map((group, index) => ({ group, index }))
    .filter(({ group }) => getMateComboComponent(identity(group.item)) === kind);
  const mates = components("mate");
  const bombillas = components("bombilla");
  const quantity = (rows: typeof mates) => rows.reduce((sum, { group }) => sum + group.item.quantity, 0);
  const pairs = Math.min(quantity(mates), quantity(bombillas));
  if (!pairs) return groups;
  const subtotal = (line: CartPricingLine) => requiresInvoice(facturaTipo)
    ? calculateInvoiceLine({ precioMinoristaConIva: line.precioBaseUnitario, cantidad: line.cantidad, descuentoPorcentaje: line.ajustePorcentaje }).netoFinal
    : calculateCheckoutLinePricing(line.precioBaseUnitario, line.cantidad, line.ajustePorcentaje).subtotalNeto;
  const total = (rows: CartPricingLine[][]) => rows.reduce((sum, lines) => sum + lines.reduce((amount, line) => amount + subtotal(line), 0), 0);
  const individual = groups.map((group) => group.lines);
  let best = individual;
  let bestTotal = total(best);
  // Mismo orden de candidatos y márgenes de redondeo que PedidoService.aplicarCombosMate.
  for (const percentage of [25, 35]) {
    if (percentage === 35 && pairs < 10) continue;
    const saving = ({ index }: typeof mates[number]) => {
      const line = individual[index][0];
      return line.precioBaseUnitario * (percentage - line.ajustePorcentaje) / 100;
    };
    const rawSaving = ({ index }: typeof mates[number]) => {
      const line = individual[index][0];
      return line.precioBaseUnitario * (percentage - line.ajustePorcentaje);
    };
    const ordered = [...mates].sort((a, b) => rawSaving(b) - rawSaving(a)
      || a.group.lines[0].nombre.localeCompare(b.group.lines[0].nombre)
      || a.group.item.quantity - b.group.item.quantity);
    const minimumSaving = Math.min(...mates.map(saving)) + Math.min(...bombillas.map(saving));
    if (percentage === 35 && minimumSaving <= 0) continue;
    const roundingMargin = Math.ceil(4 * (mates.length + bombillas.length) / minimumSaving);
    const start = Math.max(10, pairs - roundingMargin);
    const counts = percentage === 25
      ? Array.from({ length: Math.min(9, pairs) }, (_, i) => i + 1)
      : Array.from({ length: pairs - start + 1 }, (_, i) => pairs - i);
    for (const count of counts) {
      const maximumFirst = Math.min(count, quantity([ordered[0]]));
      const minimumFirst = Math.max(0, count - quantity(ordered.slice(1)));
      const difference = ordered[1] ? saving(ordered[0]) - saving(ordered[1]) : 0;
      const colorMargin = difference > 0 ? Math.ceil(4 * (mates.length + bombillas.length) / difference) : 10000;
      for (let first = maximumFirst; first >= Math.max(minimumFirst, maximumFirst - colorMargin); first--) {
        const candidate = individual.map((lines) => lines);
        for (const allocation of [
          { rows: [ordered[0]], count: first },
          { rows: ordered.slice(1), count: count - first },
          { rows: bombillas, count },
        ]) {
          let remaining = allocation.count;
          for (const { group, index } of allocation.rows) {
            const used = Math.min(remaining, group.item.quantity);
            if (!used) continue;
            const line = individual[index][0];
            candidate[index] = [{ ...line, cantidad: used, ajustePorcentaje: percentage, couponApplied: false, combo: true }];
            const leftover = group.item.quantity - used;
            if (leftover > 0) candidate[index].push({ ...line, cantidad: leftover });
            remaining -= used;
          }
        }
        const amount = total(candidate);
        if (amount < bestTotal) { bestTotal = amount; best = candidate; }
      }
    }
  }
  return groups.map((group, index) => ({ ...group, lines: best[index] }));
};
