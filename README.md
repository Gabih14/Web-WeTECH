# 🛒 Web-WeTECH

Sitio web e-commerce para venta de productos relacionados con la impresión 3D, desarrollado con **React + TypeScript + Vite**, utilizando **TailwindCSS** para estilos y enfoque mobile-first.

## 📦 Estructura del Proyecto

```

Web-WeTECH
├─ public/assets/                # Imágenes públicas del sitio
├─ src/
│  ├─ assets/                    # Recursos estáticos (logos, imágenes)
│  ├─ components/                # Componentes reutilizables (Navbar, Footer, etc.)
│  ├─ context/                   # Context API para manejo de auth y carrito
│  ├─ copies/                    # Versiones de prueba o respaldo de formularios
│  ├─ data/                      # Datos simulados (productos, usuarios, categorías)
│  ├─ pages/                     # Rutas principales (Home, Productos, Checkout, etc.)
│  ├─ services/                 # Funciones para peticiones como `fetchProducts`
│  ├─ types.ts                  # Tipos de datos TypeScript centralizados
│  ├─ index.css                 # Estilos base con Tailwind
│  └─ main.tsx                  # Punto de entrada principal
├─ vite.config.ts               # Configuración de Vite
├─ tailwind.config.js           # Configuración de Tailwind
├─ tsconfig\*.json               # Configuración de TypeScript
└─ .env                         # Variables de entorno (agregado al .gitignore)

````

## 🚀 Funcionalidades

- 🛒 Catálogo de productos con filtros por categoría
- 🔍 Búsqueda de productos por nombre
- 🧾 Carrito de compras con manejo de stock
- 👤 Autenticación simulada (AuthContext)
- 💳 Checkout dividido en pasos: datos personales, dirección, facturación y pago
- 📬 Integración con pasarela de pago externa (Nave)
- 📱 Diseño responsive con enfoque mobile-first
- 🌐 Página de franquicias con información general

## Reglas monetarias de carrito y pedidos

Estas reglas deben mantenerse sincronizadas con:

- `api-we-tech-v2/src/pedido/pedido.service.ts`
- `api-we-tech-v2/src/pricing/discounts.ts`
- `api-we-tech-v2/src/cupon/cupon.service.ts`

Los cálculos reutilizables del frontend están centralizados principalmente en
`src/utils/checkoutPricing.ts`, `src/utils/checkoutDiscount.ts`,
`src/utils/discounts.ts`, `src/utils/invoice.ts` y
`src/utils/orderPricing.ts`.

### Precio base

El backend normaliza el precio de lista cotizado al peso antes de calcular una
línea:

```ts
const precioBase = Math.round(precioCatalogo);
```

Este es el único redondeo anterior al cálculo de la línea. No se debe redondear
un precio unitario descontado para después multiplicarlo por la cantidad.

### Productos sin factura

```ts
const subtotalBruto = Math.round(precioBase * cantidad);
const subtotalNeto = Math.round(
  precioBase * cantidad * (1 - descuentoPorcentaje / 100)
);
const precioUnitario = Math.round(subtotalNeto / cantidad);
```

`subtotalNeto` es la fuente de verdad. Es válido que:

```ts
subtotalNeto !== precioUnitario * cantidad
```

El carrito, el resumen, el payload de `POST /pedido` y el callback de pago no
deben reconstruir el subtotal multiplicando el precio unitario redondeado.

Ejemplo:

```text
precio base:       23528
cantidad:          5
descuento:         17%
subtotal neto:     97641
precio unitario:   19528
unitario × cantidad = 97640 (diferencia válida)
```

### Descuento automático

El descuento automático sólo se aplica en pagos por transferencia.

- Categorías admitidas: `FILAMENTOS` y su representación frontend
  `FILAMENTO 3D`.
- Los filamentos no elegibles para descuento por cantidad reciben el descuento
  base del 15%.
- Para el descuento diferencial, el producto debe pesar exactamente 1 kg y su
  identidad Marca + Material debe estar en la misma lista que el backend.
- La cantidad usada por los niveles se acumula entre todos los productos
  elegibles del carrito.
- Niveles: 15% desde 1 unidad, 17% desde 5, 20% desde 10 y 22% desde 50.
- Deben conservarse las equivalencias de variantes legacy, incluyendo `3N`,
  `G3`, `GS`, `HB`, `3X`, `FM` y `EG`.
- El producto de envío nunca participa del descuento ni de la cantidad
  acumulada.

### Cupones

El porcentaje depende del método de pago:

- `online`: `porcentajeDescuentoTarjeta`.
- `transfer`: `porcentajeDescuentoTransferencia`.
- Si el campo específico no está disponible, se usa
  `porcentajeDescuento` como compatibilidad legacy.

Un cupón puede ser general o limitarse a `filamento`, `impresora` o
`repuesto`. La categoría debe evaluarse por cada línea.

Para cada producto:

```ts
const porcentajeAplicado = Math.max(
  descuentoAutomatico,
  descuentoCuponAplicable
);
```

Los porcentajes nunca se suman. En caso de empate gana el descuento
automático.

`descuento_cupon` representa el ahorro completo desde el precio base, pero
sólo para las líneas donde el cupón supera al automático:

```ts
const descuentoCuponLinea =
  descuentoCuponAplicable > descuentoAutomatico
    ? Math.round(precioBase * cantidad - subtotalNeto)
    : 0;

