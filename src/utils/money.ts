export function roundPrice(value: number | string): number {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.round(numericValue);
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
