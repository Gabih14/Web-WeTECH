import type { ChangeEvent } from "react";

type Props = {
  formData: {
    name: string;
    email: string;
    phone: string;
    cuit: string; // Agregado el campo cuit
  };
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleCuitBlur?: () => void;
  handlePhoneChange: (phone: string) => void;
};

const normalizeDigits = (value: string) => value.replace(/\D/g, "");

const parsePhone = (raw: string) => {
  const digits = normalizeDigits(raw);
  let rest = digits;

  if (rest.startsWith("549")) {
    rest = rest.slice(3);
  }

  const cleaned = raw.replace(/\s+/g, " ").trim();
  const prefixMatch = cleaned.match(/^\+?54\s*9\s*/);
  if (prefixMatch) {
    const after = cleaned.slice(prefixMatch[0].length).trim();
    const parts = after.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return {
        area: normalizeDigits(parts[0]),
        number: normalizeDigits(parts.slice(1).join("")),
      };
    }
  }

  if (!rest) {
    return { area: "", number: "" };
  }

  if (rest.length <= 4) {
    return { area: rest, number: "" };
  }

  if (rest.length === 8) {
    return { area: rest.slice(0, 2), number: rest.slice(2) };
  }

  if (rest.length === 10) {
    return { area: rest.slice(0, 3), number: rest.slice(3) };
  }

  if (rest.length === 9) {
    return { area: rest.slice(0, 3), number: rest.slice(3) };
  }

  return { area: rest.slice(0, 3), number: rest.slice(3) };
};

export const CheckoutPersonal = ({
  formData,
  handleInputChange,
  handleCuitBlur,
  handlePhoneChange,
}: Props) => {
  const { area, number } = parsePhone(formData.phone);
  const totalDigits = area.length + number.length;
  const isPhoneValid =
    totalDigits === 10 &&
    area.length >= 2 &&
    area.length <= 4 &&
    number.length >= 6 &&
    number.length <= 8;
  const showPhoneError = totalDigits > 0 && !isPhoneValid;

  const handleAreaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextArea = normalizeDigits(e.target.value).slice(0, 4);
    const nextNumber = normalizeDigits(number).slice(0, 8);
    handlePhoneChange(`${nextArea}${nextNumber}`);
  };

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextArea = normalizeDigits(area).slice(0, 4);
    const nextNumber = normalizeDigits(e.target.value).slice(0, 8);
    handlePhoneChange(`${nextArea}${nextNumber}`);
  };

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
            CUIT
          </label>
          <input
            type="text"
            id="cuit"
            name="cuit"
            value={formData.cuit}
            onChange={handleInputChange}
            onBlur={handleCuitBlur}
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
            required
            className="mt-1 p-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
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
            htmlFor="phoneArea"
            className="block text-sm font-medium text-gray-700"
          >
            Teléfono
          </label>
          <div className="mt-1 flex flex-col sm:flex-row sm:items-stretch">
            <span className="inline-flex items-center px-3 rounded-t-md sm:rounded-t-none sm:rounded-l-md border-2 border-gray-300 bg-gray-50 text-gray-500 text-sm h-10">
              +54 9
            </span>
            <span className="inline-flex items-center px-3 border-x-2 sm:border-x-0 sm:border-y-2 border-gray-300 bg-gray-50 text-gray-500 text-sm h-10">
              0
            </span>
            <input
              type="text"
              id="phoneArea"
              name="phoneArea"
              value={area}
              onChange={handleAreaChange}
              inputMode="numeric"
              autoComplete="tel-area-code"
              pattern="\d{2,4}"
              minLength={2}
              maxLength={4}
              required
              aria-invalid={showPhoneError}
              placeholder="Área"
              className={`block w-full sm:w-24 border-x-2 sm:border-x-0 sm:border-y-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-2 h-10 ${
                showPhoneError ? "border-red-500" : "border-gray-300"
              }`}
            />
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={number}
              onChange={handleNumberChange}
              inputMode="numeric"
              autoComplete="tel-local"
              pattern="\d{6,8}"
              minLength={6}
              maxLength={8}
              required
              aria-invalid={showPhoneError}
              placeholder="Número"
              className={`block w-full sm:flex-1 rounded-b-md sm:rounded-b-none sm:rounded-r-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-2 h-10 ${
                showPhoneError ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Ej: 261 5123456</p>
          {showPhoneError && (
            <p className="mt-1 text-xs text-red-600">
              El teléfono debe tener 10 dígitos en total (área 2-4 y número 6-8).
            </p>
          )}
        </div>
        
      </div>
    </div>
  );
};
