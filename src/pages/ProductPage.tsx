import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProducts } from "../services/fetchProducts";
import { useCart } from "../context/CartContext";
import Isologo from "../assets/Isologo Fondo Negro SVG.svg";
import { ShoppingCart, ChevronDown } from "lucide-react";
import { Product } from "../types";

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart, items } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Hooks para UI y lógica
  const [currentPrice, setCurrentPrice] = useState<number | undefined>(
    undefined
  );
  const [currentPromotionalPrice, setCurrentPromotionalPrice] = useState<
    number | undefined
  >(undefined);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts()
      .then((data) => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  const product = products.find((p) => p.id === id);

  // Inicializa los estados dependientes de product cuando product cambia
  useEffect(() => {
    if (product) {
      setCurrentPrice(product.price);
      setCurrentPromotionalPrice(product.promotionalPrice);
      setSelectedColor(product.colors?.[0]?.name || null);
      setSelectedWeight(product.weights?.[0]?.weight || null);
    }
  }, [product]);

  /* Si el producto no existe mostrar mensaje de error */
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Link to="/" className="flex items-center mb-4">
          <img
            src={Isologo}
            alt="Logo WeTECH"
            className="mx-auto h-16 md:h-48"
          />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4 text-center">
          PRODUCTO NO ENCONTRADO
        </h1>
        <Link to="/">
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 mt-4 rounded-md">
            Volver al inicio
          </button>
        </Link>
      </div>
    );
  }

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

  if (loading) {
    return <div className="text-center py-10">Cargando producto...</div>;
  }

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
        {/* PRODUCT PRICE */}
        <p className="mt-4 text-4xl font-bold">
          {currentPromotionalPrice ? (
            <>
              <span className="text-base sm:text-2xl font-bold">
                ${currentPromotionalPrice.toLocaleString("es-ES", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </span>
              <span className="text-xs sm:text-lg text-gray-300 font-bold line-through px-2">
                ${currentPrice?.toLocaleString("es-ES", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </span>
            </>
          ) : (
            <span className="text-base sm:text-2xl font-bold">
              ${currentPrice?.toLocaleString("es-ES", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          )}
        </p>
        <p className="pt-5 text-sm leading-5 text-gray-500 mb-5">
          {product.description}
        </p>
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
        {/* COLORS */}
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

        <div className="mt-7 flex flex-row items-center gap-6">
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart || quantity + cartQuantity > availableStock}
            className={`flex h-12 w-1/3 items-center justify-center rounded-md text-white w-[150px] 
              ${
                canAddToCart && quantity + cartQuantity <= availableStock
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-gray-400 cursor-not-allowed"
              } transition-colors`}
          >
            <ShoppingCart className="mx-2" />
            {canAddToCart && quantity + cartQuantity <= availableStock
              ? "Agregar"
              : "Sin stock"}
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