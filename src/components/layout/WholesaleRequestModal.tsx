import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useAuth } from "@clerk/react";
import { ApiError, authenticatedApiFetch } from "../../services/api";
import { useEcommerceUser } from "../../context/EcommerceUserContext";
import {
  FIGURAS_FISCALES_COMERCIALES, OFERTAS_PUBLICO, PERFILES_COMPRA_INICIAL, SEDES_COMERCIALES,
  validateWholesaleRequest, type OfertaPublico, type WholesaleRequestErrors, type WholesaleRequestForm,
} from "../../utils/wholesaleRequest";

const emptyForm: WholesaleRequestForm = {
  nombreComercio: "", personaResponsable: "", ubicacionZona: "", telefono: "",
  figuraFiscalComercial: "", perfilCompraInicial: "", sedeComercial: "", ofertasPublico: [], marcasFilamento: "",
};
const inputClass = "mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-yellow-500";

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
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape" && !isSubmitting) onClose(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const change = <K extends keyof WholesaleRequestForm>(field: K, value: WholesaleRequestForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setRequestError("");
  };
  const toggleOffer = (offer: OfertaPublico) => {
    const selected = form.ofertasPublico.includes(offer);
    change("ofertasPublico", selected ? form.ofertasPublico.filter((item) => item !== offer) : [...form.ofertasPublico, offer]);
    if (offer === "VENTA_ACTUAL_FILAMENTOS" && selected) {
      setForm((current) => ({ ...current, marcasFilamento: "" }));
      setErrors((current) => ({ ...current, marcasFilamento: undefined }));
    }
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const validated = validateWholesaleRequest(form);
    if (Object.keys(validated.errors).length) { setErrors(validated.errors); return; }
    setIsSubmitting(true);
    setRequestError("");
    try {
      await authenticatedApiFetch<{ wholesaleStatus: "PENDIENTE" }>(
        "/mayorista/solicitud", getToken, { method: "POST", body: JSON.stringify(validated.values) }
      );
      setWholesaleStatus("PENDIENTE");
      setForm(emptyForm);
      onClose();
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) setRequestError("Revisá los campos ingresados.");
      else if (error instanceof ApiError && error.status === 401) setRequestError("Tu sesión venció. Volvé a iniciar sesión.");
      else if (error instanceof ApiError && error.status === 409) { refresh(); onClose(); }
      else setRequestError("No pudimos enviar la solicitud. Intentá nuevamente");
    } finally { setIsSubmitting(false); }
  };

  const textFields = [
    ["nombreComercio", "Nombre del comercio", "text"], ["personaResponsable", "Persona responsable", "text"],
    ["ubicacionZona", "Ubicación / Zona", "text"], ["telefono", "Teléfono / WhatsApp", "tel"],
  ] as const;
  const selects = [
    ["figuraFiscalComercial", "Figura fiscal/comercial", FIGURAS_FISCALES_COMERCIALES],
    ["perfilCompraInicial", "Perfil de compra inicial", PERFILES_COMPRA_INICIAL],
    ["sedeComercial", "Sede comercial", SEDES_COMERCIALES],
  ] as const;
  const sellsFilament = form.ofertasPublico.includes("VENTA_ACTUAL_FILAMENTOS");

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="wholesale-title">
    <div className="flex max-h-full w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-5">
        <h2 id="wholesale-title" className="text-lg font-bold text-gray-900">Solicitar acceso mayorista</h2>
        <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-50" aria-label="Cerrar"><X className="h-5 w-5" /></button>
      </div>
      <form onSubmit={submit} className="space-y-4 overflow-y-auto p-5" noValidate>
        {textFields.map(([field, label, type], index) => <div key={field}>
          <label htmlFor={field} className="block text-sm font-semibold text-gray-700">{label}</label>
          <input ref={index === 0 ? firstInput : undefined} id={field} type={type} autoComplete={field === "telefono" ? "tel" : "off"} value={form[field]} onChange={(event) => change(field, event.target.value)} aria-invalid={Boolean(errors[field])} aria-describedby={errors[field] ? `${field}-error` : undefined} className={inputClass} required />
          {errors[field] && <p id={`${field}-error`} role="alert" className="mt-1 text-sm text-red-700">{errors[field]}</p>}
        </div>)}
        {selects.map(([field, label, options]) => <div key={field}>
          <label htmlFor={field} className="block text-sm font-semibold text-gray-700">{label}</label>
          <select id={field} value={form[field]} onChange={(event) => change(field, event.target.value as WholesaleRequestForm[typeof field])} aria-invalid={Boolean(errors[field])} aria-describedby={errors[field] ? `${field}-error` : undefined} className={inputClass} required>
            <option value="">Seleccioná una opción</option>
            {options.map(([value, optionLabel]) => <option key={value} value={value}>{optionLabel}</option>)}
          </select>
          {errors[field] && <p id={`${field}-error`} role="alert" className="mt-1 text-sm text-red-700">{errors[field]}</p>}
        </div>)}
        <fieldset aria-describedby={errors.ofertasPublico ? "ofertasPublico-error" : undefined}>
          <legend className="text-sm font-semibold text-gray-700">Productos o servicios ofrecidos al público</legend>
          <div className="mt-2 space-y-2 rounded-xl border border-gray-200 p-3">
            {OFERTAS_PUBLICO.map(([value, label]) => <label key={value} className="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.ofertasPublico.includes(value)} onChange={() => toggleOffer(value)} className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-yellow-500" /><span>{label}</span>
            </label>)}
          </div>
          {errors.ofertasPublico && <p id="ofertasPublico-error" role="alert" className="mt-1 text-sm text-red-700">{errors.ofertasPublico}</p>}
        </fieldset>
        {sellsFilament && <div>
          <label htmlFor="marcasFilamento" className="block text-sm font-semibold text-gray-700">Marcas de filamento</label>
          <input id="marcasFilamento" type="text" value={form.marcasFilamento} onChange={(event) => change("marcasFilamento", event.target.value)} aria-invalid={Boolean(errors.marcasFilamento)} aria-describedby={errors.marcasFilamento ? "marcasFilamento-error" : undefined} className={inputClass} placeholder="Ej.: 3n3, Grilon3" required />
          {errors.marcasFilamento && <p id="marcasFilamento-error" role="alert" className="mt-1 text-sm text-red-700">{errors.marcasFilamento}</p>}
        </div>}
        {requestError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{requestError}</p>}
        <button type="submit" disabled={isSubmitting} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-3 py-2.5 text-sm font-semibold text-gray-950 hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}{isSubmitting ? "Enviando" : "Enviar solicitud"}
        </button>
      </form>
    </div>
  </div>;
}
