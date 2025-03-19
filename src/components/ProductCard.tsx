import { useState, useRef, useEffect } from "react";
import { Product } from "../types";
import { ChevronDown } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

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
        setCurrentPrice(weightData.price);
        setCurrentPromotionalPrice(weightData.promotionalPrice);
      }
    } else {
      setCurrentPrice(product.price);
      setCurrentPromotionalPrice(product.promotionalPrice);
    }
  }, [selectedWeight, product]);
  useEffect(() => {
    if (selectedWeight !== null && product.weights) {
      const weightData = product.weights.find(
        (w) => w.weight === selectedWeight
      );
      if (weightData) {
        let price = weightData.price;
        if (product.discountQuantity && product.discountQuantity[quantity]) {
          price = price - price * product.discountQuantity[quantity];
          setCurrentPrice(weightData.price);
          setCurrentPromotionalPrice(price);
        } else {
          setCurrentPrice(weightData.price);
          setCurrentPromotionalPrice(weightData.promotionalPrice);
        }
      }
    } else {
      if (product.price) {
        let price = product.price;
        if (product.discountQuantity && product.discountQuantity[quantity]) {
          price = price - price * product.discountQuantity[quantity];
        }
        setCurrentPrice(price);
        setCurrentPromotionalPrice(product.promotionalPrice);
      }
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
      <Link to={`/product/${product.id}`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-32 sm:h-48 object-cover"
        />
      </Link>
      <div className="p-1 sm:p-4 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.colors && (
          <div className="mb-3">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-white flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {selectedColor && (
                    <span
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{
                        backgroundColor: product.colors.find(
                          (c) => c.name === selectedColor
                        )?.hex,
                      }}
                    />
                  )}
                  {selectedColor || "Seleccionar color"}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isColorMenuOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto left-0 right-0">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColor(color.name);
                        setIsColorMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}{" "}
                      <span className="text-xs text-gray-500">
                        (stock{" "}
                        {getStock(
                          color.name,
                          selectedWeight || product.weights?.[0]?.weight || 0
                        )}
                        )
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {product.weights && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2 mt-1">
              {product.weights.map((weight) => (
                <button
                  key={weight.weight}
                  onClick={() => setSelectedWeight(weight.weight)}
                  className={`px-2 py-1.5 text-sm border rounded-md ${
                    selectedWeight === weight.weight
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  } sm:px-3 sm:py-2 sm:text-base`}
                >
                  {weight.weight}kg
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
            {currentPromotionalPrice ? (
              <>
                <div className="mb-0 sm:mb-3">
                  <span className="text-lg sm:text-2xl font-bold">
                    $
                    {currentPromotionalPrice.toLocaleString("es-ES", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className="mb-1 sm:mb-3">
                  {/* Precio tachado */}
                  <span className="text-lg sm:text-2xl text-gray-400 font-bold line-through">
                    $
                    {currentPrice?.toLocaleString("es-ES", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              </>
            ) : (
              <div className="mb-3">
                <span className="text-lg sm:text-2xl font-bold">
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
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart || quantity + cartQuantity > availableStock}
            className={`px-4 py-2 rounded-md text-black
                ${
                  canAddToCart && quantity + cartQuantity <= availableStock
                    ? "bg-yellow-400 hover:bg-yellow-700"
                    : "bg-gray-400 cursor-not-allowed"
                } transition-colors`}
          >
            {canAddToCart && quantity + cartQuantity <= availableStock
              ? "Agregar"
              : "Sin stock"}
          </button>
          {/* QUANTITY */}
          {canAddToCart && product.colors && product.weights && (
            <div className="flex items-center gap-1 sm:gap-2 pt-2">
              {[1, 5, 10, 50].map((qty) => (
                <button
                  key={qty}
                  className={`px-2 py-1.5 text-xs sm:text-sm border rounded-md ${
                    quantity === qty
                      ? "bg-black text-white"
                      : qty + cartQuantity > availableStock
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-white text-black"
                  }`}
                  onClick={() => setQuantity(qty)}
                  disabled={qty + cartQuantity > availableStock}
                >
                  {qty}
                </button>
              ))}
            </div>
          )}
          {/* QUANTITY */}
        </div>
      </div>
    </div>
  );
}
