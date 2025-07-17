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

## 🤝 Contribuciones

¡Las contribuciones están abiertas! Si tenés sugerencias o encontrás bugs, sentite libre de abrir issues o Pull Requests.

---

## 📄 Licencia

Este proyecto se distribuye bajo licencia MIT.


