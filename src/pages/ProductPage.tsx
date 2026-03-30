import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Check, ChevronDown, ShoppingCart, Sparkles } from "lucide-react";
import Isologo from "../assets/Isologo Fondo Negro SVG.svg";
import { useCart } from "../context/CartContext";
import { fetchProducts } from "../services/fetchProducts";
import { Product } from "../types";
import {
  calculateDiscountedPriceForProduct,
  calculateSavingsForProduct,
  getDiscountPercentageForProduct,
  getNextDiscountLevelForProduct,
  shouldApplyDiscount,
} from "../utils/discounts";
import { useAddToCartFeedback } from "../hooks/useAddToCartFeedback";
import {
  getFirstColorWithStock,
  getPurchaseState,
  getVariantStock,
} from "../utils/cartPurchase";
import {
  FILAMENT_MIN_STOCK_TO_PURCHASE,
  isFilamentProduct,
} from "../utils/stockRules";

const QUANTITY_OPTIONS = [1, 5, 10, 50];

function formatPrice(price: number) {
  return price.toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const { justAdded, triggerAddedFeedback } = useAddToCartFeedback();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | undefined>(undefined);
  const [currentPromotionalPrice, setCurrentPromotionalPrice] = useState<
    number | undefined
  >(undefined);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts()
      .then((data) => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsColorMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const product = products.find((item) => item.id === id);
  const isFilament = !!product && isFilamentProduct(product);

  useEffect(() => {
    if (!product) {
      return;
    }

    setCurrentPrice(product.price);
    setCurrentPromotionalPrice(isFilament ? product.promotionalPrice : undefined);
    setSelectedColor(getFirstColorWithStock(product));
    setSelectedWeight(product.weights?.[0]?.weight ?? null);
    setQuantity(1);

    if (isFilament) {
      setCurrentImages([product.image]);
    } else {
      setCurrentImages(product.images || [product.image]);
    }

    setCurrentImageIndex(0);
  }, [product, isFilament]);

  useEffect(() => {
    if (!product || !selectedColor) {
      return;
    }

    const colorData = product.colors?.find((color) => color.name === selectedColor);
    if (colorData?.images?.length) {
      setCurrentImages(isFilament ? [colorData.images[0]] : colorData.images);
    } else {
      setCurrentImages(product.images || [product.image]);
    }

    setCurrentImageIndex(0);
  }, [product, selectedColor, isFilament]);

  useEffect(() => {
    if (!product) {
      return;
    }

    if (shouldApplyDiscount(product)) {
      const originalPrice =
        selectedWeight !== null && product.weights
          ? product.weights.find((weight) => weight.weight === selectedWeight)?.price ??
            product.price ??
            0
          : product.price ?? 0;

      setCurrentPrice(originalPrice);
      setCurrentPromotionalPrice(
        calculateDiscountedPriceForProduct(
          product,
          originalPrice,
          quantity,
          selectedWeight ?? 0
        )
      );
      return;
    }

    if (selectedWeight !== null && product.weights) {
      const weightData = product.weights.find((weight) => weight.weight === selectedWeight);
      setCurrentPrice(weightData?.price ?? product.price);
    } else {
      setCurrentPrice(product.price);
    }

    setCurrentPromotionalPrice(undefined);
  }, [product, quantity, selectedWeight]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-yellow-600" />
        <p className="text-sm text-gray-500">Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Link to="/" className="mb-4 flex items-center">
          <img src={Isologo} alt="Logo WeTECH" className="mx-auto h-16 md:h-48" />
        </Link>
        <h1 className="mb-4 text-center text-3xl font-bold text-gray-900 sm:text-4xl">
          PRODUCTO NO ENCONTRADO
        </h1>
        <Link to="/">
          <button className="mt-4 rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700">
            Volver al inicio
          </button>
        </Link>
      </div>
    );
  }

  const { availableStock, cartQuantity, canAddToCart, isOverStock } = getPurchaseState({
    product,
    items,
    selectedColor,
    selectedWeight,
    quantity,
  });

  const hasVariants = !!product.colors && !!product.weights;
  const variantSelectionIncomplete = hasVariants && (!selectedColor || selectedWeight === null);
  const isAddDisabled = variantSelectionIncomplete || !canAddToCart || isOverStock;
  const applyDiscount = shouldApplyDiscount(product) && !!currentPromotionalPrice;

  const sortedColors = product.colors
    ? [...product.colors].sort((a, b) => {
        const stockA = getVariantStock(
          product,
          a.name,
          selectedWeight ?? product.weights?.[0]?.weight ?? 0
        );
        const stockB = getVariantStock(
          product,
          b.name,
          selectedWeight ?? product.weights?.[0]?.weight ?? 0
        );

        if (stockA > 0 && stockB === 0) return -1;
        if (stockA === 0 && stockB > 0) return 1;
        return a.name.localeCompare(b.name);
      })
    : [];

  const nextLevel = getNextDiscountLevelForProduct(
    product,
    quantity,
    selectedWeight ?? undefined
  );

  const stockStatus =
    availableStock === 0
      ? { text: "Sin stock", tone: "text-red-600 bg-red-50 border-red-200" }
      : isFilament && availableStock < FILAMENT_MIN_STOCK_TO_PURCHASE
      ? {
          text: `Mínimo ${FILAMENT_MIN_STOCK_TO_PURCHASE} unidades para comprar`,
          tone: "text-red-600 bg-red-50 border-red-200",
        }
      : availableStock <= 5
      ? {
          text: `Últimas ${availableStock} unidades`,
          tone: "text-amber-700 bg-amber-50 border-amber-200",
        }
      : { text: "Disponible", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" };

  const handleAddToCart = () => {
    if (variantSelectionIncomplete || !canAddToCart || isOverStock) {
      return;
    }

    if (hasVariants && selectedColor && selectedWeight !== null) {
      addToCart(product, selectedColor, selectedWeight, quantity);
      triggerAddedFeedback();
      return;
    }

    addToCart(product, "", 0, quantity);
    triggerAddedFeedback();
  };

  const handleBackToStore = () => {
    const from = (location.state as { from?: string } | null)?.from;

    if (from) {
      navigate(from);
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/products");
  };

  return (
    <section className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-b from-white via-amber-50/40 to-white py-6 lg:py-12">
      <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-yellow-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-16 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={handleBackToStore}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-100"
          >
            <span aria-hidden>←</span>
            Volver a la tienda
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] xl:gap-12">
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-yellow-100/30">
              <img
                src={currentImages[currentImageIndex] || product.image}
                alt={`${product.name} - imagen ${currentImageIndex + 1}`}
                className="h-full max-h-[640px] w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = product.image;
                }}
              />
            </div>

            {currentImages.length > 1 && !isFilament && (
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                {currentImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                      currentImageIndex === index
                        ? "border-yellow-500 shadow-md shadow-yellow-200"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    aria-label={`Ver imagen ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} miniatura ${index + 1}`}
                      className="h-16 w-full object-cover sm:h-20"
                      onError={(event) => {
                        event.currentTarget.src = product.image;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xl shadow-yellow-100/20 sm:p-7">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${stockStatus.tone}`}>
                  {stockStatus.text}
                </span>
                {justAdded && (
                  <span className="animate-fadeIn rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Agregado al carrito
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl">
                {product.name}
              </h1>

              <div className="mt-5 space-y-2 rounded-2xl bg-gray-50 p-4">
                {applyDiscount ? (
                  <>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-3xl font-black tracking-tight text-gray-900">
                        ${formatPrice(currentPromotionalPrice || 0)}
                      </span>
                      <span className="text-sm font-bold text-gray-400 line-through sm:text-base">
                        ${formatPrice(currentPrice || 0)}
                      </span>
                      <span className="rounded-full bg-black px-2.5 py-1 text-xs font-semibold text-white">
                        -
                        {getDiscountPercentageForProduct(
                          product,
                          quantity,
                          selectedWeight ?? undefined
                        )}
                        %
                      </span>
                    </div>

                    <p className="text-sm font-medium text-emerald-700">
                      Ahorras
                      {" "}
                      ${formatPrice(
                        calculateSavingsForProduct(
                          product,
                          currentPrice || 0,
                          quantity,
                          selectedWeight ?? undefined
                        )
                      )}
                    </p>

                    {nextLevel && (
                      <p className="flex items-center gap-1 text-sm font-medium text-amber-700">
                        <Sparkles className="h-4 w-4" />
                        Comprá {nextLevel.quantity - quantity} más para obtener {nextLevel.discount} OFF
                      </p>
                    )}
                  </>
                ) : (
                  <span className="text-3xl font-black tracking-tight text-gray-900">
                    ${formatPrice(currentPrice || 0)}
                  </span>
                )}
              </div>

              <p className="mt-5 text-sm leading-6 text-gray-600">{product.description}</p>

              {product.weights && (
                <div className="mt-6 space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Peso
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {product.weights.map((weight) => (
                      <button
                        key={weight.weight}
                        onClick={() => setSelectedWeight(weight.weight)}
                        className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${
                          selectedWeight === weight.weight
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {weight.weight}kg
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && (
                <div className="mt-6" ref={dropdownRef}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Color
                  </h3>

                  <button
                    onClick={() => setIsColorMenuOpen((value) => !value)}
                    className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm hover:border-gray-400"
                  >
                    <span className="flex items-center gap-2 text-gray-700">
                      {selectedColor && !!product.colors.find((c) => c.name === selectedColor)?.hex?.trim() && (
                        <span
                          className="h-4 w-4 rounded-full border border-gray-300"
                          style={{
                            backgroundColor: product.colors.find(
                              (color) => color.name === selectedColor
                            )?.hex,
                          }}
                        />
                      )}
                      {selectedColor || "Seleccionar color"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform ${
                        isColorMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isColorMenuOpen && (
                    <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1 shadow-lg">
                      {sortedColors.map((color) => {
                        const stock = getVariantStock(
                          product,
                          color.name,
                          selectedWeight ?? product.weights?.[0]?.weight ?? 0
                        );

                        const disabledByStock = isFilament
                          ? stock < FILAMENT_MIN_STOCK_TO_PURCHASE
                          : stock === 0;

                        return (
                          <button
                            key={color.name}
                            onClick={() => {
                              setSelectedColor(color.name);
                              setIsColorMenuOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                              disabledByStock ? "opacity-45" : ""
                            } ${selectedColor === color.name ? "bg-gray-50" : ""}`}
                          >
                            {!!color.hex?.trim() && (
                              <span
                                className="h-4 w-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color.hex }}
                              />
                            )}
                            <span className="text-gray-700">{color.name}</span>
                            <span className="ml-auto text-xs text-gray-500">({stock})</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {canAddToCart && hasVariants && (
                <div className="mt-6 space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Cantidad
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {QUANTITY_OPTIONS.map((qty) => {
                      const disabled = qty + cartQuantity > availableStock;
                      return (
                        <button
                          key={qty}
                          onClick={() => !disabled && setQuantity(qty)}
                          disabled={disabled}
                          className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${
                            quantity === qty
                              ? "border-gray-900 bg-gray-900 text-white"
                              : disabled
                              ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          {qty}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                  En carrito: <span className="font-semibold text-gray-700">{cartQuantity}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Stock: <span className="font-semibold text-gray-700">{availableStock}</span>
                </p>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAddDisabled}
                className={`mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] ${
                  justAdded
                    ? "bg-emerald-500"
                    : !isAddDisabled
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "cursor-not-allowed bg-gray-300"
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="h-5 w-5" />
                    ¡Agregado!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    {isAddDisabled
                      ? isFilament &&
                        availableStock > 0 &&
                        availableStock < FILAMENT_MIN_STOCK_TO_PURCHASE
                        ? `Mínimo ${FILAMENT_MIN_STOCK_TO_PURCHASE}`
                        : "Sin stock"
                      : "Agregar al carrito"}
                  </>
                )}
              </button>
            </div>
          </aside>
        </div>

        {product.observaciones && (
          <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-5 shadow-lg shadow-yellow-100/10 sm:p-7">
            <h2 className="text-lg font-bold text-gray-900">Observaciones</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
              {product.observaciones}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
