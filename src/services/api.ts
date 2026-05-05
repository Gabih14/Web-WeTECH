// src/services/api.ts
import { Coupon } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const BEARER_TOKEN = import.meta.env.VITE_API_BEARER_TOKEN; 

type ParsedAddress = {
  calle: string;
  numero: string;
};

const ADDRESS_NUMBER_PREFIXES_TO_SKIP = new Set([
  "m",
  "mz",
  "manzana",
  "c",
  "casa",
  "lote",
  "lt",
  "local",
  "piso",
  "dpto",
  "depto",
]);

function cleanAddressValue(value: unknown): string {
  return typeof value === "string"
    ? value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim()
    : "";
}

function parseAddress(address: unknown): ParsedAddress {
  const normalizedAddress = cleanAddressValue(address);

  if (!normalizedAddress) {
    return { calle: "", numero: "" };
  }

  const mainAddressPart = normalizedAddress
    .split(/\s*(?:,|-|\besquina\b)\s*/i)[0]
    .replace(/[. ]+$/g, "")
    .trim();

  const addressMatch = mainAddressPart.match(/^(.*\D)\s+(\d{1,6}[A-Za-z]?)$/);

  if (!addressMatch) {
    return { calle: normalizedAddress, numero: "" };
  }

  const street = addressMatch[1].trim();
  const number = addressMatch[2].trim();
  const streetTokens = street.split(/\s+/);
  const previousToken = streetTokens[streetTokens.length - 1]
    ?.replace(/[.:"]/g, "")
    .toLowerCase();

  if (previousToken && ADDRESS_NUMBER_PREFIXES_TO_SKIP.has(previousToken)) {
    return { calle: normalizedAddress, numero: "" };
  }

  return { calle: street, numero: number };
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${BEARER_TOKEN}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchClienteByCuit(cuit: string) {
  try {
    const data = await apiFetch(`/vta-cliente/${cuit}`);
    //console.log(`Respuesta de la API para CUIT ${cuit}:`, data);
    if (!data) return null;
    const parsedAddress = parseAddress(data.direccion);

    return {
      nombre: data.razonSocial || data.nombre || "",
      email: data.email || "",
      telefono: data.telefono || "",
      calle: cleanAddressValue(data.domicilio?.calle) || parsedAddress.calle,
      numero: cleanAddressValue(data.domicilio?.numero) || parsedAddress.numero,
      ciudad: data.localidad || "",
      codigo_postal: cleanAddressValue(data.cpa),
      observaciones: data.observaciones || "",
    };
  } catch (error) {
    console.error(`No se encontró cliente con CUIT ${cuit}:`, error);
    return null;
  }
}

export async function verifyCoupon(couponCode: string): Promise<Coupon | null> {
  try {
    const normalizedCode = couponCode.trim().toUpperCase();
    const data = await apiFetch(`/cupones/${normalizedCode}`);
    if (!data) return null;

    const parsePercent = (value: unknown, fallback = 0) => {
      const numeric = Number.parseFloat(String(value));
      return Number.isFinite(numeric) ? numeric : fallback;
    };

    const defaultDiscount = parsePercent(data.porcentajeDescuento, 0);

    return {
      code: String(data.id ?? normalizedCode).trim().toUpperCase(),
      descripcion: data.descripcion,
      porcentajeDescuento: defaultDiscount,
      porcentajeDescuentoTarjeta: parsePercent(
        data.porcentajeDescuentoTarjeta,
        defaultDiscount
      ),
      porcentajeDescuentoTransferencia: parsePercent(
        data.porcentajeDescuentoTransferencia,
        defaultDiscount
      ),
      activo: data.activo,
      fechaDesde: new Date(data.fechaDesde),
      fechaHasta: new Date(data.fechaHasta),
    };
  } catch (error) {
    console.error(`Cupón inválido: ${couponCode}:`, error);
    return null;
  }
}

export async function useCoupon(cuponCode: string, cuit: string, pedidoId: string) {
  try {
    const normalizedCouponCode = cuponCode.trim().toUpperCase();
    const data = await apiFetch(`/cupones/usar`, {
      method: "POST",
      body: JSON.stringify({
        cupon_id: normalizedCouponCode,
        cuit,
        pedido_id: pedidoId,
      }),
    });
    return data;
  } catch (error) {
    console.error(`Error al usar el cupón:`, error);
    return null;
  }
}
