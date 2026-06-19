export const FULL_NAME_PATTERN = ".*\\S+\\s+\\S+.*";
export const FULL_NAME_MESSAGE = "Ingresá nombre y apellido.";

export const hasAtLeastTwoWords = (value: string): boolean =>
  value.trim().split(/\s+/).filter(Boolean).length >= 2;
