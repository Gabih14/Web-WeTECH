export const FIGURAS_FISCALES_COMERCIALES = [
  ["EMPRENDEDOR_CONSUMIDOR_FINAL", "Emprendedor — Consumidor final"],
  ["EMPRENDEDOR_MONOTRIBUTISTA", "Emprendedor — Monotributista"],
  ["RESPONSABLE_INSCRIPTO", "Responsable inscripto"],
  ["SOCIEDAD_SIMPLE", "Sociedad simple"],
  ["SOCIEDAD_ESTANDAR", "Sociedad estándar"],
] as const;

export const PERFILES_COMPRA_INICIAL = [
  ["GRAN_CONSUMIDOR_FINAL_96_239_KG", "Gran Consumidor Final — 96 a 239 kg"],
  ["PUNTO_VENTA_OFICIAL_240_479_KG", "Punto de Venta Oficial — 240 a 479 kg"],
  ["PUNTO_VENTA_PLUS_480_KG", "Punto de Venta PLUS — desde 480 kg"],
  ["PLUS_960_KG", "PLUS — desde 960 kg"],
  ["NIVEL_SUPERIOR_2_TN", "Nivel superior — desde 2 toneladas"],
  ["NIVEL_SUPERIOR_4_TN", "Nivel superior — desde 4 toneladas"],
] as const;

export const SEDES_COMERCIALES = [
  ["TALLER_OFICINA", "Taller / Oficina"],
  ["LOCAL_PUBLICO", "Local al público"],
] as const;

export const OFERTAS_PUBLICO = [
  ["FABRICACION_IMPRESORAS_3D_PROPIAS", "Fabricación de impresoras 3D propias"],
  ["SERVICIO_IMPRESION_3D", "Servicio de impresión 3D"],
  ["CURSOS_TALLERES", "Cursos / talleres"],
  ["VENTA_COMPONENTES_REPUESTOS", "Venta de componentes / repuestos"],
  ["SERVICIO_DISENO_3D", "Servicio de diseño 3D"],
  ["VENTA_IMPRESORAS_3D_IMPORTADAS", "Venta de impresoras 3D importadas"],
  ["VENTA_ACTUAL_FILAMENTOS", "Venta actual de filamentos"],
] as const;

export type FiguraFiscalComercial = (typeof FIGURAS_FISCALES_COMERCIALES)[number][0];
export type PerfilCompraInicial = (typeof PERFILES_COMPRA_INICIAL)[number][0];
export type SedeComercial = (typeof SEDES_COMERCIALES)[number][0];
export type OfertaPublico = (typeof OFERTAS_PUBLICO)[number][0];

export type WholesaleRequestForm = {
  nombreComercio: string;
  personaResponsable: string;
  ubicacionZona: string;
  telefono: string;
  figuraFiscalComercial: FiguraFiscalComercial | "";
  perfilCompraInicial: PerfilCompraInicial | "";
  sedeComercial: SedeComercial | "";
  ofertasPublico: OfertaPublico[];
  marcasFilamento: string;
};

export type WholesaleRequestErrors = Partial<Record<keyof WholesaleRequestForm, string>>;

const figuraValues = new Set<string>(FIGURAS_FISCALES_COMERCIALES.map(([value]) => value));
const perfilValues = new Set<string>(PERFILES_COMPRA_INICIAL.map(([value]) => value));
const sedeValues = new Set<string>(SEDES_COMERCIALES.map(([value]) => value));
const ofertaValues = new Set<string>(OFERTAS_PUBLICO.map(([value]) => value));

export function validateWholesaleRequest(form: WholesaleRequestForm) {
  const sellsFilament = form.ofertasPublico.includes("VENTA_ACTUAL_FILAMENTOS");
  const values = {
    nombreComercio: form.nombreComercio.trim(),
    personaResponsable: form.personaResponsable.trim(),
    ubicacionZona: form.ubicacionZona.trim(),
    telefono: form.telefono.trim(),
    figuraFiscalComercial: form.figuraFiscalComercial,
    perfilCompraInicial: form.perfilCompraInicial,
    sedeComercial: form.sedeComercial,
    ofertasPublico: [...new Set(form.ofertasPublico)],
    ...(sellsFilament ? { marcasFilamento: form.marcasFilamento.trim() } : {}),
  };
  const errors: WholesaleRequestErrors = {};

  if (!values.nombreComercio) errors.nombreComercio = "Ingresá el nombre del comercio.";
  if (!values.personaResponsable) errors.personaResponsable = "Ingresá la persona responsable.";
  if (!values.ubicacionZona) errors.ubicacionZona = "Ingresá la ubicación o zona.";
  if (!values.telefono) errors.telefono = "Ingresá el teléfono o WhatsApp.";
  if (!figuraValues.has(values.figuraFiscalComercial)) errors.figuraFiscalComercial = "Seleccioná una figura fiscal/comercial.";
  if (!perfilValues.has(values.perfilCompraInicial)) errors.perfilCompraInicial = "Seleccioná un perfil de compra inicial.";
  if (!sedeValues.has(values.sedeComercial)) errors.sedeComercial = "Seleccioná una sede comercial.";
  if (!values.ofertasPublico.length || values.ofertasPublico.some((offer) => !ofertaValues.has(offer))) {
    errors.ofertasPublico = "Seleccioná al menos una opción válida.";
  }
  if (sellsFilament && !values.marcasFilamento) errors.marcasFilamento = "Ingresá al menos una marca de filamento.";

  return { values, errors };
}
