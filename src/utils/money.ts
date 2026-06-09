export function roundPrice(value: number | string): number {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  const sign = Math.sign(numericValue) || 1;
  const absoluteValue = Math.abs(numericValue);
  const tolerance = Number.EPSILON * Math.max(1, absoluteValue);

  return sign * Math.floor(absoluteValue + 0.5 + tolerance);
}

export function formatPrice(value: number | string): string {
  return roundPrice(value).toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatCurrency(value: number | string): string {
  return `$${formatPrice(value)}`;
}
