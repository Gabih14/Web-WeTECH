import { useEffect } from "react";
import { DEFAULT_SITE_URL, STRUCTURED_DATA_ID } from "../seo/productSchema.mjs";

const DEFAULT_TITLE = "WeTECH | Impresion 3D, filamentos y repuestos en Argentina";
const DEFAULT_DESCRIPTION =
  "Tienda WeTECH de impresion 3D en Argentina. Compra filamentos, repuestos y accesorios para impresoras 3D con atencion especializada.";
const DEFAULT_SITE_NAME = "WeTECH";
const DEFAULT_OG_IMAGE = "/assets/franquicias/wetech-franquicias-logo.webp";

const getAbsoluteUrl = (value: string) => {
  try {
    return new URL(value, import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).href;
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

type StructuredData = Record<string, unknown> | Record<string, unknown>[];

const updateStructuredData = (structuredData?: StructuredData | null) => {
  const existingScript = document.querySelector<HTMLScriptElement>(`script#${STRUCTURED_DATA_ID}`);

  if (!structuredData) {
    existingScript?.remove();
    return;
  }

  const script =
    existingScript ?? document.createElement("script");

  script.id = STRUCTURED_DATA_ID;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(structuredData);

  if (!existingScript) {
    document.head.appendChild(script);
  }
};

interface SEOOptions {
  title?: string;
  description?: string;
  canonicalPath?: string | null;
  image?: string;
  type?: "website" | "product";
  structuredData?: StructuredData | null;
  noindex?: boolean;
  pending?: boolean;
}

export function useSEO({
  title,
  description,
  canonicalPath,
  image,
  type = "website",
  structuredData,
  noindex = false,
  pending = false,
}: SEOOptions) {
  useEffect(() => {
    const resolvedTitle = title || DEFAULT_TITLE;
    const resolvedDescription = description || DEFAULT_DESCRIPTION;
    const resolvedCanonical = canonicalPath === null ? null : getAbsoluteUrl(
      canonicalPath || window.location.pathname
    );
    // Keep the prerendered head while this same product loads. On navigation to
    // another URL we must remove the previous product's metadata instead.
    if (pending && resolvedCanonical && document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    )?.href === resolvedCanonical) return;
    const resolvedImage = getAbsoluteUrl(image || DEFAULT_OG_IMAGE);

    document.title = resolvedTitle;
    ensureMetaByName("description").content = resolvedDescription;

    if (resolvedCanonical) ensureCanonical().href = resolvedCanonical;
    else document.querySelector('link[rel="canonical"]')?.remove();
    ensureMetaByName("robots").content = noindex ? "noindex,follow" : "index,follow,max-image-preview:large";

    ensureMetaByProperty("og:site_name").content = DEFAULT_SITE_NAME;
    ensureMetaByProperty("og:title").content = resolvedTitle;
    ensureMetaByProperty("og:description").content = resolvedDescription;
    if (resolvedCanonical) ensureMetaByProperty("og:url").content = resolvedCanonical;
    else document.querySelector('meta[property="og:url"]')?.remove();
    ensureMetaByProperty("og:type").content = type;
    ensureMetaByProperty("og:image").content = resolvedImage;

    ensureMetaByName("twitter:card").content = "summary_large_image";
    ensureMetaByName("twitter:title").content = resolvedTitle;
    ensureMetaByName("twitter:description").content = resolvedDescription;
    ensureMetaByName("twitter:image").content = resolvedImage;

    updateStructuredData(structuredData);
  }, [canonicalPath, description, image, structuredData, title, type, noindex, pending]);
}
