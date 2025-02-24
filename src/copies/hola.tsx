import { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { ChevronDown } from 'lucide-react';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState<string | null>(
        product.colors?.[0]?.name || null
    );
    const [selectedWeight, setSelectedWeight] = useState<number | null>(
        product.weights?.[0] || null
    );
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

    return (
        <div className="bg-white rounded-lg shadow-md overflow-visible hover:shadow-lg transition-shadow">
            <img
                src={product.image}
                alt={product.name}
                className="w-full h-32 sm:h-48 object-cover"
            />
            <div className="p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-2">{product.description}</p>


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
                                <div className="fixed sm:absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
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
                                            {color.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {product.category === 'filamento' && product.weights && (
                    <div className="mb-3">
                        <span className="text-sm font-semibold">Presentación:</span>
                        <div className="flex gap-2 mt-1">
                            {product.weights.map((weight) => (
                                <button
                                    key={weight}
                                    onClick={() => setSelectedWeight(weight)}
                                    className={`px-3 py-1.5 text-sm border rounded-md ${selectedWeight === weight ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}
                                >
                                    {weight} kg
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="text-lg sm:text-xl font-bold text-blue-600">${product.price}</span>
                    <button className="w-full sm:w-auto bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm sm:text-base hover:bg-blue-700 transition-colors">
                        Añadir al carrito
                    </button>
                </div>
            </div>
        </div>



    );
}