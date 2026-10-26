import { X, Minus, Plus, ShoppingCart, Sparkles, Trash2 } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { Product } from "../../types";
import { useNavigate } from "react-router-dom";
import { calculateCartPricing } from "../../utils/cartPricing";
import { getVariantImage, getVariantPrice, getVariantItemId } from "../../utils/pricing";
import { formatPrice } from "../../utils/money";
import { calculateCheckoutLinePricing } from "../../utils/checkoutPricing";
import { formatKg, getWholesaleCartState } from "../../utils/wholesalePricing";
import { getMateComboComponent, getMateComboQuantities } from "../../utils/complementDiscounts";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const wholesale = getWholesaleCartState(items);

  const navigate = useNavigate();

  if (!isOpen) return null;

  const pricedGroups = calculateCartPricing(items);

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
    //navigate("/under-development");
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

  const getPrice = (
    product: Product,
    color: string,
    weight: number
  ): number | undefined => {
    return getVariantPrice(product, color, weight, wholesale.reached);
  };

  const calculateOriginalTotal = () => {
    return items.reduce((sum, item) => {
      const price = getPrice(item.product, item.color, item.weight);
      const itemTotal = price
        ? calculateCheckoutLinePricing(
            price,
            item.quantity,
            0
          ).subtotalBruto
        : 0;
      return sum + itemTotal;
    }, 0);
  };

  const originalTotal = calculateOriginalTotal();
  const discount = originalTotal - total;
  const mateCombo = getMateComboQuantities(items.map((item) => ({
    id: getVariantItemId(item.product, item.color, item.weight),
    grupo: item.product.category,
    idPadre: item.product.parentItemId,
    quantity: item.quantity,
  })));
  const appliedMateCombo = getMateComboQuantities(pricedGroups.flatMap((group) => {
    const component = getMateComboComponent({
      id: getVariantItemId(group.item.product, group.item.color, group.item.weight),
      grupo: group.item.product.category,
      idPadre: group.item.product.parentItemId,
    });
    const quantity = group.lines.reduce(
      (sum, line) => sum + (line.combo ? line.cantidad : 0),
      0,
    );
    return component && quantity > 0
      ? [{
          id: component === "mate" ? "INS-MATE-BLAN" : "INS-BOMB-NEGR",
          grupo: group.item.product.category,
          quantity,
        }]
      : [];
  }));
  const appliedComboPercentage = pricedGroups
    .flatMap((group) => group.lines)
    .find((line) => line.combo)?.ajustePorcentaje;
  const mateComboMessage = mateCombo.mates > 0 && mateCombo.bombillas === 0
    ? "Agregá una bombilla negra y obtené 25% OFF en el combo por transferencia."
    : mateCombo.bombillas > 0 && mateCombo.mates === 0
      ? "Agregá un mate blanco o negro y obtené 25% OFF en el combo por transferencia."
      : appliedMateCombo.pairs > 0 && appliedComboPercentage === 35
        ? `Combo aplicado en ${appliedMateCombo.pairs} pares: 35% OFF por transferencia.`
        : appliedMateCombo.pairs > 0 && appliedComboPercentage === 25
          ? `Combo aplicado en ${appliedMateCombo.pairs} ${appliedMateCombo.pairs === 1 ? "par" : "pares"}: 25% OFF.${mateCombo.pairs < 10 ? ` Agregá ${10 - mateCombo.pairs} ${10 - mateCombo.pairs === 1 ? "par" : "pares"} para alcanzar 35% OFF.` : " Se aplicó la opción más conveniente."}`
          : mateCombo.pairs > 0
            ? "Tenés mate y bombilla; conservamos los descuentos individuales porque ofrecen el menor precio."
          : null;

  const handleOutsideClick = () => {
    onClose();
  };

  const handleClearCart = () => {
    if (window.confirm("¿Querés borrar todos los productos del carrito?")) {
      clearCart();
    }
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
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  aria-label="Vaciar carrito"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Vaciar carrito</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full"
                aria-label="Cerrar carrito"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
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
                  const price = getPrice(item.product, item.color, item.weight);
                  const sku = getVariantItemId(item.product, item.color, item.weight);
                  const group = pricedGroups.find((group) => group.lines[0].nombre === sku
                    && group.item.product.category === item.product.category);
                  const lines = group?.lines ?? [];
                  const lineTotal = lines.reduce((sum, line) => sum + calculateCheckoutLinePricing(line.precioBaseUnitario, line.cantidad, line.ajustePorcentaje).subtotalNeto, 0);
                  const discountedPrice = group ? Math.round(lineTotal / group.item.quantity) : price;
                  const colorImage = getVariantImage(item.product, item.color, item.weight);
                  return (
                    <div
                      key={`${item.product.id}-${item.color}-${item.weight}`}
                      className="flex flex-col p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={colorImage}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {item.product.name}
                          </h3>
                          <div className="text-black mt-1">
                            {price !== undefined && discountedPrice !== undefined && discountedPrice < price ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-base sm:text-lg font-bold">
                                    $
                                    {formatPrice(discountedPrice)}
                                  </span>
                                  <span className="text-base sm:text-lg text-gray-300 font-bold line-through">
                                    $
                                    {formatPrice(price ?? 0)}
                                  </span>
                                   <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-medium">
                                     Transferencia
                                  </span>
                                </div>
                              </>
                            ) : (
                              <span className="text-base sm:text-lg font-bold">
                                $
                                {formatPrice(price ?? 0)}
                              </span>
                            )}
                          </div>
                          {lines.map((line, index) => (
                            <p key={index} className="text-xs text-emerald-700 mt-1">
                              {line.cantidad} u. {line.combo ? "en combo" : lines.some((part) => part.combo) ? "sobrantes" : "individuales"}: {line.ajustePorcentaje.toLocaleString("es-AR")}% · ${formatPrice(calculateCheckoutLinePricing(line.precioBaseUnitario, line.cantidad, line.ajustePorcentaje).subtotalNeto)}
                            </p>
                          ))}
                          {item.color && (
                            <p className="text-gray-600 mt-1">
                              Color: {item.color}{item.weight > 0 && `, Peso: ${item.weight}kg`}
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
              {mateComboMessage && (
                <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-950" role="status">
                  <p className="flex items-start gap-2 font-medium">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{mateComboMessage}</span>
                  </p>
                </div>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium">Subtotal:</span>
                  <span className="text-lg font-bold text-gray-700">
                    $
                    {formatPrice(originalTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium">Descuento:</span>
                  <span className="text-lg font-bold text-red-500">
                    -$
                    {formatPrice(discount)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Total por transferencia:</span>
                  <span className="text-xl font-bold text-black">
                    $
                    {formatPrice(total)}
                  </span>
                </div>
                {wholesale.isWholesale && (
                  <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900" role="status">
                    <div className="flex justify-between"><span>Compra mínima mayorista</span><strong>{formatKg(wholesale.minimumPurchaseKg)} kg de filamentos</strong></div>
                    <div className="flex justify-between"><span>Peso de filamentos</span><strong>{formatKg(wholesale.filamentKg)} kg</strong></div>
                    {wholesale.missingKg > 0 && <p className="mt-2">Te faltan {formatKg(wholesale.missingKg)} kg de filamentos para acceder al precio mayorista.</p>}
                  </div>
                )}
                <button
                  className="w-full py-2 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-700 transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
                  onClick={handleCheckout}
                  disabled={!wholesale.canCheckout}
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
