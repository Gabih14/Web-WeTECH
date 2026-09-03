import { useEffect } from "react";

const DEFAULT_TITLE = "WeTECH | Impresion 3D, filamentos y repuestos en Argentina";
const DEFAULT_DESCRIPTION =
  "Tienda WeTECH de impresion 3D en Argentina. Compra filamentos, repuestos y accesorios para impresoras 3D con atencion especializada.";

const ensureMetaDescription = () => {
  let metaDescription = document.querySelector<HTMLMetaElement>(
    'meta[name="description"]'
  );

  if (!metaDescription) {
    metaDescription = document.createElement("meta");
    metaDescription.name = "description";
    document.head.appendChild(metaDescription);
  }

  return metaDescription;
};

interface SEOOptions {
  title?: string;
  description?: string;
}

export function useSEO({ title, description }: SEOOptions) {
  useEffect(() => {
    document.title = title || DEFAULT_TITLE;
    ensureMetaDescription().content = description || DEFAULT_DESCRIPTION;
  }, [title, description]);
}

