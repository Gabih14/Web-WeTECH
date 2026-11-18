// src/services/api.ts
import { Coupon } from "../types";
import {
  createClerkAuthorizationHeaders,
  type SessionTokenGetter,
} from "../utils/clerkRequest";

export { MissingAuthenticationError } from "../utils/clerkRequest";
export type { SessionTokenGetter } from "../utils/clerkRequest";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const BEARER_TOKEN = import.meta.env.VITE_API_BEARER_TOKEN; 
const READ_API_TOKEN = import.meta.env.VITE_READ_API_TOKEN;

export class ApiError extends Error {
  status: number;

  constructor(status: number, statusText: string) {
    super(`Error en la API: ${status} ${statusText}`);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function authenticatedApiFetch<T>(
  endpoint: string,
  getToken: SessionTokenGetter,
  options: RequestInit = {}
): Promise<T> {
  const headers = await createClerkAuthorizationHeaders(
    getToken,
    options.headers
  );

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export type StockWaitRequestPayload = {
  producto_id: string;
  cliente_nombre: string;
  cliente_id?: string;
  cliente_tel?: string;
  cantidad?: number;
  nota?: string;
};

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
    throw new ApiError(response.status, response.statusText);
  }

  return response.json();
}

export async function dashboardReadApiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${READ_API_TOKEN}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }

  return response.json();
}

export interface SeoProduct {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  fotoUrl: string;
  precio: number;
  precioPromocional?: number | null;
  stock: number;
  marca?: string | null;
  categoria?: string | null;
  subcategoria?: string | null;
  moneda?: string | null;
  updatedAt?: string | null;
}

export async function publicApiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function createStockWaitRequest(payload: StockWaitRequestPayload) {
  return publicApiFetch("/espera", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchSeoProducts(): Promise<SeoProduct[]> {
  try {
    const data = await publicApiFetch("/seo/products");

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("No se pudieron obtener los productos SEO:", error);
    return [];
  }
}

export async function fetchSeoProductBySlug(
  slug: string
): Promise<SeoProduct | null> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 5000);

  try {
    const data = await publicApiFetch(
      `/seo/products/${encodeURIComponent(slug)}`,
      { signal: controller.signal }
    );

    return data && typeof data === "object" ? data as SeoProduct : null;
  } catch (error) {
    console.error(`No se pudo obtener el producto SEO ${slug}:`, error);
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function fetchClienteByCuit(cuit: string) {
  try {
    const data = await apiFetch(`/vta-cliente/${cuit}`);
    if (import.meta.env.DEV) {
      console.log(`Respuesta de GET /vta-cliente/${cuit}:`, data);
    }
    if (!data) return null;
    const parsedAddress = parseAddress(data.direccion);
    const separatedStreet = cleanAddressValue(data.direccionSeparada?.calle);
    const separatedNumber = cleanAddressValue(data.direccionSeparada?.numero);
    const domicilioStreet = cleanAddressValue(data.domicilio?.calle);
    const domicilioNumber = cleanAddressValue(data.domicilio?.numero);
    const preferredStreet = separatedStreet || domicilioStreet;
    const preferredNumber = separatedNumber || domicilioNumber;
    const parsedPreferredStreet = preferredNumber
      ? { calle: preferredStreet, numero: preferredNumber }
      : parseAddress(preferredStreet);

    return {
      nombre: data.razonSocial || data.nombre || "",
      email: data.email || "",
      telefono: data.telefono || "",
      calle: parsedPreferredStreet.calle || parsedAddress.calle,
      numero: parsedPreferredStreet.numero || parsedAddress.numero,
      ciudad:
        cleanAddressValue(data.direccionSeparada?.ciudad) || data.localidad || "",
      codigo_postal:
        cleanAddressValue(data.direccionSeparada?.codigoPostal) ||
        cleanAddressValue(data.cpa),
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
    const parseDate = (value: unknown): Date | null => {
      if (!value) return null;
      const date = new Date(String(value));
      return Number.isNaN(date.getTime()) ? null : date;
    };

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
      categoriaAplicable:
        data.categoriaAplicable ?? data.categoria_aplicable ?? null,
      activo: data.activo,
      fechaDesde: parseDate(data.fechaDesde),
      fechaHasta: parseDate(data.fechaHasta),
    };
  } catch (error) {
    console.error(`Cupón inválido: ${couponCode}:`, error);
    return null;
  }
}

export type CouponValidationCode =
  | "COUPON_NOT_FOUND"
  | "COUPON_EXPIRED"
  | "COUPON_ALREADY_USED"
  | "COUPON_OWNER_MISMATCH"
  | "COUPON_NOT_APPLICABLE";

export type CouponValidationSuccess = {
  estado: "VALID";
  codigoCupon: string;
  fechaVencimiento: string | null;
  categoriaAplicable: Coupon["categoriaAplicable"];
};

export type CouponValidationFailure = {
  code: CouponValidationCode;
  message: string;
  details?: {
    fechaVencimiento?: string;
    fechaUso?: string;
    pedidoId?: number | null;
    categoriaAplicable?: string;
  };
  status: number;
  retryable: boolean;
};

const COUPON_VALIDATION_CODES = new Set<CouponValidationCode>([
  "COUPON_NOT_FOUND",
  "COUPON_EXPIRED",
  "COUPON_ALREADY_USED",
  "COUPON_OWNER_MISMATCH",
  "COUPON_NOT_APPLICABLE",
]);

export const isCouponValidationFailure = (
  value: unknown
): value is CouponValidationFailure => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CouponValidationFailure>;
  return typeof candidate.code === "string" &&
    COUPON_VALIDATION_CODES.has(candidate.code as CouponValidationCode);
};

export class CouponValidationApiError extends Error {
  result: CouponValidationFailure;

  constructor(result: CouponValidationFailure) {
    super(result.message);
    this.name = "CouponValidationApiError";
    this.result = result;
  }
}

export async function validateCoupon(
  couponCode: string,
  cuit: string
): Promise<CouponValidationSuccess> {
  const normalizedCouponCode = couponCode.trim().toUpperCase();
  const response = await fetch(`${API_BASE_URL}/cupones/validar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BEARER_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cupon_id: normalizedCouponCode,
      cuit,
    }),
  });
  const result: unknown = await response.json();

  if (!response.ok) {
    if (isCouponValidationFailure(result)) {
      throw new CouponValidationApiError(result);
    }
    throw new ApiError(response.status, response.statusText);
  }

  return result as CouponValidationSuccess;
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
