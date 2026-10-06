import { useState } from "react";
import { useEcommerceUser } from "../../context/EcommerceUserContext";
import { WHOLESALE_STATUS_LABELS } from "../../types/ecommerceUser";
import { WholesaleRequestModal } from "./WholesaleRequestModal";

export function WholesaleStatusIndicator() {
  const [isOpen, setIsOpen] = useState(false);
  const { wholesaleStatus, isWholesale, isLoading, error, refresh, wholesaleNotice } =
    useEcommerceUser();

  if (isLoading) {
    return (
      <span className="hidden text-xs text-gray-700 lg:inline" role="status">
        Consultando cuenta…
      </span>
    );
  }

  if (error) {
    return (
      <button
        type="button"
        onClick={refresh}
        className="hidden text-xs font-medium text-red-700 hover:underline lg:inline"
        title="No se pudo consultar el estado mayorista"
      >
        Reintentar estado
      </button>
    );
  }

  if (wholesaleNotice) return <span className="text-xs text-amber-700" role="status">{wholesaleNotice}</span>;
  if (!wholesaleStatus) return null;

  if (wholesaleStatus === "NO_SOLICITADO" || wholesaleStatus === "RECHAZADO") {
    return (
      <>
        <button type="button" onClick={() => setIsOpen(true)} className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
          {wholesaleStatus === "RECHAZADO" ? "Volver a solicitar acceso mayorista" : "Solicitar acceso mayorista"}
        </button>
        <WholesaleRequestModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  return (
    <span
      className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold lg:inline ${
        isWholesale
          ? "bg-green-100 text-green-800"
          : "bg-white/70 text-gray-800"
      }`}
      title="Estado mayorista según el servidor"
    >
      {WHOLESALE_STATUS_LABELS[wholesaleStatus]}
    </span>
  );
}
