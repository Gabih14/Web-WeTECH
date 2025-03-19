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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically process the payment and order
    alert("¡Gracias por tu compra! Recibirás un email con los detalles.");
    navigate("/");
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
