export const FULL_NAME_PATTERN = ".*\\S+\\s+\\S+.*";
export const FULL_NAME_MESSAGE = "Ingresá nombre y apellido.";

export const hasAtLeastTwoWords = (value: string): boolean =>
  value.trim().split(/\s+/).filter(Boolean).length >= 2;

export const normalizeCuitCuil = (value: string): string =>
  value.trim().replace(/\D/g, "");

export type DocumentType = "cuil" | "cuit";

const CUIL_PREFIXES = new Set(["20", "23", "24", "27"]);
const CUIT_PREFIXES = new Set(["30", "33", "34"]);

const normalizeWhitespace = (value: string): string =>
  value.replace(/\s+/g, " ").trim();

export const getDocumentType = (value: string): DocumentType | null => {
  const cuitCuil = normalizeCuitCuil(value);
  const prefix = cuitCuil.slice(0, 2);

  if (CUIL_PREFIXES.has(prefix)) return "cuil";
  if (CUIT_PREFIXES.has(prefix)) return "cuit";

  return null;
};

export const splitPersonalNameFromRazonSocial = (
  value: string
): { firstName: string; lastName: string } => {
  const normalizedValue = normalizeWhitespace(value);

  if (!normalizedValue) {
    return { firstName: "", lastName: "" };
  }

  const [lastNamePart, ...firstNameParts] = normalizedValue.split(",");
  const hasCommaFormat = firstNameParts.length > 0;

  if (hasCommaFormat) {
    return {
      firstName: normalizeWhitespace(firstNameParts.join(",")),
      lastName: normalizeWhitespace(lastNamePart),
    };
  }

  const nameParts = normalizedValue.split(" ").filter(Boolean);

  if (nameParts.length <= 1) {
    return { firstName: normalizedValue, lastName: "" };
  }

  return {
    firstName: nameParts.slice(0, -1).join(" "),
    lastName: nameParts[nameParts.length - 1],
  };
};

export const formatCustomerNameForOrder = ({
  documentType,
  name,
  firstName,
  lastName,
}: {
  documentType: DocumentType | null;
  name: string;
  firstName: string;
  lastName: string;
}): string => {
  if (documentType !== "cuil") {
    return normalizeWhitespace(name);
  }

  const cleanFirstName = normalizeWhitespace(firstName);
  const cleanLastName = normalizeWhitespace(lastName);

  if (cleanFirstName && cleanLastName) {
    return `${cleanLastName}, ${cleanFirstName}`;
  }

  return normalizeWhitespace(`${cleanFirstName} ${cleanLastName}`);
};

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

export const normalizePhoneDigits = (value: string): string =>
  value.trim().replace(/\D/g, "");

export const stripArgentinaMobilePrefix = (value: string): string => {
  const phone = normalizePhoneDigits(value);

  return phone.startsWith("549") ? phone.slice(3) : "";
};

export const formatArgentinaMobileForApi = (value: string): string => {
  const phone = normalizePhoneDigits(value);
  const phoneWithoutPrefix = phone.startsWith("549") ? phone.slice(3) : phone;

  return phoneWithoutPrefix ? `549${phoneWithoutPrefix}` : "";
};
