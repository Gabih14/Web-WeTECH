import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Tag, AlertCircle, X} from "lucide-react";
import { useCart } from "../../context/CartContext";
import {  Product } from "../../types";
import { CheckoutPersonal } from "./CheckoutPersonal";
import { CheckoutAdress } from "./CheckoutAdress";

import {
  calculateDiscountedPriceForProduct,
  getDiscountPercentageForProduct,
  shouldApplyDiscount,
} from "../../utils/discounts";

import { fetchClienteByCuit, verifyCoupon, useCoupon } from "../../services/api";

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
  const [shippingData, setShippingData] = useState<{ itemId: string; costoTotal: number } | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "shipping">(
    "pickup"
  );
  const [sameBillingAddress] = useState(true); // por defecto sí
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "transfer">("online");
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
    observaciones: "",
    // Sección de facturación:
    billingStreet: "",
    billingNumber: "",
    billingCity: "",
    billingPostalCode: "",
  });

  const [error, setError] = useState<{ code: string; message: string; retryable: boolean } | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const BEARER_TOKEN = import.meta.env.VITE_API_BEARER_TOKEN; // Se usará cuando el pago esté activo

  // Sincroniza billing con envío si el check está marcado
  useEffect(() => {
    if (sameBillingAddress) {
      setFormData((prev) => ({
        ...prev,
        billingStreet: prev.street,
        billingNumber: prev.number,
        billingCity: prev.city,
        billingPostalCode: prev.postalCode,
      }));
    }
  }, [
    sameBillingAddress,
    formData.street,
    formData.number,
    formData.city,
    formData.postalCode,
  ]);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Ingresa un código de cupón");
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    const couponData = await verifyCoupon(couponCode.toUpperCase());
    
    if (couponData) {
      // Verificar que el cupón esté activo
      if (!couponData.activo) {
        setCouponError("Este cupón no está activo");
        setAppliedCoupon(null);
      } else {
        // Verificar fechas de validez
        const now = new Date();
        if (now < couponData.fechaDesde || now > couponData.fechaHasta) {
          setCouponError("Este cupón no es válido en este momento");
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon(couponData);
          setCouponError("");
        }
      }
    } else {
      setCouponError("Cupón inválido");
      setAppliedCoupon(null);
    }

    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const calculateCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    // El cupón ahora siempre es un porcentaje
    return (total * appliedCoupon.porcentajeDescuento) / 100;
  };

  const getPrice = (product: Product, weight: number): number | undefined => {
    const weightData = product.weights?.find((w) => w.weight === weight);
    return weightData ? weightData.price : product.price;
  };
  /*   const getPromotionalPrice = (
    product: Product,
    weight: number
  ): number | undefined => {
    const weightData = product.weights?.find((w) => w.weight === weight);
    return weightData ? weightData.promotionalPrice : product.promotionalPrice;
  }; */

  const calculateItemPriceWithDiscount = (
    product: Product,
    weight: number,
    quantity: number
  ): number | undefined => {
    const originalPrice = getPrice(product, weight);

    if (originalPrice) {
      if (shouldApplyDiscount(product)) {
        return calculateDiscountedPriceForProduct(
          product,
          originalPrice,
          quantity
        );
      }
      return originalPrice;
    }

    return originalPrice;
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
    const isShipping = deliveryMethod === "shipping";

    // Dirección de envío
    const calle = isShipping ? formData.street : formData.billingStreet;
    // const numero = isShipping ? formData.number : formData.billingNumber;
    const ciudad = isShipping ? formData.city : formData.billingCity;
    const codigo_postal = isShipping
      ? formData.postalCode
      : formData.billingPostalCode;
    const region = "Mendoza";
    const pais = "AR";

    // Dirección de facturación (siempre se envía)
    const billing_address = {
      street: formData.billingStreet,
      number: formData.billingNumber,
      city: formData.billingCity,
      region: region,
      country: pais,
      postal_code: formData.billingPostalCode,
    };

    const couponDiscount = calculateCouponDiscount();
    const finalTotal = total + (shippingData?.costoTotal || 0) - couponDiscount;
    const cleanCuit = formData.cuit.trim().replace(/\D/g, ''); // Remover guiones y caracteres no numéricos

    const body = {
      cliente_nombre: formData.name,
      cliente_cuit: cleanCuit,
      total: Number(finalTotal.toFixed(2)),
      costo_envio: Number((shippingData?.costoTotal || 0).toFixed(2)),
      descuento_cupon: Number(couponDiscount.toFixed(2)),
      codigo_cupon: appliedCoupon?.code || "",
      email: formData.email,
      telefono: formData.phone,
      calle,
      ciudad,
      region,
      pais,
      codigo_postal,
      tipo_envio: deliveryMethod,
      observaciones: formData.observaciones,
      direccion: confirmedAddress || "",
      mobile: isMobile,
      productos: [
        ...items.map((item) => {
          // Buscar el ID original del ítem según el color seleccionado (si aplica)
          const colorData = item.color
            ? item.product.colors?.find(
              (c) => c.name.toLowerCase() === item.color.toLowerCase()
            )
            : undefined;

          const nombre = colorData?.itemId || item.product.id;

          return {
            nombre,
            cantidad: item.quantity,
            precio_unitario:
              calculateItemPriceWithDiscount(
                item.product,
                item.weight,
                item.quantity
              ) ??
              getPrice(item.product, item.weight) ??
              0,
          };
        }),
        // Agregar shipping como producto si aplica
        ...(deliveryMethod === "shipping" && shippingData
          ? [
              {
                nombre: shippingData.itemId,
                cantidad: 1,
                precio_unitario: shippingData.costoTotal,
              },
            ]
          : []),
      ],
      billing_address,
    };
    console.log("Cuerpo de la solicitud de pago:", body);
    const API_URL = import.meta.env.VITE_API_URL; // Se usará cuando el pago esté activo
    try {
      const res = await fetch(`${API_URL}/pedido`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("Respuesta del servidor:", data);
      if (!res.ok) {
        setError(data);
        setShowErrorModal(true);
        return;
      }
      // Manejo de la respuesta exitosa
      if (data?.naveUrl) {
        // Si hay un cupón aplicado, usarlo después de crear la orden
        if (appliedCoupon && data?.id) {
          const cleanCuit = formData.cuit.trim().replace(/\D/g, '');
          try {
            await useCoupon(appliedCoupon.id, cleanCuit, data.id);
            console.log("Cupón utilizado exitosamente");
          } catch (error) {
            console.error("Error al usar el cupón:", error);
            // El cupón no se usó, pero continuamos con la orden
          }
        }
        return data.naveUrl;
      } else if (data?.code && data?.message) {
        // Manejo de errores
        setError(data);
        setShowErrorModal(true);
      } else {
        throw new Error("No se recibió URL de Nave");
      }
    } catch (error) {
      console.error("Error en la solicitud de pago:", error);
      setError({ code: "ERR_INTERNAL", message: "Error en la solicitud de pago", retryable: false });
      setShowErrorModal(true);
    }

  };

  /* END PAYMENT REQUEST */

  /* const handleSameBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSameBillingAddress(checked);

    if (checked) {
      setFormData((prev) => ({
        ...prev,
        billingStreet: prev.street,
        billingNumber: prev.number,
        billingCity: prev.city,
        billingPostalCode: prev.postalCode,
      }));
    }
  }; */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Advertencia y confirmación antes de continuar
    const proceed = window.confirm(
      "Advertencia: esta es una simulación. La compra que estás por realizar no es real. Al presionar Aceptar confirmás que entendés y aceptás esta condición. ¿Deseás continuar?"
    );
    if (!proceed) {
      return; // Aborta el flujo si el usuario no acepta
    }

    setIsLoading(true);
    //navigate("/under-development");
    // Forzar redibujado
    await new Promise((resolve) => setTimeout(resolve, 100));
    const checkoutUrl = await createPaymentRequest();

    if (checkoutUrl) {
      window.location.href = checkoutUrl; // Redirecciona al checkout externo (Agregar timeout si es necesario)
    } else {
      setIsLoading(false);
      console.log("Error al generar el pago");
    }
    // Referencia no-op para evitar warning de TS mientras está en under-development
    if (false) {
      await createPaymentRequest();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCuitBlur = async () => {
    const cuit = formData.cuit.trim().replace(/\D/g, ''); 
    if (!cuit) return;

    const clienteData = await fetchClienteByCuit(cuit);

    if (clienteData) {
      setFormData((prev) => ({
        ...prev,
        name: clienteData.nombre ? clienteData.nombre : prev.name,
        email: clienteData.email ? clienteData.email : prev.email,
        phone: clienteData.telefono ? clienteData.telefono : prev.phone,
        // Autocompletar dirección SIEMPRE
        street: clienteData.calle ? clienteData.calle : prev.street,
        number: clienteData.numero ? clienteData.numero : prev.number,
        city: clienteData.ciudad ? clienteData.ciudad : prev.city,
        postalCode: clienteData.codigo_postal
          ? clienteData.codigo_postal
          : prev.postalCode,
        observaciones: clienteData.observaciones ? clienteData.observaciones : prev.observaciones,
        // Facturación se autocompleta siempre
        billingStreet: clienteData.calle
          ? clienteData.calle
          : prev.billingStreet,
        billingNumber: clienteData.numero
          ? clienteData.numero
          : prev.billingNumber,
        billingCity: clienteData.ciudad ? clienteData.ciudad : prev.billingCity,
        billingPostalCode: clienteData.codigo_postal
          ? clienteData.codigo_postal
          : prev.billingPostalCode,
      }));
    }
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
              handleCuitBlur={handleCuitBlur}
            />

            {/* Método de Pago */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Método de Pago
              </h3>
              <div className="space-y-3">
                {/* Opción Pago en línea (Nave) */}
                <label className="flex items-start p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-yellow-400 hover:bg-yellow-50/50 border-yellow-400 bg-yellow-50/30">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={(e) => setPaymentMethod(e.target.value as "online" | "transfer")}
                    className="mt-1 h-4 w-4 text-yellow-600 focus:ring-yellow-500 flex-shrink-0"
                  />
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="font-medium text-gray-900 text-sm sm:text-base">
                        Pago en línea
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium w-fit">
                        Inmediato
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                      Tarjeta de crédito/débito o billeteras virtuales
                    </p>
                  </div>
                </label>

                {/* Opción Transferencia (Deshabilitada - Próximamente) */}
                <label className="flex items-start p-3 sm:p-4 border-2 rounded-lg border-gray-200 bg-gray-50/50 cursor-not-allowed opacity-60 relative">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="transfer"
                    disabled
                    className="mt-1 h-4 w-4 text-gray-400 cursor-not-allowed flex-shrink-0"
                  />
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-gray-500 text-sm sm:text-base">
                          Transferencia bancaria
                        </span>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                          Próximamente
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                          DESCUENTO
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                      Te enviaremos los datos bancarios por email
                    </p>
                  </div>
                </label>
              </div>

              {/* Mensaje informativo para transferencia (solo si estuviera habilitada) */}
              {paymentMethod === "transfer" && (
                <div className="mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex gap-2 sm:gap-3">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-blue-800 min-w-0">
                      <p className="font-medium mb-1">Importante:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Recibirás los datos bancarios por email</li>
                        <li>El pedido se procesará al confirmar el pago</li>
                        <li>Tiempo de acreditación: 24-48 horas hábiles</li>
                        <li>Se aplicará automáticamente un descuento del 5%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mostrar método de entrega y dirección de envío */}
            <CheckoutAdress
              formData={formData}
              handleInputChange={handleInputChange}
              setShippingData={setShippingData}
              deliveryMethod={deliveryMethod}
              setDeliveryMethod={setDeliveryMethod}
              confirmedAddress={confirmedAddress}
              setConfirmedAddress={setConfirmedAddress}
            />

            {/* Mostrar checkbox y form de facturación si es envío */}
            {/* {deliveryMethod === "shipping" && (
              <>
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sameBillingAddress}
                      onChange={handleSameBillingChange}
                      className="mr-2"
                    />
                    Usar la dirección de envío para la dirección de facturación
                  </label>
                </div>

                {!sameBillingAddress && (
                  <CheckoutBilling
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                )}
              </>
            )} */}

            {/* Mostrar facturación obligatoria si es retiro */}
            {/* {deliveryMethod === "pickup" && (
              <CheckoutBilling
                formData={formData}
                handleInputChange={handleInputChange}
              />
            )} */}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-md transition-colors bg-yellow-400 hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={
                isLoading ||
                (deliveryMethod === "shipping" &&
                  (!shippingData || !confirmedAddress))
              }
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2">Cargando...</span>
                </div>
              ) : paymentMethod === "online" ? (
                `Ir a pagar`
              ) : (
                `Confirmar pedido`
              )}
            </button>

            {deliveryMethod === "shipping" && !isLoading && (
              <div className="mt-2 text-center text-sm text-red-600 font-semibold">
                {!shippingData
                  ? "Debes calcular el costo de envío antes de continuar."
                  : !confirmedAddress
                    ? "Debes confirmar tu dirección antes de continuar."
                    : null}
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
                  {items.map((item, index) => {
                    console.log(item);
                    const price = getPrice(item.product, item.weight);
                    const discountedPrice = calculateItemPriceWithDiscount(
                      item.product,
                      item.weight,
                      item.quantity
                    );
                    const colorHex = item.color
                      ? item.product.colors?.find(
                        (c) =>
                          c.name.toLowerCase() === item.color.toLowerCase()
                      )?.hex
                      : undefined;

                    const itemImage = item.color
                      ? item.product.colors?.find(
                        (c) => c.name.toLowerCase() === item.color.toLowerCase()
                      )?.images?.[0] || item.product.image
                      : item.product.image;

                    const uniqueKey = `${item.product.id}-${item.color || 'default'}-${item.weight}-${index}`;

                    return (
                      <li key={uniqueKey} className="py-4 flex">
                        <div className="flex-shrink-0 w-24 h-24">
                          <img
                            src={itemImage}
                            alt={item.product.name}
                            className="w-full h-full rounded-md object-center object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                {item.product.name}
                              </h3>
                              {item.color && item.color.trim() !== "" && (
                                <div className="mt-1 flex items-center text-xs text-gray-600">
                                  <span className="mr-1">Color:</span>
                                  {colorHex && (
                                    <span
                                      className="inline-block w-3 h-3 rounded-full mr-1 border border-gray-300"
                                      style={{ backgroundColor: colorHex }}
                                    ></span>
                                  )}
                                  <span className="font-medium">
                                    {item.color}
                                  </span>
                                </div>
                              )}
                              {shouldApplyDiscount(item.product) &&
                                discountedPrice &&
                                discountedPrice < (price ?? 0) && (
                                  <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full mt-1">
                                    -
                                    {getDiscountPercentageForProduct(
                                      item.product,
                                      item.quantity
                                    )}
                                    % OFF
                                  </span>
                                )}
                            </div>
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
                      disabled={couponLoading}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {couponLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Verificando...
                        </>
                      ) : (
                        <>
                          <Tag className="h-4 w-4 mr-2" />
                          Aplicar
                        </>
                      )}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-500 text-sm mt-1">{couponError}</p>
                  )}
                  {appliedCoupon && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded-md">
                      <span className="text-green-700 text-sm">
                        Cupón aplicado: {appliedCoupon.id} (
                        {appliedCoupon.porcentajeDescuento}%)
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
                      {(shippingData?.costoTotal || 0).toLocaleString("es-ES", {
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
                  {appliedCoupon && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-green-700">Cupón {appliedCoupon.code}:</span>
                      <span className="text-sm font-bold text-green-700">
                        -$
                        {calculateCouponDiscount().toLocaleString("es-ES", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <dt className="text-base font-medium text-gray-900">
                      Total
                    </dt>
                    <dd className="text-xl font-bold text-black">
                      $
                      {(total + (shippingData?.costoTotal || 0) - calculateCouponDiscount()).toLocaleString("es-ES", {
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

      {/* Modal de error mejorado */}
      {showErrorModal && error && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-slideUp"
            role="dialog"
            aria-modal="true"
            aria-labelledby="error-title"
          >
            {/* Header con ícono y botón cerrar */}
            <div className="relative px-6 pt-6 pb-4">
              <button
                onClick={() => {
                  setShowErrorModal(false);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                
                <div className="flex-1 pt-1">
                  <h3 
                    id="error-title"
                    className="text-xl font-semibold text-gray-900 mb-1"
                  >
                    Error en el pago
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {error.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Mensaje adicional */}
            <div className="px-6 pb-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-700">
                  {error.retryable 
                    ? "💡 Puedes intentar realizar el pago nuevamente." 
                    : "⏰ Por favor, intenta más tarde o contacta con soporte."}
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="px-6 pb-6">
              <button
                onClick={() => {
                  setShowErrorModal(false);
                }}
                className="w-full px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow-md"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
