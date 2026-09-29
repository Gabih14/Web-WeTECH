import { useEcommerceUser } from "../../context/EcommerceUserContext";
import { WHOLESALE_STATUS_LABELS } from "../../types/ecommerceUser";

export function WholesaleStatusIndicator() {
  const { wholesaleStatus, isWholesale, isLoading, error, refresh } =
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

  if (!wholesaleStatus) return null;

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
