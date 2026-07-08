import { FormEvent, useState } from "react";
import { AlertCircle, Bell, CheckCircle2, Loader2, X } from "lucide-react";
import {
  ApiError,
  createStockWaitRequest,
  StockWaitRequestPayload,
} from "../../services/api";

type StockWaitRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productoId: string;
};

type FormState = {
  cliente_nombre: string;
  cliente_id: string;
  cliente_tel: string;
  cantidad: string;
  nota: string;
};

const initialFormState: FormState = {
  cliente_nombre: "",
  cliente_id: "",
  cliente_tel: "",
  cantidad: "1",
  nota: "",
};

const statusMessages: Record<number, string> = {
  400: "Revisá los campos ingresados.",
  404: "No pudimos encontrar este producto.",
  409: "Este producto ya figura con stock disponible. Probá actualizar la página.",
};

export function StockWaitRequestModal({
  isOpen,
  onClose,
  productName,
  productoId,
}: StockWaitRequestModalProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) {
    return null;
  }

  const quantity = Number(form.cantidad);
  const hasContactHint = form.cliente_id.trim() || form.cliente_tel.trim();

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setSuccess(false);
    setError(null);
    setForm(initialFormState);
    onClose();
  };

  const handleChange = (
    field: keyof FormState,
    value: string
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nombre = form.cliente_nombre.trim();
    if (!nombre) {
      setError("El nombre y apellido es obligatorio.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("La cantidad debe ser un número entero mayor o igual a 1.");
      return;
    }

    const payload: StockWaitRequestPayload = {
      producto_id: productoId,
      cliente_nombre: nombre,
      cantidad: quantity,
    };

    const clienteId = form.cliente_id.trim();
    const clienteTel = form.cliente_tel.trim();
    const nota = form.nota.trim();

    if (clienteId) payload.cliente_id = clienteId;
    if (clienteTel) payload.cliente_tel = clienteTel;
    if (nota) payload.nota = nota;

    try {
      setIsSubmitting(true);
      setError(null);
      await createStockWaitRequest(payload);
      setSuccess(true);
      setForm(initialFormState);
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(
          statusMessages[requestError.status] ||
            "No pudimos registrar el aviso. Intentá de nuevo."
        );
      } else {
        setError("No pudimos registrar el aviso. Intentá de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700">
              Aviso de stock
            </p>
            <h2 className="mt-1 text-lg font-bold text-gray-900">
              Avisarme cuando ingrese
            </h2>
            <p className="mt-1 text-sm text-gray-500">{productName}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="p-5">
            <div className="flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">
                Te anotamos para avisarte cuando vuelva a ingresar.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Listo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
                Nombre y apellido
              </span>
              <input
                type="text"
                value={form.cliente_nombre}
                onChange={(event) =>
                  handleChange("cliente_nombre", event.target.value)
                }
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-yellow-500"
                autoComplete="name"
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  CUIT/DNI
                </span>
                <input
                  type="text"
                  value={form.cliente_id}
                  onChange={(event) =>
                    handleChange("cliente_id", event.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-yellow-500"
                  inputMode="numeric"
                  autoComplete="off"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  Teléfono/WhatsApp
                </span>
                <input
                  type="tel"
                  value={form.cliente_tel}
                  onChange={(event) =>
                    handleChange("cliente_tel", event.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-yellow-500"
                  autoComplete="tel"
                />
              </label>
            </div>

            {!hasContactHint && (
              <div className="flex gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-amber-800">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p className="text-xs font-medium">
                  Te recomendamos completar teléfono o CUIT/DNI para poder identificarte.
                </p>
              </div>
            )}

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
                Cantidad deseada
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={form.cantidad}
                onChange={(event) => handleChange("cantidad", event.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-yellow-500"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Nota</span>
              <textarea
                value={form.nota}
                onChange={(event) => handleChange("nota", event.target.value)}
                className="mt-1 min-h-20 w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-yellow-500"
              />
            </label>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-3 py-2.5 text-center text-sm font-semibold leading-tight text-gray-950 transition-colors hover:bg-yellow-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 flex-shrink-0" />
                  <span>Avisarme cuando ingrese</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
