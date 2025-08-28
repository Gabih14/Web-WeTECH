import { X, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Product } from "../types";
import { useNavigate } from "react-router-dom";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, updateQuantity, removeFromCart, total } = useCart();

  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    navigate("/under-development");
  };

  const getStock = (
    product: Product,
    color: string,
    weight: number
  ): number => {
    if (product.colors && product.weights) {
      const colorData = product.colors.find((c) => c.name === color);
      return colorData ? colorData.stock[weight.toString()] || 0 : 0;
    }
    return product.stock ?? 0;
  };

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

  const calculateOriginalTotal = () => {
    return items.reduce((sum, item) => {
      const price = getPrice(item.product, item.weight);
      const itemTotal = price ? price * item.quantity : 0;
      return sum + itemTotal;
    }, 0);
  };

  const originalTotal = calculateOriginalTotal();
  const discount = originalTotal - total;

  const handleOutsideClick = () => {
    onClose();
  };

  return (
    <div
      id="cart-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleOutsideClick}
    >
      <div className="fixed inset-0 bg-black bg-opacity-50" />
      <div className="relative min-h-screen md:flex md:items-center md:justify-center">
        <div
          className="relative bg-white w-full max-w-md mx-auto rounded-lg shadow-lg p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ShoppingCart className="h-6 w-6 text-black" />
              <h2 className="ml-2 text-xl font-bold text-gray-900">Carrito</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              El carrito está vacío
            </p>
          ) : (
            <>
              <div className="space-y-4 mb-4 max-h-[60vh] overflow-y-auto">
                {items.map((item) => {
                  const availableStock = getStock(
                    item.product,
                    item.color,
                    item.weight
                  );
                  const price = getPrice(item.product, item.weight);
                  const discountedPrice = calculateDiscountedPrice(
                    item.product,
                    item.weight,
                    item.quantity
                  );
                  return (
                    <div
                      key={`${item.product.id}-${item.color}-${item.weight}`}
                      className="flex flex-col p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {item.product.name}
                          </h3>
                          <p className="text-black mt-1">
                            {discountedPrice ? (
                              <>
                                <span className="text-base sm:text-lg font-bold mr-2">
                                  $
                                  {discountedPrice.toLocaleString("es-ES", {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  })}
                                </span>
                                <span className="text-base sm:text-lg text-gray-300 font-bold line-through">
                                  $
                                  {price?.toLocaleString("es-ES", {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  })}
                                </span>
                              </>
                            ) : (
                              <span className="text-base sm:text-lg font-bold">
                                $
                                {price?.toLocaleString("es-ES", {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                })}
                              </span>
                            )}
                          </p>
                          {item.color && item.weight > 0 && (
                            <p className="text-gray-600 mt-1">
                              Color: {item.color}, Peso: {item.weight}kg
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity - 1,
                                item.color,
                                item.weight
                              )
                            }
                            className={`p-1 hover:bg-gray-200 rounded-full ${
                              item.quantity <= 1 ? "text-gray-300" : ""
                            }`}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity + 1,
                                item.color,
                                item.weight
                              )
                            }
                            className={`p-1 hover:bg-gray-200 rounded-full ${
                              item.quantity >= availableStock
                                ? "text-gray-300"
                                : ""
                            }`}
                            disabled={item.quantity >= availableStock}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            removeFromCart(
                              item.product.id,
                              item.color,
                              item.weight
                            )
                          }
                          className="p-1 hover:bg-red-100 rounded-full text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium">Subtotal:</span>
                  <span className="text-lg font-bold text-gray-700">
                    $
                    {originalTotal.toLocaleString("es-ES", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
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
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Total:</span>
                  <span className="text-xl font-bold text-black">
                    $
                    {total.toLocaleString("es-ES", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <button
                  className="w-full py-2 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-700 transition-colors"
                  onClick={handleCheckout}
                >
                  Finalizar Compra
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
