import { MapPin, Store, Truck, AlertCircle, X, CheckCircle } from "lucide-react"; //MapPin,
import { useCallback, useEffect, useRef, useState } from "react";
import { ShippingInfoModal } from "./ShippingInfoModal";
import { apiFetch } from "../../services/api";

type Props = {
  formData: {
    street: string;
    number: string;
    city: string;
    postalCode: string;
    distance: number;
    observaciones: string;
  };
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setShippingData: (data: { itemId: string; costoTotal: number } | null) => void;
  deliveryMethod: "pickup" | "shipping";
  setDeliveryMethod: (method: "pickup" | "shipping") => void;
  confirmedAddress: string | null;
  setConfirmedAddress: (address: string | null) => void;
};

type DistanceResponse = {
  distance?: string;
  duration?: string;
  destinationResolved?: string;
  originResolved?: string;
  raw?: {
    distance?: {
      text: string;
      value: number;
    };
    duration?: {
      text: string;
      value: number;
    };
    status?: string;
  };
  error?: string;
  detail?: string;
  needsMoreSpecificAddress?: boolean;
};

type MapSelection = {
  address: string;
  distanceKm: number;
};

type GoogleMapsApi = {
  maps: {
    Map: new (
      element: HTMLElement,
      options: {
        center: { lat: number; lng: number };
        zoom: number;
        mapTypeControl?: boolean;
        streetViewControl?: boolean;
        fullscreenControl?: boolean;
      }
    ) => GoogleMap;
    Marker: new (
      options: {
        map: GoogleMap;
        position: { lat: number; lng: number };
        draggable?: boolean;
      }
    ) => GoogleMarker;
    Geocoder: new () => GoogleGeocoder;
    DistanceMatrixService: new () => GoogleDistanceMatrixService;
    DistanceMatrixStatus: { OK: string };
    DistanceMatrixElementStatus: { OK: string };
    TravelMode: { DRIVING: string };
  };
};

type GoogleMap = {
  setCenter: (position: { lat: number; lng: number }) => void;
};

type GoogleMarker = {
  setPosition: (position: { lat: number; lng: number }) => void;
  addListener: (eventName: string, callback: () => void) => void;
  getPosition: () => { lat: () => number; lng: () => number } | null;
};

type GoogleGeocoder = {
  geocode: (
    request: { address?: string; location?: { lat: number; lng: number } },
    callback: (
      results: Array<{
        formatted_address: string;
        geometry: { location: { lat: () => number; lng: () => number } };
      }> | null,
      status: string
    ) => void
  ) => void;
};

type GoogleDistanceMatrixService = {
  getDistanceMatrix: (
    request: {
      origins: string[];
      destinations: Array<{ lat: number; lng: number }>;
      travelMode: string;
    },
    callback: (
      response: {
        rows: Array<{
          elements: Array<{
            status: string;
            distance?: { value: number };
          }>;
        }>;
      } | null,
      status: string
    ) => void
  ) => void;
};

declare global {
  interface Window {
    google?: GoogleMapsApi;
    __checkoutGoogleMapsPromise?: Promise<GoogleMapsApi>;
  }
}

const getShippingErrorMessage = (data: DistanceResponse) => {
  const parts = [data.error, data.detail].filter(Boolean);
  return parts.length
    ? parts.join(". ")
    : "No se pudo calcular la distancia. Verifica la dirección.";
};

const ENABLE_SHIPPING_MAP_PREVIEW = true;
const STORE_ADDRESS = "Santiago de Liniers 670, Godoy Cruz, Mendoza, Argentina";

const loadGoogleMaps = (apiKey: string): Promise<GoogleMapsApi> => {
  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (window.__checkoutGoogleMapsPromise) {
    return window.__checkoutGoogleMapsPromise;
  }

  window.__checkoutGoogleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-checkout-google-maps="true"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.google?.maps) resolve(window.google);
        else reject(new Error("Google Maps no esta disponible."));
      });
      existingScript.addEventListener("error", () => reject(new Error("No se pudo cargar Google Maps.")));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.dataset.checkoutGoogleMaps = "true";
    script.onload = () => {
      if (window.google?.maps) resolve(window.google);
      else reject(new Error("Google Maps no esta disponible."));
    };
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps."));
    document.head.appendChild(script);
  });

  return window.__checkoutGoogleMapsPromise;
};

