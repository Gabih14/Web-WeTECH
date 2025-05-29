import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Truck, MapPin, Tag, Store } from "lucide-react";
import { useCart } from "../context/CartContext";
import { coupons } from "../data/coupons";
import { Coupon } from "../types";

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
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "shipping">(
    "pickup"
  );
  const [shippingCost, setShippingCost] = useState(0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Carrito vacío</h2>
          <p className="mt-2 text-gray-600">No hay productos en tu carrito</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
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
    alert("¡Gracias por tu compra! Recibirás un email con los detalles.");
    navigate("/");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "percentage") {
      return (total * appliedCoupon.discount) / 100;
    }
    return appliedCoupon.discount;
  };

  const calculateShipping = () => {
    setCalculatingShipping(true);
    // Simular cálculo de envío
    setTimeout(() => {
      const cost = Math.round((Math.random() * 20 + 10) * 100) / 100; // Entre $10 y $30
      setShippingCost(cost);
      setCalculatingShipping(false);
    }, 1000);
  };

  const subtotal = total;
  const discount = calculateDiscount();
  const finalTotal =
    subtotal - discount + (deliveryMethod === "shipping" ? shippingCost : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Volver
      </button>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Información Personal
              </h2>
              <div className="grid grid-cols-1 gap-4">
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            {/* MÉTODO DE ENTREGA */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Método de Entrega
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("pickup")}
                    className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 ${
                      deliveryMethod === "pickup"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Store className="h-5 w-5 mr-2" />
                    Retiro en Local
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("shipping")}
                    className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 ${
                      deliveryMethod === "shipping"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Truck className="h-5 w-5 mr-2" />
                    Envío a Domicilio
                  </button>
                </div>

                {deliveryMethod === "pickup" && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900">
                      Dirección del Local
                    </h3>
                    <p className="mt-2 text-gray-600">
                      Av. San Martín 1234
                      <br />
                      Mendoza, Argentina
                      <br />
                      Horario: Lunes a Viernes 9:00 - 18:00
                    </p>
                  </div>
                )}

                {deliveryMethod === "shipping" && (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Dirección
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required={deliveryMethod === "shipping"}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Ciudad
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required={deliveryMethod === "shipping"}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="postalCode"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Código Postal
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          required={deliveryMethod === "shipping"}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={calculateShipping}
                      disabled={calculatingShipping || !formData.postalCode}
                      className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {calculatingShipping
                        ? "Calculando..."
                        : "Calcular Costo de Envío"}
                    </button>
                  </div>
                )}
              </div>
            </div>

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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Confirmar Compra (${finalTotal.toFixed(2)})
            </button>
          </form>
        </div>

        <div className="mt-10 lg:mt-0">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Resumen del Pedido
            </h2>
            <div className="flow-root">
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
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
                          $
                          {(
                            (item.isWholesale
                              ? item.product.wholesalePrice
                              : item.product.price) * item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Cantidad: {item.quantity}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.isWholesale
                          ? "Precio mayorista"
                          : "Precio minorista"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

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
                  ${subtotal.toFixed(2)}
                </dd>
              </div>
              {appliedCoupon && (
                <div className="flex items-center justify-between text-green-600">
                  <dt className="text-sm">Descuento</dt>
                  <dd className="text-sm font-medium">
                    -${discount.toFixed(2)}
                  </dd>
                </div>
              )}
              {deliveryMethod === "shipping" && (
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Envío</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {shippingCost > 0
                      ? `$${shippingCost.toFixed(2)}`
                      : "Por calcular"}
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">Total</dt>
                <dd className="text-base font-medium text-indigo-600">
                  ${finalTotal.toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
