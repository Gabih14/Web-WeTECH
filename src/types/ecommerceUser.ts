export type WholesaleStatus =
  | "NO_SOLICITADO"
  | "PENDIENTE"
  | "APROBADO"
  | "RECHAZADO"
  | "SUSPENDIDO";

export interface EcommerceCustomer {
  id: string | null;
  wholesaleStatus: WholesaleStatus;
}

export interface EcommerceUser {
  authenticated: true;
  userId: string;
  customer: EcommerceCustomer;
}

export const WHOLESALE_STATUS_LABELS: Record<WholesaleStatus, string> = {
  NO_SOLICITADO: "Acceso mayorista no solicitado",
  PENDIENTE: "Solicitud mayorista pendiente",
  APROBADO: "Mayorista aprobado",
  RECHAZADO: "Solicitud mayorista rechazada",
  SUSPENDIDO: "Acceso mayorista suspendido",
};

export function hasWholesaleAccess(status: WholesaleStatus | null): boolean {
  return status === "APROBADO";
}