const getDistanceFromStore = (
  google: GoogleMapsApi,
  destination: { lat: number; lng: number }
) =>
  new Promise<number>((resolve, reject) => {
    const distanceService = new google.maps.DistanceMatrixService();

    distanceService.getDistanceMatrix(
      {
        origins: [STORE_ADDRESS],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        const element = response?.rows?.[0]?.elements?.[0];

        if (
          status !== google.maps.DistanceMatrixStatus.OK ||
          !element ||
          element.status !== google.maps.DistanceMatrixElementStatus.OK ||
          !element.distance
        ) {
          reject(new Error("No se pudo calcular la distancia desde el mapa."));
          return;
        }

        resolve(element.distance.value / 1000);
      }
    );
  });

const GoogleMapPicker = ({
  address,
  apiKey,
  onLocationChange,
}: {
  address: string;
  apiKey: string;
  onLocationChange: (selection: MapSelection) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const markerRef = useRef<GoogleMarker | null>(null);
  const geocoderRef = useRef<GoogleGeocoder | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const updateSelection = async (
      google: GoogleMapsApi,
      position: { lat: number; lng: number }
    ) => {
      if (!geocoderRef.current) return;

      geocoderRef.current.geocode({ location: position }, async (results, status) => {
        if (!isMounted || status !== "OK" || !results?.[0]) return;

        try {
          const distanceKm = await getDistanceFromStore(google, position);
          if (!isMounted) return;

          onLocationChange({
            address: results[0].formatted_address,
            distanceKm,
          });
        } catch (error) {
          console.error(error);
          if (isMounted) setLoadError("No se pudo recalcular la distancia desde el mapa.");
        }
      });
    };

    loadGoogleMaps(apiKey)
      .then((google) => {
        if (!isMounted || !containerRef.current) return;

        geocoderRef.current = new google.maps.Geocoder();
        geocoderRef.current.geocode({ address }, (results, status) => {
          if (!isMounted || !containerRef.current || status !== "OK" || !results?.[0]) {
            console.error("GoogleMapPicker: no se pudo geocodificar la direccion.", {
              address,
              status,
              results,
            });
            setLoadError("No se pudo ubicar esta direccion en el mapa.");
            return;
          }

          const location = results[0].geometry.location;
          const position = { lat: location.lat(), lng: location.lng() };

          if (!mapRef.current) {
            mapRef.current = new google.maps.Map(containerRef.current, {
              center: position,
              zoom: 16,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
            });
          } else {
            mapRef.current.setCenter(position);
          }

          if (!markerRef.current) {
            markerRef.current = new google.maps.Marker({
              map: mapRef.current,
              position,
              draggable: true,
            });

            markerRef.current.addListener("dragend", () => {
              const markerPosition = markerRef.current?.getPosition();
              if (!markerPosition) return;

              updateSelection(google, {
                lat: markerPosition.lat(),
                lng: markerPosition.lng(),
              });
            });
          } else {
            markerRef.current.setPosition(position);
          }
        });
      })
      .catch((error) => {
        console.error("GoogleMapPicker: no se pudo cargar Google Maps.", {
          address,
          error,
        });
        if (isMounted) setLoadError("No se pudo cargar el mapa interactivo.");
      });

    return () => {
      isMounted = false;
    };
  }, [address, apiKey, onLocationChange]);

  return (
    <>
      <div ref={containerRef} className="h-64 w-full" />
      {loadError && (
        <p className="border-t border-yellow-100 bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
          {loadError}
        </p>
      )}
    </>
  );
};