const descuento_cupon = suma(descuentoCuponLinea);
```

Ejemplo:

```text
precio base total:       117640
automático:              17%
cupón:                   20%
subtotal neto:           94112
descuento_cupon:         23528
```

No debe enviarse `3529`, ya que ésa sería solamente la diferencia incremental
entre 17% y 20%.

`descuento_cupon` es informativo y de validación: no se resta nuevamente del
total porque el descuento ya está incorporado en los subtotales netos.

### Envío y total

El envío:

- usa `ajuste_porcentaje: 0`;
- no recibe descuento automático ni cupón;
- no participa de `descuento_cupon`;
- conserva su subtotal como producto `ENV-...-DELIVERY`;
- se incluye exactamente una vez en el total.

Sin factura:

```ts
const total =
  suma(subtotalesNetosDeProductos) +
  costoEnvio;
```

Aunque el envío viaje también dentro de `productos`, no se debe sumar el
producto de envío y volver a agregar `costo_envio`.

Caso de referencia:

```text
producto: 10 × 3499 = 34990
envío:    1 × 5599  = 5599
total:                  40589
```

### Factura A/B e IVA

La selección A/B está actualmente deshabilitada en la interfaz, pero su
cálculo y payload están implementados y probados por separado.

Para factura se usa la lista `MINORISTA CON IVA`, normalizada al peso. La
secuencia debe coincidir con Nacional y con `PedidoService`:

```ts
const subtotalBrutoConIva = round2(
  precioBase * cantidad * 1.21
);
const brutoConDescuento = round2(
  subtotalBrutoConIva * (1 - descuentoPorcentaje / 100)
);
const subtotalNetoSinIva = Math.round(
  brutoConDescuento / 1.21
);
const ivaLinea = round2(subtotalNetoSinIva * 0.21);
const subtotalFinalConIva = round2(
  subtotalNetoSinIva + ivaLinea
);
const precioUnitarioEnviado = round2(
  subtotalFinalConIva / cantidad
);
```

En el payload de una línea con factura:

- `subtotal` es `subtotalBrutoConIva`, previo al descuento;
- `precio_unitario` es el precio final con IVA;
- `ajuste_porcentaje` es el mayor porcentaje aplicable.

El total de cabecera se calcula sobre el neto agregado:

```ts
const subtotalSinIva = round2(
  suma(subtotalesNetosSinIva) + costoEnvioNeto
);
const facturaIvaImporte = round2(subtotalSinIva * 0.21);
const total = round2(subtotalSinIva + facturaIvaImporte);
```

El envío también forma parte de la base de IVA, pero no recibe descuentos.
Para un cupón ganador en factura, `descuento_cupon` se calcula como
`Math.round(precioBase * cantidad - subtotalNetoSinIva)`.

Actualmente frontend y backend aplican 21% a los productos facturados. Existe
un pendiente compartido: las impresoras tributan 10,5%, por lo que antes de
habilitarlas en este flujo debe resolverse la alícuota por producto en ambos
proyectos.

### Pruebas de regresión

Ejecutar antes de modificar precios, descuentos, cupones, envío o factura:

```bash
npm test
npm run build
```

Las pruebas relevantes están en:

- `tests/checkoutPricing.test.cjs`
- `tests/checkoutDiscount.test.cjs`
- `tests/discounts.test.cjs`
- `tests/invoice.test.cjs`
- `tests/orderPricing.test.cjs`

## ⚙️ Tecnologías utilizadas

| Herramienta         | Descripción                                      |
|---------------------|--------------------------------------------------|
| **React**           | Librería principal de UI                         |
| **TypeScript**      | Tipado estático para mayor robustez              |
| **Vite**            | Bundler ligero para entorno de desarrollo rápido |
| **TailwindCSS**     | Framework de utilidades CSS                     |
| **Context API**     | Manejo de estado global para auth y carrito      |
| **Fetch API**       | Peticiones al backend (e.g. `/pedido`)           |

## 🔧 Instalación y uso

1. Clonar el repositorio:

```bash
git clone https://github.com/tuusuario/Web-WeTECH.git
cd Web-WeTECH
````

