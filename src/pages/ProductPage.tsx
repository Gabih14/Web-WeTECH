import { Link, useParams } from "react-router-dom";
import { products } from "../data/products";
import { ShoppingCart, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import Isologo from "../assets/Isologo Fondo Negro SVG.svg";

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Link to="/" className="flex items-center mb-4">
          <img src={Isologo} alt="Logo WeTECH" className="mx-auto h-16 md:h-48" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4 text-center">
          PRODUCTO NO ENCONTRADO
        </h1>
        <Link to="/">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 mt-4 rounded-md">
            Volver al inicio
          </button>
        </Link>
      </div>
    );
  }

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
    const colorData = product.colors?.find((c) => c.name === color);
    return colorData ? colorData.stock[weight.toString()] || 0 : 0;
  };

  const canAddToCart =
    selectedColor &&
    selectedWeight !== null &&
    getStock(selectedColor, selectedWeight) > 0;

  const plusMinuceButton =
    "flex h-8 w-8 cursor-pointer items-center justify-center border duration-100 hover:bg-neutral-100 focus:ring-2 focus:ring-gray-500 active:ring-2 active:ring-gray-500";

  return (
    <section className="container flex-grow mx-auto max-w-[1200px] border-b py-5 lg:grid lg:grid-cols-2 lg:py-10">
      {/* image gallery */}
      <div className="container mx-auto px-4">
        <img src={product.image} alt={product.name} className="" />
        {/* /image gallery  */}
      </div>
      {/* description  */}
      <div className="mx-auto px-5 lg:px-5">
        <h2 className="pt-3 text-2xl font-bold lg:pt-0">{product.name}</h2>
        <div className="mt-1">
          <div className="flex items-center">
            {/* <Rater
              style={{ fontSize: "20px" }}
              total={5}
              interactive={false}
              rating={3.5}
            /> */}
          </div>
        </div>
        {/* <p className="mt-5 font-bold">
          Availability:{" "}
          {productDetailItem.availability ? (
            <span className="text-green-600">In Stock </span>
          ) : (
            <span className="text-red-600">Expired</span>
          )}
        </p> */}
        <p className="mt-4 text-4xl font-bold text-violet-900">
          ${currentPrice.toFixed(2)}{" "}
          {/* <span className="text-xs text-gray-400 line-through">
            ${productDetailItem.previousPrice}
          </span> */}
        </p>
        <p className="pt-5 text-sm leading-5 text-gray-500">
          {product.description}
        </p>
        {product.weights && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2 mt-1">
              {product.weights.map((weight) => (
                <button
                  key={weight}
                  onClick={() => setSelectedWeight(weight)}
                  className={`px-2 py-1.5 text-sm border rounded-md ${
                    selectedWeight === weight
                      ? "bg-blue-600 text-white"
                      : "bg-white text-black"
                  } sm:px-3 sm:py-2 sm:text-base`}
                >
                  {weight}kg
                </button>
              ))}
            </div>
          </div>
        )}
        {/* COLORS */}
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
                          selectedWeight || product.weights?.[0] || 0
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
        {/* COLORS */}
        <div className="mt-6">
          <p className="pb-2 text-xs text-gray-500">Quantity</p>
          <div className="flex">
            <button
              className={`${plusMinuceButton}`}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              −
            </button>
            <div className="flex h-8 w-8 cursor-text items-center justify-center border-t border-b active:ring-gray-500">
              {quantity}
            </div>
            <button
              className={`${plusMinuceButton}`}
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>
        </div>
        <div className="mt-7 flex flex-row items-center gap-6">
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className={`flex h-12 w-1/3 items-center justify-center rounded-md text-white
              ${
                canAddToCart
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-400 cursor-not-allowed"
              } transition-colors`}
          >
            <ShoppingCart className="mx-2" />
            {canAddToCart ? "Agregar" : "Sin stock"}
          </button>
          {/* <button className="flex h-12 w-1/3 items-center justify-center bg-amber-400 duration-100 hover:bg-yellow-300">
            <Heart className="mx-2" />
            Wishlist
          </button> */}
        </div>
      </div>
    </section>
  );
}