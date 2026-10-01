import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useAuth } from "@clerk/react";
import { ApiError, authenticatedApiFetch } from "../../services/api";
import { useEcommerceUser } from "../../context/EcommerceUserContext";
import { validateWholesaleRequest, type WholesaleRequestErrors, type WholesaleRequestForm } from "../../utils/wholesaleRequest";

const emptyForm: WholesaleRequestForm = { cuit: "", razonSocial: "", telefono: "" };

export function WholesaleRequestModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { getToken } = useAuth();
  const { refresh, setWholesaleStatus } = useEcommerceUser();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<WholesaleRequestErrors>({});
  const [requestError, setRequestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    firstInput.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const change = (field: keyof WholesaleRequestForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setRequestError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const validated = validateWholesaleRequest(form);
    if (Object.keys(validated.errors).length) {
      setErrors(validated.errors);
      return;
    }

    setIsSubmitting(true);
    setRequestError("");
    try {
      await authenticatedApiFetch<{ wholesaleStatus: "PENDIENTE" }>(
        "/mayorista/solicitud",
        getToken,
        { method: "POST", body: JSON.stringify(validated.values) }
      );
      setWholesaleStatus("PENDIENTE");
      setForm(emptyForm);
      onClose();
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        setRequestError("Revisá los campos ingresados.");
      } else if (error instanceof ApiError && error.status === 401) {
        setRequestError("Tu sesión venció. Volvé a iniciar sesión.");
      } else if (error instanceof ApiError && error.status === 409) {
        refresh();
        onClose();
      } else {
        setRequestError("No pudimos enviar la solicitud. Intentá nuevamente");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="wholesale-title">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <h2 id="wholesale-title" className="text-lg font-bold text-gray-900">Solicitar acceso mayorista</h2>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-full p-2 text-gray-400 hover:bg-gray-100" aria-label="Cerrar"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5" noValidate>
          {(["cuit", "razonSocial", "telefono"] as const).map((field) => {
            const labels = { cuit: "CUIT", razonSocial: "Razón social", telefono: "Teléfono" };
            const errorId = `${field}-error`;
            return <div key={field}>
              <label htmlFor={field} className="block text-sm font-semibold text-gray-700">{labels[field]}</label>
              <input ref={field === "cuit" ? firstInput : undefined} id={field} type={field === "telefono" ? "tel" : "text"} inputMode={field === "cuit" ? "numeric" : undefined} autoComplete={field === "telefono" ? "tel" : "off"} value={form[field]} onChange={(event) => change(field, event.target.value)} aria-invalid={Boolean(errors[field])} aria-describedby={errors[field] ? errorId : undefined} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-yellow-500" required />
              {errors[field] && <p id={errorId} role="alert" className="mt-1 text-sm text-red-700">{errors[field]}</p>}
            </div>;
          })}
          {requestError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{requestError}</p>}
          <button type="submit" disabled={isSubmitting} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-3 py-2.5 text-sm font-semibold text-gray-950 hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}{isSubmitting ? "Enviando" : "Enviar solicitud"}
          </button>
        </form>
      </div>
    </div>
  );
}
