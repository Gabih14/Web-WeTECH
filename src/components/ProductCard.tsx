import { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const [currentPrice, setCurrentPrice] = useState(product.price);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors?.[0]?.name || null
  );
  const [selectedWeight, setSelectedWeight] = useState<number | null>(
    product.weights?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsColorMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedWeight !== null) {
      setCurrentPrice(product.price * selectedWeight);
    }
  }, [selectedWeight, product.price]);

  const handleAddToCart = () => {
    if (selectedColor && selectedWeight !== null) {
      addToCart(product, selectedColor, selectedWeight, quantity);
    }
  };

  const getStock = (color: string, weight: number) => {
    const colorData = product.colors?.find(c => c.name === color);
    return colorData ? colorData.stock[weight.toString()] || 0 : 0;
  };

  const canAddToCart = selectedColor && selectedWeight !== null && getStock(selectedColor, selectedWeight) > 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-visible hover:shadow-lg transition-shadow flex flex-col">
      <Link to={`/product/${product.id}`}>
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-32 sm:h-48 object-cover"
      />
      </Link>
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`}>
        <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 line-clamp-2">{product.name}</h3>
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
                        backgroundColor: product.colors.find(c => c.name === selectedColor)?.hex
                      }}
                    />
                  )}
                  {selectedColor || 'Seleccionar color'}
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
                      {color.name} <span className="text-xs text-gray-500">(stock {getStock(color.name, selectedWeight || product.weights?.[0] || 0)})</span>
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
                  key={weight}
                  onClick={() => setSelectedWeight(weight)}
                  className={`px-2 py-1.5 text-sm border rounded-md ${selectedWeight === weight ? 'bg-blue-600 text-white' : 'bg-white text-black'} sm:px-3 sm:py-2 sm:text-base`}
                >
                  {weight}kg
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto">
          <div className="mb-3">
            <span className="text-2xl sm:text-3xl font-bold">${currentPrice.toFixed(2)}</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className={`px-4 py-2 rounded-md text-white
              ${canAddToCart
                ? 'bg-indigo-600 hover:bg-indigo-700' 
                : 'bg-gray-400 cursor-not-allowed'
              } transition-colors`}
          >
            {canAddToCart ? 'Agregar' : 'Sin stock'}
          </button>
        </div>
      </div>
    </div>
  );
}