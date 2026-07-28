export type OriginalCheckoutAddress = {
  street: string;
  number: string;
  city: string;
  postalCode: string;
  addressWithoutNumber: boolean;
};

export type OrderAddressPayload = {
  calle: string;
  ciudad: string;
  region: string;
  pais: string;
  codigo_postal: string;
  direccion: string;
  billing_address: {
    street: string;
    number: string;
    city: string;
    region: string;
    country: string;
    postal_code: string;
  };
};

export const buildOrderAddressPayload = ({
  originalAddress,
  googleFormattedAddress,
  region = "Mendoza",
  country = "AR",
}: {
  originalAddress: OriginalCheckoutAddress;
  googleFormattedAddress: string | null;
  region?: string;
  country?: string;
}): OrderAddressPayload => ({
  calle: originalAddress.street,
  ciudad: originalAddress.city,
  region,
  pais: country,
  codigo_postal: originalAddress.postalCode,
  direccion: googleFormattedAddress || "",
  billing_address: {
    street: originalAddress.street,
    number: originalAddress.addressWithoutNumber
      ? ""
      : originalAddress.number,
    city: originalAddress.city,
    region,
    country,
    postal_code: originalAddress.postalCode,
  },
});