2. Instalar dependencias:

```bash
npm install
```

3. Crear archivo `.env` en la raíz con tus variables (por ejemplo):

```
VITE_BACKEND_URL=
```

4. Ejecutar el servidor de desarrollo:

```bash
npm run dev
```

## 📦 Build para producción

```bash
npm run build
```

---

## 💳 Integración de pagos

La plataforma se integra con **Nave**, un sistema externo de gestión de pagos. Al finalizar el checkout, se genera un link dinámico a través de un backend Node.js que responde con `naveUrl`.

> En algunos dispositivos móviles, es necesario que el link de Nave sea **abierto correctamente** mediante `window.open(url, "_blank")` para evitar errores como:
>
> `Failed to launch '<url>' because the scheme does not have a registered handler.`

## 🧪 En desarrollo...

* Integración completa con backend
* Gestión de usuarios reales
* Mejora en validaciones del formulario
* SEO y rendimiento

---




```
Web-WeTECH
├─ Dockerfile
├─ Dockerfile.bkp
├─ README.md
├─ SISTEMA_IMAGENES.md
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ public
│  ├─ Firma Email.jpg
│  └─ assets
│     ├─ filamentos
│     │  ├─ 3N3 EPET AZUL.png
│     │  ├─ 3N3 EPET BLANCO.png
│     │  ├─ 3N3 EPET GRIS ESPACIAL.png
│     │  ├─ 3N3 EPET NEGRO.png
│     │  ├─ 3N3 EPET ROJO CARMIN.png
│     │  ├─ 3N3 EPET VERDE LIMA.png
│     │  ├─ 3N3 PETG AZUL.png
│     │  ├─ 3N3 PETG BLANCO.png
│     │  ├─ 3N3 PETG BRONCE.png
│     │  ├─ 3N3 PETG GRIS ESPACIAL.png
│     │  ├─ 3N3 PETG NEGRO.png
│     │  ├─ 3N3 PETG ROJO.png
│     │  ├─ 3N3 PLA AMARILLO FLUO.png
│     │  ├─ 3N3 PLA AMARILLO.png
│     │  ├─ 3N3 PLA AZUL.png
│     │  ├─ 3N3 PLA BLANCO.png
│     │  ├─ 3N3 PLA BRONCE.png
│     │  ├─ 3N3 PLA CELESTE.png
│     │  ├─ 3N3 PLA COBRE.png
│     │  ├─ 3N3 PLA FUCSIA.png
│     │  ├─ 3N3 PLA GRIS ACERO.png
│     │  ├─ 3N3 PLA GRIS PLOMO.png
│     │  ├─ 3N3 PLA HABANO.png
│     │  ├─ 3N3 PLA HUESO.png
│     │  ├─ 3N3 PLA NARANJA.png
│     │  ├─ 3N3 PLA NATURAL.png
│     │  ├─ 3N3 PLA NEGRO.png
│     │  ├─ 3N3 PLA ORO.png
│     │  ├─ 3N3 PLA ROJO.png
│     │  ├─ 3N3 PLA ROSA.png
│     │  ├─ 3N3 PLA RUSTICO.png
│     │  ├─ 3N3 PLA VERDE FLUO.png
│     │  ├─ 3N3 PLA VERDE.png
│     │  ├─ 3N3 PLA VIOLETA.png
│     │  ├─ 3NMAX PLA+ AMARILLO.png
│     │  ├─ 3NMAX PLA+ AZUL.png
│     │  ├─ 3NMAX PLA+ BLANCO.png
│     │  ├─ 3NMAX PLA+ BRONCE.png
│     │  ├─ 3NMAX PLA+ CELESTE.png
│     │  ├─ 3NMAX PLA+ CHOCOLATE.png
│     │  ├─ 3NMAX PLA+ GRIS PLOMO.png
│     │  ├─ 3NMAX PLA+ LILA.png
│     │  ├─ 3NMAX PLA+ NARANJA.png
│     │  ├─ 3NMAX PLA+ NEGRO.png
│     │  ├─ 3NMAX PLA+ ROJO.png
│     │  ├─ 3NMAX PLA+ ROSA.png
│     │  ├─ 3NMAX PLA+ UVA.png
│     │  ├─ 3NMAX PLA+ VERDE.png
│     │  ├─ 3NMAXPLA+ FLEX AMARILLO.png
│     │  ├─ 3NMAXPLA+ FLEX AZUL PRUSIA.png
│     │  ├─ 3NMAXPLA+ FLEX BLANCO.png
│     │  ├─ 3NMAXPLA+ FLEX BRONCE.png
│     │  ├─ 3NMAXPLA+ FLEX GRIS PLOMO.png
│     │  ├─ 3NMAXPLA+ FLEX NARANJA.png
│     │  ├─ 3NMAXPLA+ FLEX NEGRO.png
│     │  ├─ 3NMAXPLA+ FLEX PIEL162.png
│     │  ├─ 3NMAXPLA+ FLEX PIEL720.png
│     │  ├─ 3NMAXPLA+ FLEX ROJO.png
│     │  ├─ 3NMAXPLA+ FLEX ROSA.png
│     │  ├─ 3NMAXPLA+ FLEX VERDE MANZANA.png
│     │  └─ 3NMAXPLA+ FLEX VERDE.png
│     ├─ folleto
│     │  └─ WeTECH - Folleto Expo Franquicias Mobile.pdf
│     ├─ franquicias
│     │  ├─ iconos folleto expo franquicias-01.svg
│     │  ├─ iconos folleto expo franquicias-02.svg
│     │  ├─ iconos folleto expo franquicias-03.svg
│     │  ├─ iconos folleto expo franquicias-04.svg
│     │  ├─ iconos folleto expo franquicias-05.svg
│     │  ├─ iconos folleto expo franquicias-06.svg
│     │  └─ wetech-franquicias-logo.webp
│     ├─ local1.webp
│     ├─ local2.webp
│     ├─ local3.webp
│     ├─ local4.webp
│     ├─ local5.webp
│     └─ local6.webp
├─ src
│  ├─ App.tsx
│  ├─ assets
│  │  ├─ CR6 S.png
│  │  ├─ GST-AMARILLO-700x700.png
│  │  ├─ GST-AMARILLO-FLUOR-700x700.png
│  │  ├─ Grilo_pla_blanco-1.jpeg
│  │  ├─ Grilon_pla_piel.jpeg
│  │  ├─ Isologo Fondo Negro SVG.svg
│  │  ├─ Logo WeTECH Negro PNG.png
│  │  ├─ filamentso-removebg-preview.webp
│  │  ├─ folleto
│  │  │  └─ WeTECH - Folleto Expo Franquicias Mobile.pdf
│  │  └─ racor 6mm plastico web2_Impresora 3D Creality CR-10 SMART Mendoza v2.jpg
│  ├─ components
│  │  ├─ CartModal.tsx
│  │  ├─ CategoryFilter.tsx
│  │  ├─ Checkout.tsx
│  │  ├─ CheckoutAdress.tsx
│  │  ├─ CheckoutBilling.tsx
│  │  ├─ CheckoutPersonal.tsx
│  │  ├─ ContactInfo.tsx
│  │  ├─ LoginModal.tsx
│  │  ├─ ProductCard.tsx
│  │  ├─ ReviewSection.tsx
│  │  ├─ ShippingInfoModal.tsx
│  │  └─ layout
│  │     ├─ Footer.tsx
│  │     └─ Navbar.tsx
│  ├─ context
│  │  ├─ AuthContext.tsx
│  │  └─ CartContext.tsx
│  ├─ copies
│  │  ├─ CheckoutAdress.tsx
│  │  ├─ CheckoutPayment.tsx
│  │  ├─ checkout-form.tsx
│  │  └─ hola.tsx
│  ├─ data
│  │  ├─ categories.ts
│  │  ├─ colors.ts
│  │  ├─ coupon.ts
│  │  ├─ excludedFamilies.ts
│  │  ├─ products.ts
│  │  ├─ shippingCost.ts
│  │  └─ users.json
│  ├─ hooks
│  ├─ index.css
│  ├─ main.tsx
│  ├─ pages
│  │  ├─ Franquicias.tsx
│  │  ├─ HomePage.tsx
│  │  ├─ PaymentCallback.tsx
│  │  ├─ ProductPage.tsx
│  │  ├─ ProductsPage.tsx
│  │  ├─ SearchResultsPage.tsx
│  │  └─ UnderDevelopment.tsx
│  ├─ services
│  │  ├─ api.ts
│  │  └─ fetchProducts.ts
│  ├─ types.ts
│  ├─ utils
│  │  └─ discounts.ts
│  └─ vite-env.d.ts
├─ tailwind.config.js
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts

```
```
Web-WeTECH
├─ .agents
├─ Dockerfile
├─ Dockerfile.bkp
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ public
│  ├─ assets
│  │  ├─ filamentos
│  │  │  ├─ 3N3 EPET AZUL.png
│  │  │  ├─ 3N3 EPET BLANCO.png
│  │  │  ├─ 3N3 EPET GRIS ESPACIAL.png
│  │  │  ├─ 3N3 EPET NEGRO.png
│  │  │  ├─ 3N3 EPET ROJO CARMIN.png
│  │  │  ├─ 3N3 EPET VERDE LIMA.png
│  │  │  ├─ 3N3 PETG AZUL.png
│  │  │  ├─ 3N3 PETG BLANCO.png
│  │  │  ├─ 3N3 PETG BRONCE.png
│  │  │  ├─ 3N3 PETG GRIS ESPACIAL.png
│  │  │  ├─ 3N3 PETG NEGRO.png
│  │  │  ├─ 3N3 PETG ROJO.png
│  │  │  ├─ 3N3 PLA AMARILLO FLUO.png
│  │  │  ├─ 3N3 PLA AMARILLO.png
│  │  │  ├─ 3N3 PLA AZUL.png
│  │  │  ├─ 3N3 PLA BLANCO.png
│  │  │  ├─ 3N3 PLA BRONCE.png
│  │  │  ├─ 3N3 PLA CELESTE.png
│  │  │  ├─ 3N3 PLA COBRE.png
│  │  │  ├─ 3N3 PLA FUCSIA.png
│  │  │  ├─ 3N3 PLA GRIS ACERO.png
│  │  │  ├─ 3N3 PLA GRIS PLOMO.png
│  │  │  ├─ 3N3 PLA HABANO.png
│  │  │  ├─ 3N3 PLA HUESO.png
│  │  │  ├─ 3N3 PLA NARANJA.png
│  │  │  ├─ 3N3 PLA NATURAL.png
│  │  │  ├─ 3N3 PLA NEGRO.png
│  │  │  ├─ 3N3 PLA ORO.png
│  │  │  ├─ 3N3 PLA ROJO.png
│  │  │  ├─ 3N3 PLA ROSA.png
│  │  │  ├─ 3N3 PLA RUSTICO.png
│  │  │  ├─ 3N3 PLA VERDE FLUO.png
│  │  │  ├─ 3N3 PLA VERDE.png
│  │  │  ├─ 3N3 PLA VIOLETA.png
│  │  │  ├─ 3NMAX PLA+ AMARILLO.png
│  │  │  ├─ 3NMAX PLA+ AZUL.png
│  │  │  ├─ 3NMAX PLA+ BLANCO.png
│  │  │  ├─ 3NMAX PLA+ BRONCE.png
│  │  │  ├─ 3NMAX PLA+ CELESTE.png
│  │  │  ├─ 3NMAX PLA+ CHOCOLATE.png
│  │  │  ├─ 3NMAX PLA+ GRIS PLOMO.png
│  │  │  ├─ 3NMAX PLA+ LILA.png
│  │  │  ├─ 3NMAX PLA+ NARANJA.png
│  │  │  ├─ 3NMAX PLA+ NEGRO.png
│  │  │  ├─ 3NMAX PLA+ ROJO.png
│  │  │  ├─ 3NMAX PLA+ ROSA.png
│  │  │  ├─ 3NMAX PLA+ UVA.png
│  │  │  ├─ 3NMAX PLA+ VERDE.png
│  │  │  ├─ 3NMAXPLA+ FLEX AMARILLO.png
│  │  │  ├─ 3NMAXPLA+ FLEX AZUL PRUSIA.png
│  │  │  ├─ 3NMAXPLA+ FLEX BLANCO.png
│  │  │  ├─ 3NMAXPLA+ FLEX BRONCE.png
│  │  │  ├─ 3NMAXPLA+ FLEX GRIS PLOMO.png
│  │  │  ├─ 3NMAXPLA+ FLEX NARANJA.png
│  │  │  ├─ 3NMAXPLA+ FLEX NEGRO.png
│  │  │  ├─ 3NMAXPLA+ FLEX PIEL162.png
│  │  │  ├─ 3NMAXPLA+ FLEX PIEL720.png
│  │  │  ├─ 3NMAXPLA+ FLEX ROJO.png
│  │  │  ├─ 3NMAXPLA+ FLEX ROSA.png
│  │  │  ├─ 3NMAXPLA+ FLEX VERDE MANZANA.png
│  │  │  └─ 3NMAXPLA+ FLEX VERDE.png
│  │  ├─ folleto
│  │  │  └─ WeTECH - Folleto Expo Franquicias Mobile.pdf
│  │  ├─ franquicias
│  │  │  ├─ iconos folleto expo franquicias-01.svg
│  │  │  ├─ iconos folleto expo franquicias-02.svg
│  │  │  ├─ iconos folleto expo franquicias-03.svg
│  │  │  ├─ iconos folleto expo franquicias-04.svg
│  │  │  ├─ iconos folleto expo franquicias-05.svg
│  │  │  ├─ iconos folleto expo franquicias-06.svg
│  │  │  └─ wetech-franquicias-logo.webp
│  │  ├─ local1.webp
│  │  ├─ local2.webp
│  │  ├─ local3.webp
│  │  ├─ local4.webp
│  │  ├─ local5.webp
│  │  └─ local6.webp
│  └─ Firma Email.jpg
├─ README.md
├─ SISTEMA_IMAGENES.md
├─ src
│  ├─ App.tsx
│  ├─ assets
│  │  ├─ CR6 S.png
│  │  ├─ filamentso-removebg-preview.webp
│  │  ├─ folleto
│  │  │  └─ WeTECH - Folleto Expo Franquicias Mobile.pdf
│  │  ├─ Grilon_pla_piel.jpeg
│  │  ├─ Grilo_pla_blanco-1.jpeg
│  │  ├─ GST-AMARILLO-700x700.png
│  │  ├─ GST-AMARILLO-FLUOR-700x700.png
│  │  ├─ Isologo Fondo Negro SVG.svg
│  │  ├─ Logo WeTECH Negro PNG.png
│  │  └─ racor 6mm plastico web2_Impresora 3D Creality CR-10 SMART Mendoza v2.jpg
│  ├─ components
│  │  ├─ cart
│  │  │  └─ CartModal.tsx
│  │  ├─ checkout
│  │  │  ├─ Checkout.tsx
│  │  │  ├─ CheckoutAdress.tsx
│  │  │  ├─ CheckoutBilling.tsx
│  │  │  ├─ CheckoutPersonal.tsx
│  │  │  ├─ ShippingInfoModal.tsx
│  │  │  └─ StepIndicator.tsx
│  │  ├─ ErrorBoundary.tsx
│  │  ├─ home
│  │  │  ├─ ContactInfo.tsx
│  │  │  └─ ReviewSection.tsx
│  │  ├─ layout
│  │  │  ├─ Footer.tsx
│  │  │  └─ Navbar.tsx
│  │  ├─ LoginModal.tsx
│  │  ├─ products
│  │  │  ├─ CategoryFilter.tsx
│  │  │  ├─ ColorSwatch.tsx
│  │  │  └─ ProductCard.tsx
│  │  └─ SurveyModal.tsx
│  ├─ context
│  │  ├─ AuthContext.tsx
│  │  └─ CartContext.tsx
│  ├─ data
│  │  ├─ categories.ts
│  │  ├─ colors.ts
│  │  ├─ excludedFamilies.ts
│  │  ├─ products.ts
│  │  ├─ shippingCost.ts
│  │  └─ users.json
│  ├─ hooks
│  │  ├─ useAddToCartFeedback.ts
│  │  └─ useMetaPixel.ts
│  ├─ index.css
│  ├─ main.tsx
│  ├─ pages
│  │  ├─ Franquicias.tsx
│  │  ├─ HomePage.tsx
│  │  ├─ PaymentCallback.tsx
│  │  ├─ ProductPage.tsx
│  │  ├─ ProductsPage.tsx
│  │  ├─ SearchResultsPage.tsx
│  │  └─ UnderDevelopment.tsx
│  ├─ services
│  │  ├─ api.ts
│  │  └─ fetchProducts.ts
│  ├─ types.ts
│  ├─ utils
│  │  ├─ cartPurchase.ts
│  │  ├─ checkoutPricing.ts
│  │  ├─ discounts.ts
│  │  ├─ domSafety.ts
│  │  ├─ metaPixel.ts
│  │  ├─ money.ts
│  │  ├─ pricing.ts
│  │  └─ validation.ts
│  └─ vite-env.d.ts
├─ tailwind.config.js
├─ tests
│  ├─ checkoutPricing.test.cjs
│  └─ discounts.test.cjs
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts

```
