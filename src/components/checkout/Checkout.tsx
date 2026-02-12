import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Tag, AlertCircle, X, ChevronRight, ChevronLeft} from "lucide-react";
import { useCart } from "../../context/CartContext";
import {  Product } from "../../types";
import { CheckoutPersonal } from "./CheckoutPersonal";
import { CheckoutAdress } from "./CheckoutAdress";
import { StepIndicator } from "./StepIndicator";

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
  const { items, total, clearCart } = useCart();
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

  // Estados para el wizard de pasos
  const [currentStep, setCurrentStep] = useState(1);
  const steps = [
    { number: 1, title: "Información Personal", description: "Datos de contacto" },
    { number: 2, title: "Método de Pago", description: "Selecciona cómo pagar" },
    { number: 3, title: "Entrega", description: "Dirección y envío" },
    { number: 4, title: "Resumen", description: "Confirma tu pedido" },
  ];

  const BEARER_TOKEN = import.meta.env.VITE_API_BEARER_TOKEN; // Se usará cuando el pago esté activo

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

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

  // Calcular precio para checkout considerando método de pago
  const calculateItemPriceForCheckout = (
    product: Product,
    weight: number,
    quantity: number
  ): number | undefined => {
    const originalPrice = getPrice(product, weight);

    if (originalPrice) {
      // Solo aplicar descuento si el método de pago es transferencia
      if (paymentMethod === "transfer" && shouldApplyDiscount(product)) {
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
    const finalTotal = checkoutTotal + (shippingData?.costoTotal || 0) - couponDiscount;
    const cleanCuit = formData.cuit.trim().replace(/\D/g, ''); // Remover guiones y caracteres no numéricos

    const body = {
      cliente_nombre: formData.name,
      cliente_cuit: cleanCuit,
      total: Number(finalTotal.toFixed(2)),
      costo_envio: Number((shippingData?.costoTotal || 0).toFixed(2)),
      descuento_cupon: Number(couponDiscount.toFixed(2)),
      codigo_cupon: appliedCoupon?.code || "",
      metodo_pago: paymentMethod,
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
              calculateItemPriceForCheckout(
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
      //console.log("Respuesta del servidor:", data);
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
      // Limpiar el carrito antes de redirigir al pago
      clearCart();
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

  // Calcular total del checkout según método de pago
  const calculateCheckoutTotal = () => {
    return items.reduce((sum, item) => {
      const price = calculateItemPriceForCheckout(item.product, item.weight, item.quantity);
      const itemTotal = price ? price * item.quantity : 0;
      return sum + itemTotal;
    }, 0);
  };

  const originalTotal = calculateOriginalTotal();
  const checkoutTotal = calculateCheckoutTotal();
  const discount = originalTotal - total;
  const checkoutDiscount = paymentMethod === "transfer" ? discount : 0;

  // Funciones de navegación del wizard
  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 1: // Información Personal
        return !!(
          formData.cuit &&
          formData.name &&
          formData.email &&
          formData.phone
        );
      case 2: // Método de Pago
        return !!paymentMethod;
      case 3: // Entrega
        if (deliveryMethod === "pickup") {
          return true;
        }
        // Si es shipping, debe tener dirección confirmada y costo calculado
        return !!(
          formData.street &&
          formData.number &&
          formData.city &&
          formData.postalCode &&
          shippingData &&
          confirmedAddress
        );
      case 4: // Resumen
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (canProceedToNextStep() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Renderizar el contenido del paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CheckoutPersonal
            formData={formData}
            handleInputChange={handleInputChange}
            handleCuitBlur={handleCuitBlur}
          />
        );
      case 2:
        return (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Método de Pago
            </h3>
            <div className="space-y-3">
              {/* Opción Pago en línea (Nave) */}
              <label
                className={`flex items-start p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-gray-400 hover:bg-gray-50/60 bg-white ${
                  paymentMethod === "online"
                    ? "border-yellow-400"
                    : "border-gray-200"
                }`}
              >
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

              {/* Opción Transferencia (Habilitada con descuento) */}
              <label
                className={`flex items-start p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-gray-400 hover:bg-gray-50/60 bg-white ${
                  paymentMethod === "transfer"
                    ? "border-yellow-400"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transfer"
                  checked={paymentMethod === "transfer"}
                  onChange={(e) => setPaymentMethod(e.target.value as "online" | "transfer")}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 flex-shrink-0"
                />
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-medium text-gray-900">
                        Transferencia Bancaria
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Con descuento
                      </span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    Descuentos por cantidad en productos seleccionados
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
                      <li>Descuentos aplicables: 15% (1+ unidad), 17% (5+), 20% (10+), 22% (50+)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <CheckoutAdress
            formData={formData}
            handleInputChange={handleInputChange}
            setShippingData={setShippingData}
            deliveryMethod={deliveryMethod}
            setDeliveryMethod={setDeliveryMethod}
            confirmedAddress={confirmedAddress}
            setConfirmedAddress={setConfirmedAddress}
          />
        );
      case 4:
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirma tu Pedido
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Revisa que toda la información sea correcta antes de proceder al pago
              </p>
            </div>

            {/* Información Personal */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  Información Personal
                </h4>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Editar
                </button>
              </div>
              <dl className="text-sm space-y-1">
                <div className="flex justify-between">
                  <dt className="text-gray-600">CUIT:</dt>
                  <dd className="text-gray-900 font-medium">{formData.cuit}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Nombre:</dt>
                  <dd className="text-gray-900 font-medium">{formData.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Email:</dt>
                  <dd className="text-gray-900 font-medium">{formData.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Teléfono:</dt>
                  <dd className="text-gray-900 font-medium">{formData.phone}</dd>
                </div>
              </dl>
            </div>

            {/* Método de Pago */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  Método de Pago
                </h4>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Editar
                </button>
              </div>
              <p className="text-sm text-gray-900 font-medium">
                {paymentMethod === "online" ? "Pago en línea" : "Transferencia bancaria"}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {paymentMethod === "online" 
                  ? "Tarjeta de crédito/débito o billeteras virtuales"
                  : "Se enviarán los datos bancarios por email"}
              </p>
              
              {/* Recordatorio para transferencia */}
              {paymentMethod === "transfer" && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800">
                      <p className="font-medium mb-1">Recordatorio:</p>
                      <p>Una vez confirmado el pedido, deberás enviar el comprobante de transferencia por WhatsApp para que tu pedido sea procesado.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Método de Entrega */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  Método de Entrega
                </h4>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Editar
                </button>
              </div>
              <p className="text-sm text-gray-900 font-medium mb-2">
                {deliveryMethod === "pickup" ? "Retiro en Local" : "Envío a Domicilio"}
              </p>
              {deliveryMethod === "pickup" ? (
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Santiago de Liniers 670</p>
                  <p>Godoy Cruz, Mendoza</p>
                  <p className="mt-2">
                    <span className="font-medium">Horario:</span> Lunes a Viernes 10:00 - 19:00
                  </p>
                  <p>Sábados: 10:00 - 14:00</p>
                </div>
              ) : (
                <div className="text-xs text-gray-600 space-y-1">
                  <p>{confirmedAddress}</p>
                  {formData.observaciones && (
                    <p className="mt-2">
                      <span className="font-medium">Observaciones:</span> {formData.observaciones}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Importante:</p>
                  <p>
                    Al hacer clic en "Ir a pagar" serás redirigido a la plataforma de pago seguro
                    para completar tu compra.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ); // El resumen se muestra en la columna derecha
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-black hover:text-yellow-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Volver
      </button>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} steps={steps} />

      <div className="grid grid-cols-1 lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Renderizar el paso actual */}
            <div className="animate-fadeIn">
              {renderCurrentStep()}
            </div>

            {/* Botones de navegación */}
            <div className="flex gap-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 flex items-center justify-center py-3 px-4 rounded-md border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Anterior
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedToNextStep()}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md transition-colors ${
                    currentStep === 1 ? 'w-full' : ''
                  } ${
                    canProceedToNextStep()
                      ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continuar
                  <ChevronRight className="h-5 w-5 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-md transition-colors bg-yellow-400 hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isLoading}
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
              )}
            </div>

            {/* Mensaje de validación para paso 3 */}
            {currentStep === 3 && deliveryMethod === "shipping" && !isLoading && (
              <div className="mt-2 text-center text-sm text-red-600 font-semibold">
                {!shippingData
                  ? "Debes calcular el costo de envío antes de continuar."
                  : !confirmedAddress
                    ? "Debes confirmar tu dirección antes de continuar."
                    : null}
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-xs text-gray-500 text-center mt-4">
                Al confirmar tu compra aceptas nuestros términos y condiciones
              </div>
            )}
          </form>
        </div>

        <div className="mt-10 lg:mt-0">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Resumen del Pedido
            </h2>
            {items.length > 0 ? (
              <div className="flow-root">
                <ul className="divide-y divide-gray-200">
                  {items.map((item, index) => {
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
                {currentStep === 4 && (
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
                )}
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
                      {checkoutDiscount.toLocaleString("es-ES", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  {paymentMethod === "online" && discount > 0 && (
                    <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
                      <span>Descuento disponible con transferencia:</span>
                      <span className="font-medium">
                        -$
                        {discount.toLocaleString("es-ES", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  )}
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
                      {(checkoutTotal + (shippingData?.costoTotal || 0) - calculateCouponDiscount()).toLocaleString("es-ES", {
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

          {/* Invitación al formulario de feedback */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-lg shadow-sm border border-blue-200 mt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">💬</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  ¿Nos ayudas a mejorar?
                </h3>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  Tu opinión sobre la experiencia de compra es muy valiosa para nosotros.
                </p>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfQsKpid_G41javou3KaZcoULz0VXpRJQKtGnhdBk8P92CJIQ/viewform?usp=publish-editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 hover:shadow-md"
                >
                  Compartir mi opinión
                </a>
              </div>
            </div>
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
