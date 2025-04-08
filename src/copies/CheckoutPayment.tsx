import { CreditCard } from 'lucide-react'
import React from 'react'

interface Props {
  formData: {
    cardNumber: string;
    cardExpiry: string;
    cardCVC: string;
  };
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CheckoutPayment = ({formData, handleInputChange}: Props) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Información de Pago
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label
                    htmlFor="cardNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Número de Tarjeta
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="1234 5678 9012 3456"
                    className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="cardExpiry"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Vencimiento
                    </label>
                    <input
                      type="text"
                      id="cardExpiry"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={handleInputChange}
                      required
                      placeholder="MM/YY"
                      className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cardCVC"
                      className="block text-sm font-medium text-gray-700"
                    >
                      CVC
                    </label>
                    <input
                      type="text"
                      id="cardCVC"
                      name="cardCVC"
                      value={formData.cardCVC}
                      onChange={handleInputChange}
                      required
                      placeholder="123"
                      className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
  )
}
