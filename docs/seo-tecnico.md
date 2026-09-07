# SEO técnico y publicación

`npm run build` genera el frontend y después consulta `GET /seo/products` para
crear HTML por producto, un catálogo con enlaces rastreables, `sitemap.xml`,
`robots.txt`, `404.html` y el manifiesto de rutas `seo-routes.json`.

Las descripciones técnicas de la API se publican como secciones de texto, con
imagen, precio de lista, disponibilidad, marca y enlaces relacionados. No se
generan especificaciones nuevas ni se corrige el contenido del catálogo.

Durante el arranque de JavaScript se muestra un indicador de carga en lugar de
un destello del catálogo estático. React lo reemplaza al montar la aplicación.
Sin JavaScript el contenido inicial se muestra directamente, con estilos básicos;
si el arranque falla o demora más de tres segundos, vuelve a quedar visible.

## Configuración de build

| Variable | Uso |
| --- | --- |
| `VITE_SITE_URL` | Origen público usado por HTML, sitemap y React. Predeterminado: `https://shop.wetech.ar`. No admite subdirectorios. |
| `VITE_API_URL` | API usada por la tienda y, por defecto, el prerenderizado. |
| `SEO_API_URL` | Origen alternativo accesible desde el build, si hace falta. Nunca necesita enviarse al navegador. |
| `SEO_MIN_PRODUCTS` | Mínimo de fichas esperado. Predeterminado: **50**, tomando como referencia las 61 fichas observadas al implementar esta mejora. Ajustarlo explícitamente si cambia el tamaño del catálogo. |

Se cargan las variables de Vite para producción (`.env`, `.env.local`,
`.env.production`, `.env.production.local`), dando prioridad al entorno del
proceso. En Docker, las variables de la tabla son argumentos de build.
`VITE_SITE_URL` debe configurarse durante el build, no sólo al arrancar el contenedor.

El Dockerfile también conserva los argumentos de la configuración del servidor:
`VITE_API_BEARER_TOKEN`, `VITE_READ_API_TOKEN`, `VITE_GOOGLE_MAPS_API_KEY`,
`VITE_CHECKOUT_PASSWORD_ENABLED`, `VITE_CHECKOUT_ACCESS_PASSWORD` y
`VITE_FEATURABLE_WIDGET_ID`. El script de despliegue o Compose debe proporcionar
sus valores como argumentos de build; declararlos no les asigna un valor.

El build falla ante una API inaccesible, timeout, catálogo vacío o por debajo
del mínimo, identificadores duplicados, slugs inseguros o fichas sin precio,
stock o imagen válidos. No se publican páginas genéricas mediante
`PRERENDER_PRODUCT_PATHS`: las fichas deben existir en la API.

## Servidor y códigos HTTP

Ejecutar `npm start` después del build. Usa `scripts/serve-seo.mjs`, también
incluido en el Dockerfile, con Node 22. El puerto predeterminado es 3000 y se
puede cambiar mediante `PORT`.

- Las rutas del manifiesto responden con su propio HTML y estado 200.
- Las rutas inexistentes, incluidos productos ausentes del build, responden
  **404**, con página útil y `noindex`.
- Los IDs anteriores que se pueden derivar del feed redirigen con 301 al slug.
  Se conservan los parámetros, incluidos cupones y campañas.
- Las URLs con barra final o `/index.html` redirigen a la ruta canónica.
- Las rutas de franquicias de otras provincias redirigen a Mendoza, que ya era
  la canonical de la página compartida por todas las provincias.
- Búsqueda interna, checkout, callback y sección en desarrollo llevan `noindex`
  tanto en HTML como en React, y no aparecen en el sitemap.
- `robots.txt` permite rastrear esas páginas para que los bots puedan leer
  `noindex`; no es un mecanismo de autorización ni de privacidad.

Si otro hosting sirve `dist` directamente, debe replicar estas reglas. No usar
una reescritura global a `index.html` con estado 200: anula los 404 y puede servir
el HTML de inicio en lugar de las fichas. `npm run dev` y `vite preview` no
representan las reglas HTTP del servidor de producción; verificar con `npm start`.

## Datos estructurados y actualización

El build y React comparten `src/seo/productSchema.mjs`. Hay un solo script
`wetech-structured-data`, que se actualiza al cargar la ficha y se elimina al
navegar fuera de ella. Se conserva el HTML inicial mientras carga esa misma URL.
La canonical usa siempre el dominio configurado; los errores no declaran una
canonical hacia la portada. `noindex` se restablece al navegar a páginas públicas.

La oferta estructurada usa **precio de lista**, para no presentar el descuento
condicionado a transferencia como precio universal. El precio que se cobra y
los cálculos del carrito no cambian. El feed representa familias y React puede
mostrar una variante seleccionada: el modelo completo de variantes y la paridad
de todos los filtros de publicación requieren continuar el trabajo con el backend.

El HTML y el sitemap son una foto del catálogo al construir. **Cambios de precio,
stock, altas, bajas o slugs requieren otro build y despliegue**. `no-cache` evita
cachés duraderas de HTML, pero no actualiza esos archivos por sí mismo. Para
automatizar su vigencia, conectar cambios del catálogo a la publicación o adoptar
renderizado con caché invalidable. `lastmod` usa `updatedAt` de la API cuando es
válido; no se inventa una fecha nueva en cada build.

## Verificación

```sh
npm test
npm run build
npm start
```

Las pruebas SEO comprueban errores del catálogo, contenido sin JavaScript,
escape de HTML/JSON-LD, sitemap, transiciones de metadatos y respuestas HTTP
reales del servidor, incluyendo redirects, gzip, HEAD y 404.

Después del despliegue, inspeccionar una ficha en Search Console y en Rich
Results Test, enviar `/sitemap.xml` y comprobar que el proxy/CDN conserva los
códigos y encabezados. Estas acciones externas no se ejecutan desde el build.

Referencias: [Google: SEO con JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
y [directivas robots](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag).
