import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Tag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Coupon, Product } from "../types";
import { CheckoutPersonal } from "./CheckoutPersonal";
import { CheckoutAdress } from "./CheckoutAdress";

import { coupons } from "../data/coupon";
/* import { CheckoutPayment } from "./CheckoutPayment"; */

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  React.useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    mediaQueryList.addEventListener("change", listener);
    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export default function Checkout() {
  const [confirmedAddress, setConfirmedAddress] = useState<string | null>(null);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)"); // Detecta si es móvil
  const { items, total } = useCart();
  const [shippingCost, setShippingCost] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "shipping">(
    "pickup"
  );

  const [formData, setFormData] = useState({
    cuit: "",
    name: "",
    email: "",
    phone: "",
    street: "",
    number: "",
    distance: 0,
    city: "",
    postalCode: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");

  const applyCoupon = () => {
    const foundCoupon = coupons.find(
      (c) => c.code === couponCode.toUpperCase()
    );
    if (foundCoupon) {
      setAppliedCoupon(foundCoupon);
      setCouponError("");
    } else {
      setCouponError("Cupón inválido");
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  /*  const calculateCoupounDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percentage') {
      return (total * appliedCoupon.discount) / 100;
    }
    return appliedCoupon.discount;
  }; */

  const [isLoading, setIsLoading] = useState(false);

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
    /* obtener este token desde el backend */
    const token = import.meta.env.VITE_TOKEN_NAVE; // 🔐 reemplazar con tu token real

    // Armamos el body para el request
    const body = {
      platform: "platform-x",
      store_id: "store1-platform-x",
      callback_url: `https://platform_x.com.ar/../order/9546`,
      order_id: "9546", // Podés generar un ID dinámico si querés
      mobile: isMobile,
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
                value:
                  calculateDiscountedPrice(
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
            street_1: formData.street || "Cliente",
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
    setIsLoading(true);
    // Forzar redibujado
    await new Promise((resolve) => setTimeout(resolve, 100));
    const checkoutUrl = await createPaymentRequest();

    if (checkoutUrl) {
      window.location.href = checkoutUrl; // Redirecciona al checkout externo
      /* setTimeout(() => {
        window.location.href = checkoutUrl; // Redirecciona al checkout externo
      }, 500); // Agrega un retraso de 500ms */
    } else {
      setIsLoading(false);
      alert("Error al generar el pago");
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-black hover:text-yellow-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Volver
      </button>

      <div className="grid grid-cols-1 lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <CheckoutPersonal
              formData={formData}
              handleInputChange={handleInputChange}
            />
            <CheckoutAdress
              formData={formData}
              handleInputChange={handleInputChange}
              setShippingCost={setShippingCost}
              deliveryMethod={deliveryMethod}
              setDeliveryMethod={setDeliveryMethod}
              confirmedAddress={confirmedAddress}
              setConfirmedAddress={setConfirmedAddress}
            />
            {/* <CheckoutPayment formData={formData} handleInputChange={handleInputChange} /> */}

            {/* <button
              type="submit"
              className="w-full t py-3 px-4 rounded-md bg-yellow-400 hover:bg-yellow-700 transition-colors"
            >
              Confirmar Compra (${total.toFixed(2)})
            </button> */}
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-md transition-colors ${
                isLoading ||
                (deliveryMethod === "shipping" && shippingCost === 0)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-700"
              }`}
              disabled={
                isLoading ||
                (deliveryMethod === "shipping" &&
                  (!shippingCost || !confirmedAddress))
              }
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2">Cargando...</span>
                </div>
              ) : (
                `Ir a pagar`
              )}
            </button>
            {deliveryMethod === "shipping" &&
              shippingCost === 0 &&
              !isLoading && (
                <div className="mt-2 text-center text-sm text-red-600 font-semibold">
                  Debes calcular el costo de envío antes de continuar.
                </div>
              )}
            <div className="text-xs text-gray-500 text-center mt-4">
              Al confirmar tu compra aceptas nuestros términos y condiciones
            </div>
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
                            <div className="ml-4 text-sm font-medium text-gray-900">
                              {discountedPrice &&
                              discountedPrice < (price ?? 0) ? (
                                <div className="flex flex-wrap items-center">
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
                                </div>
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
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-6">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Código de cupón"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <button
                      onClick={applyCoupon}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center"
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      Aplicar
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-500 text-sm mt-1">{couponError}</p>
                  )}
                  {appliedCoupon && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded-md">
                      <span className="text-green-700 text-sm">
                        Cupón aplicado: {appliedCoupon.code}(
                        {appliedCoupon.type === "percentage"
                          ? `${appliedCoupon.discount}%`
                          : `$${appliedCoupon.discount}`}
                        )
                      </span>
                      <button
                        onClick={removeCoupon}
                        className="text-green-700 hover:text-green-800 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
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
                      $
                      {shippingCost.toLocaleString("es-ES", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
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
                      {(total + shippingCost).toLocaleString("es-ES", {
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