export const CheckoutAdress = ({
  formData,
  handleInputChange,
  setShippingData,
  deliveryMethod,
  setDeliveryMethod,
  confirmedAddress,
  setConfirmedAddress,
}: Props) => {
  // const GOOGLE_API_KEY = "AIzaSyCDesHGPMQEk72w8X9sFRu1O1rzno9UopQ";

  const [showShippingInfo, setShowShippingInfo] = useState(false);
  const [shippingInfoChecked, setShippingInfoChecked] = useState(false);
  const [showShippingErrorModal, setShowShippingErrorModal] = useState(false);
  const [shippingError, setShippingError] = useState<{ message: string; retryable: boolean } | null>(null);
  const [pendingResolvedAddress, setPendingResolvedAddress] = useState<string | null>(null);
  const [pendingDistance, setPendingDistance] = useState<number | null>(null);
  const streetInputRef = useRef<HTMLInputElement>(null);
  const isShippingFormComplete = Boolean(
    formData.street &&
    formData.number &&
    formData.city &&
    formData.postalCode
  );
  // Función para calcular el costo de envío
  const calculateShippingCost = async (distance: number): Promise<{ itemId: string; costoTotal: number } | null> => {
    try {
      // Redondear la distancia al entero más cercano para el endpoint
      const roundedDistance = Math.round(distance);
      const response = await apiFetch(`/stk-item/costo/${roundedDistance}`);
      console.log("Costo de envío recibido:", response);
      return { itemId: response.itemId, costoTotal: response.costoTotal };
    } catch (error) {
      console.error("Error al obtener costo de envío:", error);
      return null;
    }
  };
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const BEARER_TOKEN = import.meta.env.VITE_API_BEARER_TOKEN;
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasLoggedMissingGoogleMapsApiKeyRef = useRef(false);
  const mapQuery = encodeURIComponent(
    pendingResolvedAddress ||
      confirmedAddress ||
      `${formData.street} ${formData.number}, ${formData.city}, Mendoza, Argentina`
  );
  const mapUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const resetConfirmedShipping = () => {
    setPendingResolvedAddress(null);
    setPendingDistance(null);
    setConfirmedAddress(null);
    setShippingData(null);
  };

  const editAddressFromMap = () => {
    resetConfirmedShipping();
    window.requestAnimationFrame(() => {
      streetInputRef.current?.focus();
      streetInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const handleMapSelection = useCallback(
    (selection: MapSelection) => {
      setConfirmedAddress(null);
      setShippingData(null);
      setPendingResolvedAddress(selection.address);
      setPendingDistance(selection.distanceKm);
    },
    [setConfirmedAddress, setShippingData]
  );

  const renderMap = (title: string, heightClass = "h-64") => {
    if (!GOOGLE_MAPS_API_KEY) {
      if (!hasLoggedMissingGoogleMapsApiKeyRef.current) {
        console.warn(
          "CheckoutAdress: VITE_GOOGLE_MAPS_API_KEY no esta configurada. Se usa iframe de Google Maps sin selector interactivo."
        );
        hasLoggedMissingGoogleMapsApiKeyRef.current = true;
      }

      return (
        <iframe
          title={title}
          src={mapUrl}
          className={`${heightClass} w-full`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      );
    }

    return (
      <GoogleMapPicker
        address={decodeURIComponent(mapQuery)}
        apiKey={GOOGLE_MAPS_API_KEY}
        onLocationChange={handleMapSelection}
      />
    );
  };

  const handleAddressInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    handleInputChange(event as React.ChangeEvent<HTMLInputElement>);

    if (
      ENABLE_SHIPPING_MAP_PREVIEW &&
      ["street", "number", "city", "postalCode"].includes(event.target.name)
    ) {
      resetConfirmedShipping();
    }
  };

  const confirmPendingAddress = async () => {
    if (!pendingResolvedAddress || pendingDistance === null) {
      return;
    }

    setCalculatingShipping(true);
    setShippingError(null);

    try {
      if (pendingDistance > 20) {
        setShippingError({ message: "La distancia supera los 20 km. El envÃ­o no estÃ¡ permitido.", retryable: false });
        setShowShippingErrorModal(true);
        setShippingData(null);
        return;
      }

      const shippingInfo = await calculateShippingCost(pendingDistance);
      if (shippingInfo) {
        setConfirmedAddress(pendingResolvedAddress);
        setShippingData(shippingInfo);
        setPendingResolvedAddress(null);
        setPendingDistance(null);
      } else {
        setShippingError({ message: "No se pudo calcular el costo de envÃ­o.", retryable: true });
        setShowShippingErrorModal(true);
        setShippingData(null);
      }
    } finally {
      setCalculatingShipping(false);
    }
  };

  const isCalculateShippingDisabled =
    calculatingShipping || !shippingInfoChecked || !isShippingFormComplete;
  const calculateShippingHelpText = isCalculateShippingDisabled
    ? "Completá la dirección y aceptá la información de envíos."
    : "Calculamos distancia y costo antes de continuar.";
  // Función para obtener la distancia desde la API de Google
  const fetchDistance = async () => {
    setCalculatingShipping(true);
    if (ENABLE_SHIPPING_MAP_PREVIEW) {
      resetConfirmedShipping();
    }
    try {
      if (!isShippingFormComplete) {
        setShippingError({
          message: "Completa calle, numero, ciudad y codigo postal para calcular el envio.",
          retryable: true,
        });
        setShowShippingErrorModal(true);
        return;
      }

      let data: DistanceResponse;
      
      // Simulación en desarrollo
      if (import.meta.env.DEV) { //import.meta.env.DEV
        // Simular respuesta de la API
        data = {
          distance: "3.6 km",
          duration: "11 mins",
          destinationResolved: "33 Orientales 369, M5501AQG Mendoza, Argentina",
          originResolved: "Santiago de Liniers 670, M5501 Godoy Cruz, Mendoza, Argentina",
          raw: {
            distance: {
              text: "3.6 km",
              value: 3640,
            },
            duration: {
              text: "11 mins",
              value: 661,
            },
            status: "OK",
          },
        };
        console.log("Respuesta simulada (desarrollo):", data);
      } else {
        // Fetch real en producción
        const response = await fetch(`${API_URL}/maps/distance`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${BEARER_TOKEN}`,"Content-Type": "application/json" },
          body: JSON.stringify({
            address: `${formData.street} ${formData.number}`,
            city: formData.city,
            province: "Mendoza",
            country: "Argentina",
            postalCode: formData.postalCode,
          }),
        });
        data = await response.json();
        console.log("Respuesta del backend:", data);

        if (!response.ok || data.error || data.detail) {
          setShippingError({
            message: getShippingErrorMessage(data),
            retryable: data.needsMoreSpecificAddress ?? true,
          });
          setShowShippingErrorModal(true);
          setConfirmedAddress(null);
          setShippingData(null);
          return;
        }
      }

      if (data && data.distance && data.destinationResolved) {
        const previewDistanceText = data.distance;
        const previewDistanceValue = parseFloat(previewDistanceText.replace(" km", ""));

        if (!Number.isFinite(previewDistanceValue)) {
          setShippingError({ message: "No se pudo interpretar la distancia de envÃ­o.", retryable: true });
          setShowShippingErrorModal(true);
          return;
        }

        if (ENABLE_SHIPPING_MAP_PREVIEW) {
          setPendingResolvedAddress(data.destinationResolved);
          setPendingDistance(previewDistanceValue);
          return;
        }

        const isConfirmed = window.confirm(
          `¿Este es tu domicilio?\n\n${data.destinationResolved}\n\nPresiona "Aceptar" si es correcto, o "Cancelar" para volver a intentarlo con datos más precisos.`
        );

        if (!isConfirmed) {
          setCalculatingShipping(false);
          setConfirmedAddress(null);
          return;
        }

        setConfirmedAddress(data.destinationResolved);

        if (previewDistanceValue > 20) {
          setShippingError({ message: "La distancia supera los 20 km. El envío no está permitido.", retryable: false });
          setShowShippingErrorModal(true);
          setShippingData(null);
        } else {
          const shippingInfo = await calculateShippingCost(previewDistanceValue);
          if (shippingInfo) {
            setShippingData(shippingInfo);
          } else {
            setShippingError({ message: "No se pudo calcular el costo de envío.", retryable: true });
            setShowShippingErrorModal(true);
            setShippingData(null);
          }
        }
      } else {
        setShippingError({ message: getShippingErrorMessage(data), retryable: true });
        setShowShippingErrorModal(true);
      }
    } catch (error) {
      console.error("Error al obtener la distancia:", error);
      setShippingError({ message: "Hubo un error al calcular la distancia. Inténtalo de nuevo.", retryable: true });
      setShowShippingErrorModal(true);
    } finally {
      setCalculatingShipping(false);
    }
  };

  // Cuando cambia el método de entrega:
  const handleDeliveryMethod = (method: "pickup" | "shipping") => {
    setDeliveryMethod(method);
    if (method === "pickup") {
      setShippingData(null);
      setPendingResolvedAddress(null);
      setPendingDistance(null);
    }
    // Si es shipping, el costo se calcula con fetchDistance
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Método de Entrega
      </h2>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row w-full gap-2">
          <button
            type="button"
            onClick={() => handleDeliveryMethod("pickup")}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all
      ${
        deliveryMethod === "pickup"
          ? "border-yellow-600 bg-yellow-50 text-yellow-700"
          : "border-gray-300 hover:border-gray-400"
      }
    `}
          >
            <Store className="h-5 w-5 mr-2" />
            Retiro en Local
          </button>
          <button
            type="button"
            onClick={() => handleDeliveryMethod("shipping")}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all
      ${
        deliveryMethod === "shipping"
          ? "border-yellow-600 bg-yellow-50 text-yellow-700"
          : "border-gray-300 hover:border-gray-400"
      }
    `}
          >
            <Truck className="h-5 w-5 mr-2" />
            Envío a Domicilio
          </button>
        </div>

        {deliveryMethod === "pickup" && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900">Dirección del Local</h3>
            <p className="mt-2 text-gray-600">
              Santiago de Liniers 670
              <br />
              Godoy Cruz, Mendoza
              <br />
              Horario: Lunes a Viernes{" "}
              <span className="font-bold">10:00 - 19:00</span>
              <br />
              Sábados: <span className="font-bold">10:00 - 14:00</span>
              <br />
              <br />
              <a
                href="https://maps.app.goo.gl/NbjkqZgv72pkWcTR8"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-700 transition"
              >
                Ver en Google Maps
              </a>
            </p>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-100">
            <MapPin className="inline-block h-4 w-4 mr-1 text-blue-500" />
            Completá tu dirección para que podamos registrar correctamente el pedido.
          </p>
          {deliveryMethod === "shipping" && (
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-100">
              <MapPin className="inline-block h-4 w-4 mr-1 text-blue-500" />
              Solo se muestran las provincias donde se realizan envíos
            </p>
          )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700"
                >
                  País
                </label>
                <input
                  type="text"
                  id="country"
                  value="Argentina"
                  disabled
                  className="mt-1 p-2 block w-full rounded-md border-gray-300 bg-gray-100 cursor-not-allowed shadow-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="province"
                  className="block text-sm font-medium text-gray-700"
                >
                  Provincia
                </label>
                <input
                  type="text"
                  id="province"
                  value="Mendoza"
                  disabled
                  className="mt-1 p-2 block w-full rounded-md border-gray-300 bg-gray-100 cursor-not-allowed shadow-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="street"
                  className="block text-sm font-medium text-gray-700"
                >
                  Calle
                </label>
                <input
                  ref={streetInputRef}
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleAddressInputChange}
                  required
                  className="mt-1 p-2 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                  placeholder="Ej: Santiago de Liniers"
                />
              </div>
              <div>
                <label
                  htmlFor="number"
                  className="block text-sm font-medium text-gray-700"
                >
                  Número
                </label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleAddressInputChange}
                  required
                  className="mt-1 p-2 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                  placeholder="Ej: 670"
                />
              </div>
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
                  onChange={handleAddressInputChange}
                  required
                  className="mt-1 p-2 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                  placeholder="Ej: Godoy Cruz"
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
                  onChange={handleAddressInputChange}
                  required
                  className="mt-1 p-2 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Ej: 5501"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="observaciones"
                className="block text-sm font-medium text-gray-700"
              >
                Observaciones (opcional)
              </label>
              <textarea
                id="observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleAddressInputChange}
                rows={3}
                className="mt-1 p-2 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                placeholder="Ej: Casa con portón azul, timbre 2B"
              />
            </div>
            {ENABLE_SHIPPING_MAP_PREVIEW &&
              deliveryMethod === "shipping" &&
              isShippingFormComplete &&
              !pendingResolvedAddress &&
              !confirmedAddress && (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  {renderMap("Vista previa de ubicacion en Google Maps", "h-56")}
                  {GOOGLE_MAPS_API_KEY && (
                    <p className="border-t border-gray-200 px-3 py-2 text-xs text-gray-600">
                      Arrastra el pin para ajustar la ubicacion exacta.
                    </p>
                  )}
                  <div className="flex flex-col gap-2 border-t border-gray-200 p-3 sm:flex-row">
                    <a
                      href={externalMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-yellow-500 bg-white px-4 py-2 text-sm font-semibold text-yellow-800 transition hover:bg-yellow-100"
                    >
                      <MapPin className="h-4 w-4" />
                      Ver mapa ampliado
                    </a>
                    <button
                      type="button"
                      onClick={editAddressFromMap}
                      className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Modificar ubicacion
                    </button>
                  </div>
                </div>
              )}
            {deliveryMethod === "shipping" && (
              <>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="shippingInfoChecked"
                checked={shippingInfoChecked}
                onChange={(e) => setShippingInfoChecked(e.target.checked)}
                className="accent-yellow-600"
              />
              <label htmlFor="shippingInfoChecked" className="text-sm">
                Leí{" "}
                <button
                  type="button"
                  className="text-yellow-700 font-semibold underline hover:text-yellow-900"
                  onClick={() => setShowShippingInfo(true)}
                >
                  información de envíos
                </button>
              </label>
            </div>
            <div className="space-y-2">
             <button
  type="button"
  onClick={fetchDistance}
  disabled={isCalculateShippingDisabled || calculatingShipping}
  aria-busy={calculatingShipping}
  className="
    group inline-flex min-h-12 w-full items-center justify-center gap-2
    rounded-lg border-2 border-yellow-500 bg-yellow-300
    px-4 py-3 text-sm font-semibold text-gray-900
    shadow-lg shadow-yellow-300/40
    transition-all duration-200
    hover:-translate-y-0.5 hover:bg-yellow-400 hover:shadow-xl hover:shadow-yellow-300/50
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2
    active:scale-[0.98]
    disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none
    disabled:hover:translate-y-0 disabled:active:scale-100
    motion-reduce:transform-none motion-reduce:transition-none
    sm:min-h-14 sm:px-5 sm:text-base
  "
>
  {calculatingShipping ? (
    <>
      <span
        className="h-4 w-4 rounded-full border-2 border-gray-700 border-t-transparent animate-spin motion-reduce:animate-none sm:h-5 sm:w-5"
        aria-hidden="true"
      />
      <span>Calculando envío...</span>
    </>
  ) : confirmedAddress ? (
    <>
      <CheckCircle
        className="h-5 w-5 flex-shrink-0 text-green-700 transition-transform duration-200 group-hover:scale-105 group-disabled:text-gray-400 motion-reduce:transition-none"
        aria-hidden="true"
      />
      <span>Recalcular envío</span>
    </>
  ) : (
    <>
      <Truck
        className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-disabled:text-gray-400 motion-reduce:transform-none motion-reduce:transition-none"
        aria-hidden="true"
      />
      <span>Calcular costo de envío</span>
    </>
  )}
</button>
              {!confirmedAddress && (
                <p
                  className={`text-xs leading-5 sm:text-sm ${
                    isCalculateShippingDisabled
                      ? "text-gray-500"
                      : "text-gray-700"
                  }`}
                >
                  {calculateShippingHelpText}
                </p>
              )}
            </div>
            {confirmedAddress && (
              <div className="mt-2 p-3 rounded bg-green-50 border border-green-200 text-green-700 text-sm">
                <strong>Ubicación confirmada:</strong>
                <div>{confirmedAddress}</div>
                {ENABLE_SHIPPING_MAP_PREVIEW && (
                <div className="mt-3 overflow-hidden rounded-lg border border-green-200 bg-white">
                  {renderMap("Ubicacion confirmada en Google Maps", "h-56")}
                  {GOOGLE_MAPS_API_KEY && (
                    <p className="border-t border-green-200 px-3 py-2 text-xs text-green-800">
                      Arrastra el pin para cambiar la ubicacion y volver a confirmar el envio.
                    </p>
                  )}
                  <div className="flex flex-col gap-2 border-t border-green-200 p-3 sm:flex-row">
                    <a
                      href={externalMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-green-600 bg-white px-4 py-2 font-semibold text-green-800 transition hover:bg-green-50"
                    >
                      <MapPin className="h-4 w-4" />
                      Ver mapa ampliado
                    </a>
                    <button
                      type="button"
                      onClick={editAddressFromMap}
                      className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Modificar ubicacion
                    </button>
                  </div>
                </div>
                )}
              </div>
            )}
            {ENABLE_SHIPPING_MAP_PREVIEW && pendingResolvedAddress && (
              <div className="mt-3 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-gray-800">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-700" />
                  <div>
                    <strong>Revisa la ubicacion detectada:</strong>
                    <div>{pendingResolvedAddress}</div>
                    {pendingDistance !== null && (
                      <div className="mt-1 text-xs text-gray-600">
                        Distancia estimada: {pendingDistance.toFixed(1)} km
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 overflow-hidden rounded-lg border border-yellow-200 bg-white">
                  {renderMap("Ubicacion detectada en Google Maps")}
                  {GOOGLE_MAPS_API_KEY && (
                    <p className="border-t border-yellow-200 px-3 py-2 text-xs text-yellow-900">
                      Arrastra el pin si la ubicacion detectada no es exacta.
                    </p>
                  )}
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={confirmPendingAddress}
                    disabled={calculatingShipping}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirmar ubicacion
                  </button>
                  <a
                    href={externalMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-yellow-500 bg-white px-4 py-2 font-semibold text-yellow-800 transition hover:bg-yellow-100"
                  >
                    <MapPin className="h-4 w-4" />
                    Ver mapa ampliado
                  </a>
                  <button
                    type="button"
                    onClick={editAddressFromMap}
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Modificar ubicacion
                  </button>
                </div>
              </div>
            )}
              </>
            )}
            {/* Modal */}
            {showShippingInfo && (
              <ShippingInfoModal
                open={showShippingInfo}
                onClose={() => setShowShippingInfo(false)}
              />
            )}

            {/* Modal de error de envío */}
            {showShippingErrorModal && shippingError && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                <div 
                  className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="shipping-error-title"
                >
                  <div className="relative px-6 pt-6 pb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowShippingErrorModal(false);
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
                          id="shipping-error-title"
                          className="text-xl font-semibold text-gray-900 mb-1"
                        >
                          Error al calcular envío
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {shippingError.message}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-700">
                        {shippingError.retryable 
                          ? "💡 Puedes intentar calcular nuevamente." 
                          : "⏰ Por favor, intenta más tarde o contacta con soporte."}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowShippingErrorModal(false);
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
      </div>
    </div>
  );
};
