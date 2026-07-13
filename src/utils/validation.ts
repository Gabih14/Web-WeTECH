export const FULL_NAME_PATTERN = ".*\\S+\\s+\\S+.*";
export const FULL_NAME_MESSAGE = "Ingresá nombre y apellido.";

export const hasAtLeastTwoWords = (value: string): boolean =>
  value.trim().split(/\s+/).filter(Boolean).length >= 2;

export const normalizeCuitCuil = (value: string): string =>
  value.trim().replace(/\D/g, "");

export const isValidCuitCuil = (value: string): boolean => {
  const cuit = normalizeCuitCuil(value);

  if (!/^\d{11}$/.test(cuit)) {
    return false;
  }

  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce(
    (total, weight, index) => total + Number(cuit[index]) * weight,
    0
  );
  const remainder = sum % 11;
  const expectedDigit = remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder;

  return Number(cuit[10]) === expectedDigit;
};
