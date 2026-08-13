import {
  FULL_NAME_MESSAGE,
  FULL_NAME_PATTERN,
  hasAtLeastTwoWords,
} from "../../utils/validation";
import type { DocumentType } from "../../utils/validation";
import { Loader2 } from "lucide-react";

const CUIT_HELP_URL =
  "https://serviciosweb.afip.gob.ar/publico/cuitonline/infopersonal.aspx";

type Props = {
  formData: {
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    cuit: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCuitBlur?: () => void;
  isCuitValid: boolean;
  documentType: DocumentType | null;
  showCuitHelp: boolean;
  arePersonalFieldsDisabled: boolean;
  isClienteLookupLoading: boolean;
};

export const CheckoutPersonal = ({
  formData,
  handleInputChange,
  handleCuitBlur,
  isCuitValid,
  documentType,
  showCuitHelp,
  arePersonalFieldsDisabled,
  isClienteLookupLoading,
}: Props) => {
  const completeCuilName = `${formData.firstName} ${formData.lastName}`;
  const isNameIncomplete =
    documentType === "cuil"
      ? (formData.firstName.trim().length > 0 ||
          formData.lastName.trim().length > 0) &&
        !hasAtLeastTwoWords(completeCuilName)
      : formData.name.trim().length > 0 && !hasAtLeastTwoWords(formData.name);
  const singleNameLabel =
    documentType === "cuit" ? "Razon social" : "Nombre completo";
  const singleNamePlaceholder =
    documentType === "cuit" ? "Razon social" : "Nombre y apellido";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Informacion Personal
      </h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label
            htmlFor="cuit"
            className="block text-sm font-medium text-gray-700"
          >
            CUIT / CUIL
          </label>
          <div className="relative mt-1">
            <input
              type="text"
              id="cuit"
              name="cuit"
              value={formData.cuit}
              onChange={handleInputChange}
              onBlur={handleCuitBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              required
              aria-invalid={showCuitHelp}
              aria-describedby={showCuitHelp ? "cuit-help" : undefined}
              aria-busy={isClienteLookupLoading}
              className={`p-2 block w-full rounded-md border-2 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 ${
                isClienteLookupLoading ? "pr-10" : ""
              } ${showCuitHelp ? "border-red-400" : "border-gray-300"}`}
              placeholder="Ej: 20-12345678-9"
            />
            {isClienteLookupLoading && (
              <span className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center">
                <Loader2
                  className="h-5 w-5 animate-spin text-yellow-600"
                  aria-hidden="true"
                />
              </span>
            )}
          </div>
          {showCuitHelp && (
            <p id="cuit-help" className="mt-1 text-sm text-red-600">
              Ingresa un CUIT/CUIL valido.{" "}
              <a
                href={CUIT_HELP_URL}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-yellow-700 underline hover:text-yellow-800"
              >
                No conozco mi cuit/cuil
              </a>
            </p>
          )}
        </div>

        {documentType === "cuil" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                disabled={arePersonalFieldsDisabled}
                className="mt-1 p-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                placeholder="Nombre"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Apellido
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                disabled={arePersonalFieldsDisabled}
                className="mt-1 p-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                placeholder="Apellido"
              />
            </div>
            {isNameIncomplete && (
              <p className="sm:col-span-2 mt-[-0.5rem] text-sm text-red-600">
                {FULL_NAME_MESSAGE}
              </p>
            )}
          </div>
        ) : (
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              {singleNameLabel}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              pattern={FULL_NAME_PATTERN}
              title={FULL_NAME_MESSAGE}
              required
              disabled={arePersonalFieldsDisabled}
              className="mt-1 p-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              placeholder={singleNamePlaceholder}
            />
            {isNameIncomplete && (
              <p className="mt-1 text-sm text-red-600">{FULL_NAME_MESSAGE}</p>
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={arePersonalFieldsDisabled}
            className="mt-1 p-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Telefono
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex flex-shrink-0 items-center whitespace-nowrap rounded-l-md border-2 border-r-0 border-gray-300 bg-gray-100 px-3 text-sm font-medium text-gray-700">
              +54 9
            </span>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              disabled={arePersonalFieldsDisabled}
              inputMode="numeric"
              autoComplete="tel-national"
              aria-describedby="phone-help"
              className="block w-full min-w-0 rounded-none rounded-r-md border-2 border-gray-300 p-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              placeholder="261 555-1234"
            />
          </div>
          <p id="phone-help" className="mt-1 text-xs text-gray-500">
            Completa codigo de area + numero, sin 0 ni 15, espacios ni guiones.
          </p>
        </div>
        {/*
          TODO: Reactivar facturacion cuando se implemente el flujo completo.
          <fieldset className="border-t border-gray-200 pt-4">
          <legend className="text-sm font-medium text-gray-700">
            Facturacion
          </legend>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { value: "none", label: "Sin factura" },
              { value: "A", label: "Factura A (+21%)" },
              { value: "B", label: "Factura B (+21%)" },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-2 rounded-md border-2 px-3 py-2 text-sm cursor-pointer transition-colors ${
                  facturaTipo === option.value
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="facturaTipo"
                  value={option.value}
                  checked={facturaTipo === option.value}
                  onChange={() => setFacturaTipo(option.value as FacturaTipo)}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        */}
      </div>
    </div>
  );
};
