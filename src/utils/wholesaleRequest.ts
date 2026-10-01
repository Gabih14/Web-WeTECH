export type WholesaleRequestForm = {
  cuit: string;
  razonSocial: string;
  telefono: string;
};

export type WholesaleRequestErrors = Partial<Record<keyof WholesaleRequestForm, string>>;

export function validateWholesaleRequest(form: WholesaleRequestForm) {
  const values = {
    cuit: form.cuit.trim(),
    razonSocial: form.razonSocial.trim(),
    telefono: form.telefono.trim(),
  };
  const errors: WholesaleRequestErrors = {};

  if (!/^\d{11}$/.test(values.cuit)) errors.cuit = "El CUIT debe tener exactamente 11 dígitos.";
  if (values.razonSocial.length < 2 || values.razonSocial.length > 100) errors.razonSocial = "La razón social debe tener entre 2 y 100 caracteres.";
  if (values.telefono.length < 6 || values.telefono.length > 30) errors.telefono = "El teléfono debe tener entre 6 y 30 caracteres.";

  return { values, errors };
}
