import {
  FULL_NAME_MESSAGE,
  FULL_NAME_PATTERN,
  hasAtLeastTwoWords,
} from "../../utils/validation";
import type { FacturaTipo } from "../../utils/invoice";

type Props = {
  formData: {
    name: string;
    email: string;
    phone: string;
    cuit: string; // Agregado el campo cuit
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCuitBlur?: () => void;
  facturaTipo: FacturaTipo;
  setFacturaTipo: (facturaTipo: FacturaTipo) => void;
};

export const CheckoutPersonal = ({
  formData,
  handleInputChange,
  handleCuitBlur,
  facturaTipo,
  setFacturaTipo,
}: Props) => {
  const isNameIncomplete =
    formData.name.trim().length > 0 && !hasAtLeastTwoWords(formData.name);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Información Personal
      </h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label
            htmlFor="cuit"
            className="block text-sm font-medium text-gray-700"
          >
            CUIT / CUIL
          </label>
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
            className="mt-1 p-2 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
            placeholder="Ej: 20-12345678-9"
          />
        </div>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre completo
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
            className="mt-1 p-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Nombre y apellido"
          />
          {isNameIncomplete && (
            <p className="mt-1 text-sm text-red-600">{FULL_NAME_MESSAGE}</p>
          )}
        </div>
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
            className="mt-1 p-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Teléfono
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="mt-1 p-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
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
      </div>
    </div>
  );
};
