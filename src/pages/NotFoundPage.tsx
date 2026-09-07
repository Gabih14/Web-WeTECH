import { Link } from "react-router-dom";
import { useSEO } from "../hooks/useSEO";

export function NotFoundPage() {
  useSEO({
    title: "Página no encontrada | WeTECH",
    description: "Esta página no existe. Explorá el catálogo de WeTECH.",
    canonicalPath: null,
    noindex: true,
  });
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="text-3xl font-bold">Página no encontrada</h1>
      <p className="mt-4">El enlace no existe o la página cambió de dirección.</p>
      <Link to="/products" className="mt-6 inline-block rounded bg-yellow-400 px-6 py-3 font-semibold">
        Ver productos
      </Link>
    </section>
  );
}
