import { useEffect } from "react";

const DEFAULT_TITLE = "WeTECH | Impresion 3D, filamentos y repuestos en Argentina";
const DEFAULT_DESCRIPTION =
  "Tienda WeTECH de impresion 3D en Argentina. Compra filamentos, repuestos y accesorios para impresoras 3D con atencion especializada.";
const DEFAULT_SITE_NAME = "WeTECH";
const DEFAULT_OG_IMAGE = "/assets/franquicias/wetech-franquicias-logo.webp";

const getAbsoluteUrl = (value: string) => {
  try {
    return new URL(value, window.location.origin).href;
  } catch {
    return value;
  }
};

const ensureMetaByName = (name: string) => {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.appendChild(meta);
  }

  return meta;
};

const ensureMetaByProperty = (property: string) => {
  let meta = document.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`
  );

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }

  return meta;
};

const ensureCanonical = () => {
  let canonical = document.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  );

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }

  return canonical;
};

interface SEOOptions {
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  type?: "website" | "product";
}

export function useSEO({
  title,
  description,
  canonicalPath,
  image,
  type = "website",
}: SEOOptions) {
  useEffect(() => {
    const resolvedTitle = title || DEFAULT_TITLE;
    const resolvedDescription = description || DEFAULT_DESCRIPTION;
    const resolvedCanonical = getAbsoluteUrl(
      canonicalPath || window.location.pathname
    );
    const resolvedImage = getAbsoluteUrl(image || DEFAULT_OG_IMAGE);

    document.title = resolvedTitle;
    ensureMetaByName("description").content = resolvedDescription;

    ensureCanonical().href = resolvedCanonical;

    ensureMetaByProperty("og:site_name").content = DEFAULT_SITE_NAME;
    ensureMetaByProperty("og:title").content = resolvedTitle;
    ensureMetaByProperty("og:description").content = resolvedDescription;
    ensureMetaByProperty("og:url").content = resolvedCanonical;
    ensureMetaByProperty("og:type").content = type;
    ensureMetaByProperty("og:image").content = resolvedImage;

    ensureMetaByName("twitter:card").content = "summary_large_image";
    ensureMetaByName("twitter:title").content = resolvedTitle;
    ensureMetaByName("twitter:description").content = resolvedDescription;
    ensureMetaByName("twitter:image").content = resolvedImage;
  }, [canonicalPath, description, image, title, type]);
}
