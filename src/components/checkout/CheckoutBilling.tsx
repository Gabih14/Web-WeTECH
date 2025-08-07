import React from "react";

interface Props {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CheckoutBilling = ({ formData, handleInputChange }: Props) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Dirección de Facturación
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="billingStreet"
            className="block text-sm font-medium text-gray-700"
          >
            Calle
          </label>
          <input
            type="text"
            id="billingStreet"
            name="billingStreet"
            value={formData.billingStreet}
            onChange={handleInputChange}
            required
            placeholder="Ej: Belgrano"
            className="mt-1 p-2 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
          />
        </div>
        <div>
          <label
            htmlFor="billingNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Número
          </label>
          <input
            type="text"
            id="billingNumber"
            name="billingNumber"
            value={formData.billingNumber}
            onChange={handleInputChange}
            required
            placeholder="Ej: 1234"
            className="mt-1 p-2 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
          />
        </div>
        <div>
          <label
            htmlFor="billingCity"
            className="block text-sm font-medium text-gray-700"
          >
            Ciudad
          </label>
          <input
            type="text"
            id="billingCity"
            name="billingCity"
            value={formData.billingCity}
            onChange={handleInputChange}
            required
            placeholder="Ej: Godoy Cruz"
            className="mt-1 p-2 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
          />
        </div>
        <div>
          <label
            htmlFor="billingPostalCode"
            className="block text-sm font-medium text-gray-700"
          >
            Código Postal
          </label>
          <input
            type="text"
            id="billingPostalCode"
            name="billingPostalCode"
            value={formData.billingPostalCode}
            onChange={handleInputChange}
            required
            placeholder="Ej: 5501"
            className="mt-1 p-2 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
          />
        </div>
      </div>
    </div>
  );
};
