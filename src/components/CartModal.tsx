import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, updateQuantity, removeFromCart, total } = useCart();

  if (!isOpen) return null;

  const getStock = (product: Product, color: string, weight: number): number => {
    if (product.colors && product.weights) {
      const colorData = product.colors.find(c => c.name === color);
      return colorData ? colorData.stock[weight.toString()] || 0 : 0;
    }
    return product.stock ?? 0;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen md:flex md:items-center md:justify-center">
        <div className="relative bg-white w-full max-w-md mx-auto rounded-lg shadow-lg p-6">
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
            <p className="text-gray-500 text-center py-4">El carrito está vacío</p>
          ) : (
            <>
              <div className="space-y-4 mb-4 max-h-[60vh] overflow-y-auto">
                {items.map((item) => {
                  const availableStock = getStock(item.product, item.color, item.weight);
                  return (
                    <div key={`${item.product.id}-${item.color}-${item.weight}`} className="flex flex-col p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                          <p className="text-indigo-600 mt-1">
                            ${item.product.price} c/u
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
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.color, item.weight)}
                            className="p-1 hover:bg-gray-200 rounded-full"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.color, item.weight)}
                            className="p-1 hover:bg-gray-200 rounded-full"
                            disabled={item.quantity >= availableStock}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.color, item.weight)}
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
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Total:</span>
                  <span className="text-xl font-bold text-indigo-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <button
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                  onClick={() => {
                    alert('¡Gracias por tu compra!');
                    onClose();
                  }}
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