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