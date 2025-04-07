import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Product } from "../types";
import { CheckoutPersonal } from "./CheckoutPersonal";
import { CheckoutAdress } from "./CheckoutAdress";
import { CheckoutPayment } from "./CheckoutPayment";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
  });
  const getPrice = (product: Product, weight: number): number | undefined => {
    const weightData = product.weights?.find((w) => w.weight === weight);
    return weightData ? weightData.price : product.price;
  };
  const getPromotionalPrice = (
    product: Product,
    weight: number
  ): number | undefined => {
    const weightData = product.weights?.find((w) => w.weight === weight);
    return weightData ? weightData.promotionalPrice : product.promotionalPrice;
  };
  const calculateDiscountedPrice = (
    product: Product,
    weight: number,
    quantity: number
  ): number | undefined => {
    const price = getPrice(product, weight);
    const promotionalPrice = getPromotionalPrice(product, weight);

    if (product.discountQuantity) {
      const discountThresholds = Object.keys(product.discountQuantity)
        .map(Number)
        .sort((a, b) => a - b);

      const applicableDiscount = discountThresholds.reduce((acc, threshold) => {
        return quantity >= threshold
          ? product.discountQuantity![threshold]
          : acc;
      }, 0);

      if (applicableDiscount > 0) {
        return price ? price - price * applicableDiscount : undefined;
      } else if (promotionalPrice) {
        return promotionalPrice;
      }
    } else if (promotionalPrice) {
      return promotionalPrice;
    }

    return price;
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Carrito vacío</h2>
          <p className="mt-2 text-gray-600">No hay productos en tu carrito</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 inline-flex items-center text-black hover:text-yellow-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  /* PAYMENT REQUEST */
  const createPaymentRequest = async () => {
    const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IllNS3JYbGdJdTJiNlFoNzVWdVp0cyJ9.eyJodHRwczovL25hcmFuamEuY29tL2luZm8iOnsiY2xpZW50SWQiOiJyN2xBVVVaTk51UUZPWUxlM3Y5TEd5ZkxCYWdEaW5xMiIsImNsaWVudE5hbWUiOiJCMkJFeHRlcm5hbEdvbGRNdXNpYyJ9LCJpc3MiOiJodHRwczovL20ybS5zdGFnaW5nLm5hcmFuamF4LmNvbS8iLCJzdWIiOiJyN2xBVVVaTk51UUZPWUxlM3Y5TEd5ZkxCYWdEaW5xMkBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9uYXJhbmphLmNvbS9yYW50eS9tZXJjaGFudHMvYXBpIiwiaWF0IjoxNzQ0MDI3OTk1LCJleHAiOjE3NDQxMTQzOTUsInNjb3BlIjoid3JpdGUuZWNvbW1lcmNlIHdyaXRlLmludGVncmF0aW9uIHdyaXRlLnBheW1lbnRfcmVxdWVzdCIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyIsImF6cCI6InI3bEFVVVpOTnVRRk9ZTGUzdjlMR3lmTEJhZ0RpbnEyIn0.KH1TX0PFuIjvWpcu_NyzSGcIVlGq8FO-ssrzafoTOl3pbZJvKgi3wehjygx7A2pWt-vnt0IZI_B94eslIq3Git-KpWdBFLKgjrg1GctH9MOKBVWArdCG3cDFn_IzCQurmiLAqEUgQLkTY21IspTqSfTOmy6yz_ZK3_oaSv-8hc3j9klnfapGyGLJhdYWwtQmSMDqN6tMDbCXBAlFku16SaBbrb684frZigHfi-TxlS02562wTL9gZn9GFUps80c3-47_hvOZTPK2YQLfp1lEeDuFaiAKSAZdBMNmvyLCMbYAibK8Q4ohJtRiyJVqs0a-ZJgWtJRt76PaJLV1udr7VQ"; // 🔐 reemplazar con tu token real
  
    // Armamos el body para el request
    const body = {
      platform: "platform-x",
      store_id: "store1-platform-x",
      callback_url: `https://platform_x.com.ar/../order/9546`,
      order_id: "9546", // Podés generar un ID dinámico si querés
      mobile: false,
      payment_request: {
        transactions: [
          {
            products: items.map((item) => ({
              id: item.product.id.toString(),
              name: item.product.name,
              description: item.product.description || item.product.name,
              quantity: item.quantity,
              unit_price: {
                currency: "ARS",
                value: calculateDiscountedPrice(
                  item.product,
                  item.weight,
                  item.quantity
                )?.toFixed(2) || "0.00",
              },
            })),
            amount: {
              currency: "ARS",
              value: total.toFixed(2),
            },
          },
        ],
        buyer: {
          user_id: formData.email,
          doc_type: "DNI",
          doc_number: "N/A",
          user_email: formData.email,
          name: formData.name || "N/A",
          phone: formData.phone || "N/A",
          billing_address: {
            street_1: formData.address || "Cliente",
            street_2: "N/A",
            city: formData.city || "1",
            region: "Mendoza", // Podés hacerlo dinámico si querés
            country: "AR",
            zipcode: formData.postalCode || "5000",
          },
        },
      },
    };
  
    try {
      const res = await fetch(
        "https://e3-api.ranty.io/ecommerce/payment_request/external",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
  
      const data = await res.json();
      if (data.success) {
        return data.data.checkout_url;
      } else {
        throw new Error(data.message || "Error al crear la solicitud de pago");
      }
    } catch (error) {
      console.error("Error en createPaymentRequest:", error);
      alert("Hubo un problema al generar el pago.");
      return null;
    }
  };
  /* END PAYMENT REQUEST */  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const checkoutUrl = await createPaymentRequest();
  
    if (checkoutUrl) {
      window.location.href = checkoutUrl; // Redirecciona al checkout externo
    }
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateOriginalTotal = () => {
    return items.reduce((sum, item) => {
      const price = getPrice(item.product, item.weight);
      const itemTotal = price ? price * item.quantity : 0;
      return sum + itemTotal;
    }, 0);
  };

  const originalTotal = calculateOriginalTotal();
  const discount = originalTotal - total;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-black hover:text-yellow-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Volver
      </button>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <CheckoutPersonal formData={formData} handleInputChange={handleInputChange} />
            <CheckoutAdress formData={formData} handleInputChange={handleInputChange} />
            <CheckoutPayment formData={formData} handleInputChange={handleInputChange} />

            <button
              type="submit"
              className="w-full t py-3 px-4 rounded-md bg-yellow-400 hover:bg-yellow-700 transition-colors"
            >
              Confirmar Compra (${total.toFixed(2)})
            </button>
          </form>
        </div>

        <div className="mt-10 lg:mt-0">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Resumen del Pedido
            </h2>
            {items.length > 0 ? (
              <div className="flow-root">
                <ul className="divide-y divide-gray-200">
                  {items.map((item) => {
                    const price = getPrice(item.product, item.weight);
                    const discountedPrice = calculateDiscountedPrice(
                      item.product,
                      item.weight,
                      item.quantity
                    );

                    return (
                      <li key={item.product.id} className="py-4 flex">
                        <div className="flex-shrink-0 w-24 h-24">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full rounded-md object-center object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h3 className="text-sm font-medium text-gray-900">
                              {item.product.name}
                            </h3>
                            <p className="ml-4 text-sm font-medium text-gray-900">
                              {discountedPrice ? (
                                <>
                                  <span className="text-base sm:text-lg font-bold mr-2">
                                    $
                                    {(
                                      discountedPrice * item.quantity
                                    ).toLocaleString("es-ES", {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    })}
                                  </span>
                                  <span className="text-sm sm:text-base text-gray-400 font-bold line-through">
                                    $
                                    {(
                                      (price ?? 0) * item.quantity
                                    ).toLocaleString("es-ES", {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    })}
                                  </span>
                                </>
                              ) : (
                                <span className="text-base sm:text-lg font-bold">
                                  $
                                  {(
                                    (price ?? 0) * item.quantity
                                  ).toLocaleString("es-ES", {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  })}
                                </span>
                              )}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <dl className="border-t border-gray-200 py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Subtotal</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      $
                      {originalTotal.toLocaleString("es-ES", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Envío</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      Gratis
                    </dd>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-medium">Descuento:</span>
                    <span className="text-lg font-bold text-red-500">
                      -$
                      {discount.toLocaleString("es-ES", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <dt className="text-base font-medium text-gray-900">
                      Total
                    </dt>
                    <dd className="text-xl font-bold text-black">
                      $
                      {total.toLocaleString("es-ES", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No hay productos en tu carrito.</p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Volver a la tienda
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
