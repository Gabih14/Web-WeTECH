import { X, ExternalLink } from "lucide-react";

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string;
}

const SURVEY_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfQsKpid_G41javou3KaZcoULz0VXpRJQKtGnhdBk8P92CJIQ/viewform?usp=publish-editor";

export default function SurveyModal({
  isOpen,
  onClose,
  clientName,
}: SurveyModalProps) {
  if (!isOpen) return null;

  const firstName = clientName?.trim()?.split(" ")?.[0];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-sky-100 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar encuesta"
          className="absolute right-3 top-3 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
          Tu opinion importa
        </p>

        <h2 className="mt-3 text-2xl font-bold text-gray-900">
          {firstName ? `${firstName}, contanos tu experiencia` : "Contanos tu experiencia"}
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Nos ayuda muchisimo para mejorar la tienda y el proceso de compra.
          Te toma menos de 1 minuto.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={SURVEY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Ir a la encuesta
            <ExternalLink className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Mas tarde
          </button>
        </div>
      </div>
    </div>
  );
}
