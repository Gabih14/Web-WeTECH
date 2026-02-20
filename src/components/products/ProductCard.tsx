import { useState, useRef, useEffect, useCallback } from "react";
import { Product } from "../../types";
import { ChevronDown, ShoppingCart, Check, Zap } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { Link, useLocation } from "react-router-dom";
import {
  shouldApplyDiscount,
  calculateDiscountedPriceForProduct,
  getDiscountPercentageForProduct,
  getNextDiscountLevelForProduct,
} from "../../utils/discounts";
import {
  canPurchaseWithStock,
  FILAMENT_MIN_STOCK_TO_PURCHASE,
} from "../../utils/stockRules";

interface ProductCardProps {
  product: Product;
}

const QUANTITY_OPTIONS = [1, 5, 10, 50];

function formatPrice(price: number) {
  return price.toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, items } = useCart();
  const location = useLocation();

  const isFilament = product.category === "FILAMENTO 3D";

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getFirstColorWithStock = useCallback(() => {
    if (!product.colors || !product.weights) return product.colors?.[0]?.name ?? null;
    const defaultWeight = product.weights[0]?.weight ?? 0;
    return (
      product.colors.find((c) => (c.stock[defaultWeight.toString()] ?? 0) > 0)?.name ??
      product.colors[0]?.name ??
      null
    );
  }, [product.colors, product.weights]);

  const getStock = useCallback(
    (color: string, weight: number) =>
      product.colors?.find((c) => c.name === color)?.stock[weight.toString()] ?? 0,
    [product.colors]
  );

  const getCartQuantity = useCallback(
    (productId: string, color: string, weight: number) =>
      items.find(
        (item) =>
          item.product.id === productId && item.color === color && item.weight === weight
      )?.quantity ?? 0,
    [items]
  );

  // ── State ─────────────────────────────────────────────────────────────────
  const [selectedColor, setSelectedColor] = useState<string | null>(getFirstColorWithStock);
  const [selectedWeight, setSelectedWeight] = useState<number | null>(
    product.weights?.[0]?.weight ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | undefined>(product.price);
  const [currentPromotionalPrice, setCurrentPromotionalPrice] = useState<number | undefined>(
    isFilament ? product.promotionalPrice : undefined
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Derived values ────────────────────────────────────────────────────────
  const availableStock =
    selectedColor && selectedWeight !== null
      ? getStock(selectedColor, selectedWeight)
      : product.stock ?? 0;

  const cartQuantity =
    selectedColor && selectedWeight !== null
      ? getCartQuantity(product.id, selectedColor, selectedWeight)
      : getCartQuantity(product.id, "", 0);

  const canAdd =
    selectedColor && selectedWeight !== null
      ? canPurchaseWithStock(product, availableStock)
      : canPurchaseWithStock(product, product.stock ?? 0);

  const isOverStock = quantity + cartQuantity > availableStock;

  const stockStatus =
    availableStock === 0
      ? { label: "Sin stock", color: "text-red-500" }
      : isFilament && availableStock < FILAMENT_MIN_STOCK_TO_PURCHASE
      ? {
          label: `Mínimo ${FILAMENT_MIN_STOCK_TO_PURCHASE} unidades`,
          color: "text-red-500",
        }
      : availableStock <= 5
      ? { label: `Últimas ${availableStock}`, color: "text-amber-500" }
      : { label: "En stock", color: "text-emerald-600" };

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setIsColorMenuOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (shouldApplyDiscount(product)) {
      const base =
        selectedWeight !== null && product.weights
          ? product.weights.find((w) => w.weight === selectedWeight)?.price ?? product.price ?? 0
          : product.price ?? 0;

      setCurrentPrice(base);
      setCurrentPromotionalPrice(
        calculateDiscountedPriceForProduct(product, base, quantity, selectedWeight ?? 0)
      );
    } else {
      const weightPrice =
        selectedWeight !== null && product.weights
          ? product.weights.find((w) => w.weight === selectedWeight)?.price
          : undefined;
      setCurrentPrice(weightPrice ?? product.price);
      setCurrentPromotionalPrice(undefined);
    }
  }, [selectedWeight, quantity, product]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (selectedColor && selectedWeight !== null && canAdd && !isOverStock) {
      addToCart(product, selectedColor, selectedWeight, quantity);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    } else if (!product.colors && !product.weights && canAdd && !isOverStock) {
      addToCart(product, "", 0, quantity);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  const sortedColors = product.colors
    ? [...product.colors].sort((a, b) => {
        const wa = getStock(a.name, selectedWeight ?? product.weights?.[0]?.weight ?? 0);
        const wb = getStock(b.name, selectedWeight ?? product.weights?.[0]?.weight ?? 0);
        if (wa > 0 && wb === 0) return -1;
        if (wa === 0 && wb > 0) return 1;
        return a.name.localeCompare(b.name);
      })
    : [];

  const applyDiscount = shouldApplyDiscount(product) && !!currentPromotionalPrice;
  const nextLevel = applyDiscount
    ? getNextDiscountLevelForProduct(product, quantity, selectedWeight ?? undefined)
    : null;
  const from = `${location.pathname}${location.search}`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <article className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-visible">
      {/* Discount badge */}
      {applyDiscount && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-black text-white text-[10px] font-semibold px-2 py-1 rounded-full tracking-wide">
          <Zap className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
          -{getDiscountPercentageForProduct(product, quantity, selectedWeight ?? undefined)}
        </div>
      )}

      {/* Image */}
      <Link
        to={`/product/${product.id}`}
        state={{ from }}
        className="block aspect-square overflow-hidden rounded-t-2xl bg-gray-50"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
        />
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-grow p-3 sm:p-4 gap-3">

        {/* Name + stock — min-h para alinear cards vecinos */}
        <div className="min-h-[3.5rem]">
          <Link to={`/product/${product.id}`} state={{ from }}>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-yellow-500 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className={`mt-0.5 text-[11px] font-medium ${stockStatus.color}`}>
            {stockStatus.label}
          </p>
        </div>

        {/* Color selector */}
        {product.colors && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsColorMenuOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white hover:border-gray-400 transition-colors"
            >
              <span className="flex items-center gap-2 truncate">
                {selectedColor && !!product.colors.find((c) => c.name === selectedColor)?.hex?.trim() && (
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-gray-200 flex-shrink-0 shadow-sm"
                    style={{
                      backgroundColor: product.colors.find((c) => c.name === selectedColor)!.hex,
                    }}
                  />
                )}
                <span className="truncate text-gray-700">{selectedColor ?? "Seleccionar color"}</span>
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                  isColorMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isColorMenuOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl max-h-44 overflow-y-auto">
                {sortedColors.map((color) => {
                  const stock = getStock(
                    color.name,
                    selectedWeight ?? product.weights?.[0]?.weight ?? 0
                  );
                  const isColorDisabled = isFilament
                    ? stock < FILAMENT_MIN_STOCK_TO_PURCHASE
                    : stock === 0;
                  return (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColor(color.name);
                        setIsColorMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                        isColorDisabled ? "opacity-40" : ""
                      } ${selectedColor === color.name ? "bg-gray-50 font-medium" : ""}`}
                    >
                      {!!color.hex?.trim() && (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-gray-200 flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: color.hex }}
                        />
                      )}
                      <span className="truncate text-gray-700">{color.name}</span>
                      <span className="ml-auto text-gray-400 tabular-nums">({stock})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Weight selector */}
        {product.weights && (
          <div className="flex flex-wrap gap-1.5">
            {product.weights.map((w) => (
              <button
                key={w.weight}
                onClick={() => setSelectedWeight(w.weight)}
                className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all duration-150 ${
                  selectedWeight === w.weight
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {w.weight}kg
              </button>
            ))}
          </div>
        )}

        {/* Price — altura fija para alinear con/sin descuento */}
        <div className="min-h-[3rem]">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-base font-bold text-gray-900 whitespace-nowrap">
              ${formatPrice(applyDiscount ? currentPromotionalPrice! : currentPrice!)}
            </span>
            {applyDiscount && (
              <span className="text-xs text-gray-400 line-through whitespace-nowrap">
                ${formatPrice(currentPrice!)}
              </span>
            )}
          </div>
          {/* Siempre ocupa la misma altura, con o sin mensaje */}
          <p className="text-[11px] text-gray-500 leading-tight min-h-[1rem] mt-0.5">
            {applyDiscount && nextLevel
              ? `Comprá ${nextLevel.quantity - quantity} más → ${nextLevel.discount} off`
              : ""}
          </p>
        </div>

        {/* Quantity + Add to cart */}
        <div className="space-y-2">
          {canAdd && product.colors && product.weights && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-gray-400">Cantidad</span>
              <div className="grid grid-cols-4 gap-1">
                {QUANTITY_OPTIONS.map((qty) => {
                  const disabled = qty + cartQuantity > availableStock;
                  return (
                    <button
                      key={qty}
                      onClick={() => !disabled && setQuantity(qty)}
                      disabled={disabled}
                      className={`w-full py-1.5 text-xs rounded-lg border font-medium transition-all duration-150 ${
                        quantity === qty
                          ? "bg-gray-900 text-white border-gray-900"
                          : disabled
                          ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {qty}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!canAdd || isOverStock}
            className={`w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
              justAdded
                ? "bg-emerald-500 text-white"
                : canAdd && !isOverStock
                ? "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                ¡Agregado!
              </>
            ) : canAdd && !isOverStock ? (
              <>
                <ShoppingCart className="w-4 h-4" />
                Agregar
              </>
            ) : (
              isFilament && availableStock > 0 && availableStock < FILAMENT_MIN_STOCK_TO_PURCHASE
                ? `Mínimo ${FILAMENT_MIN_STOCK_TO_PURCHASE}`
                : "Sin stock"
            )}
          </button>
        </div>
      </div>
    </article>
  );
}