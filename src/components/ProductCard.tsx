import { useState, useRef, useEffect } from "react";
import { Product } from "../types";
import { ChevronDown } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import {
  calculateDiscountedPrice,
  getDiscountPercentage,
  getNextDiscountLevel
} from "../utils/discounts";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, items } = useCart();

  const [currentPrice, setCurrentPrice] = useState<number | undefined>(
    product.price
  );
  const [currentPromotionalPrice, setCurrentPromotionalPrice] = useState<
    number | undefined
  >(product.promotionalPrice);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors?.[0]?.name || null
  );
  const [selectedWeight, setSelectedWeight] = useState<number | null>(
    product.weights?.[0]?.weight || null
  );
  const [quantity, setQuantity] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsColorMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedWeight !== null && product.weights) {
      const weightData = product.weights.find(
        (w) => w.weight === selectedWeight
      );
      if (weightData) {
        const originalPrice = weightData.price;
        const discountedPrice = calculateDiscountedPrice(originalPrice, quantity);
        setCurrentPrice(originalPrice);
        setCurrentPromotionalPrice(discountedPrice);
      }
    } else if (product.price) {
      const originalPrice = product.price;
      const discountedPrice = calculateDiscountedPrice(originalPrice, quantity);
      setCurrentPrice(originalPrice);
      setCurrentPromotionalPrice(discountedPrice);
    }
  }, [selectedWeight, quantity, product]);

  const handleAddToCart = () => {
    if (
      selectedColor &&
      selectedWeight !== null &&
      quantity + cartQuantity <= availableStock
    ) {
      addToCart(product, selectedColor, selectedWeight, quantity);
    } else if (
      !product.colors &&
      !product.weights &&
      quantity + cartQuantity <= (product.stock ?? 0)
    ) {
      addToCart(product, "", 0, quantity);
    }
  };

  const getStock = (color: string, weight: number) => {
    const colorData = product.colors?.find((c) => c.name === color);
    return colorData ? colorData.stock[weight.toString()] || 0 : 0;
  };

  const getCartQuantity = (
    productId: string,
    color: string,
    weight: number
  ) => {
    const cartItem = items.find(
      (item) =>
        item.product.id === productId &&
        item.color === color &&
        item.weight === weight
    );
    return cartItem ? cartItem.quantity : 0;
  };

  const canAddToCart =
    selectedColor && selectedWeight !== null
      ? getStock(selectedColor, selectedWeight) > 0
      : (product.stock ?? 0) > 0;
  const availableStock =
    selectedColor && selectedWeight !== null
      ? getStock(selectedColor, selectedWeight)
      : product.stock || 0;
  const cartQuantity =
    selectedColor && selectedWeight !== null
      ? getCartQuantity(product.id, selectedColor, selectedWeight)
      : getCartQuantity(product.id, "", 0);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-visible hover:shadow-lg transition-shadow flex flex-col">
      <Link to={`/product/${product.id}`} className="aspect-square overflow-hidden rounded-t-lg">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <div className="p-1.5 sm:p-3 flex flex-col flex-grow space-y-1.5 sm:space-y-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-xs sm:text-sm lg:text-base font-semibold line-clamp-2 hover:text-yellow-600 transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        {product.colors && (
          <div className="mb-2">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
                className="w-full px-2 py-1.5 text-xs sm:text-sm border rounded-md bg-white flex items-center justify-between hover:border-gray-400 transition-colors"
              >
                <span className="flex items-center gap-1.5 truncate">
                  {selectedColor && (
                    <span
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-300 flex-shrink-0"
                      style={{
                        backgroundColor: product.colors.find(
                          (c) => c.name === selectedColor
                        )?.hex,
                      }}
                    />
                  )}
                  <span className="truncate">{selectedColor || "Color"}</span>
                </span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              </button>

              {isColorMenuOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto left-0 right-0">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColor(color.name);
                        setIsColorMenuOpen(false);
                      }}
                      className="w-full px-2 py-1.5 text-xs sm:text-sm text-left hover:bg-gray-50 flex items-center gap-1.5"
                    >
                      <span
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="truncate">{color.name}</span>
                      <span className="text-xs text-gray-500 ml-auto flex-shrink-0">
                        ({getStock(
                          color.name,
                          selectedWeight || product.weights?.[0]?.weight || 0
                        )})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {product.weights && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-1">
              {product.weights.map((weight) => (
                <button
                  key={weight.weight}
                  onClick={() => setSelectedWeight(weight.weight)}
                  className={`px-2 py-1 text-xs border rounded ${
                    selectedWeight === weight.weight
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-gray-300 hover:border-gray-400"
                  } transition-colors`}
                >
                  {weight.weight}kg
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex flex-col gap-1 mb-1.5 sm:mb-3">
            {currentPromotionalPrice ? (
              <>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-base sm:text-lg lg:text-xl font-bold ">
                    $
                    {currentPromotionalPrice.toLocaleString("es-ES", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                  <span className="text-xs sm:text-sm lg:text-base text-gray-400 font-medium line-through">
                    $
                    {currentPrice?.toLocaleString("es-ES", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                  <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                    -{getDiscountPercentage(quantity)}
                  </span>
                </div>
                {/* Mostrar información del siguiente nivel de descuento */}
                {(() => {
                  const nextLevel = getNextDiscountLevel(quantity);
                  return nextLevel ? (
                    <div className="text-xs text-gray-600">
                      Compra {nextLevel.quantity - quantity} más para obtener {nextLevel.discount} de descuento
                    </div>
                  ) : null;
                })()}
              </>
            ) : (
              <div>
                <span className="text-base sm:text-lg lg:text-xl font-bold">
                  $
                  {currentPrice?.toLocaleString("es-ES", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          {/* Botón principal */}
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart || quantity + cartQuantity > availableStock}
            className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors
                ${
                  canAddToCart && quantity + cartQuantity <= availableStock
                    ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
          >
            {canAddToCart && quantity + cartQuantity <= availableStock
              ? "Agregar"
              : "Sin stock"}
          </button>
          
          {/* Selector de cantidad - Solo para productos con colores y pesos */}
          {canAddToCart && product.colors && product.weights && (
            <div className="flex justify-center">
              <div className="flex items-center gap-0.5 sm:gap-1">
                <span className="text-xs text-gray-600 mr-1 hidden sm:inline">Cant:</span>
                {[1, 5, 10, 50].map((qty) => (
                  <button
                    key={qty}
                    className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs border rounded ${
                      quantity === qty
                        ? "bg-black text-white border-black"
                        : qty + cartQuantity > availableStock
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200"
                        : "bg-white text-black border-gray-300 hover:border-gray-400"
                    } transition-colors`}
                    onClick={() => setQuantity(qty)}
                    disabled={qty + cartQuantity > availableStock}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
