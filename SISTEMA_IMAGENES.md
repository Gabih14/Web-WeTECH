# Sistema de Múltiples Imágenes por Producto

## Especificaciones Técnicas de Imágenes

### Resoluciones Recomendadas (Imágenes Cuadradas):

#### **ÓPTIMA: 400x400px**
- **Formato**: PNG o WebP
- **Peso máximo**: 80-120KB
- **Uso**: Ideal para la mayoría de productos
- **Ventajas**: Buena calidad, carga rápida, se ve bien en retina

#### **PREMIUM: 600x600px** 
- **Formato**: PNG o WebP
- **Peso máximo**: 150-200KB
- **Uso**: Productos donde el detalle es crucial (filamentos, impresoras)
- **Ventajas**: Excelente calidad para zoom y detalles

#### **BÁSICA: 300x300px**
- **Formato**: WebP o JPEG
- **Peso máximo**: 40-60KB
- **Uso**: Carga rápida en conexiones lentas
- **Ventajas**: Carga ultra rápida

### Optimización Visual en la Web:

- **Aspect Ratio**: 1:1 (cuadrado perfecto)
- **Object-fit**: cover (para mantener proporción)
- **Hover Effect**: Zoom suave al pasar el mouse
- **Grid Responsivo**: 
  - Móvil: 2 columnas
  - Tablet: 3 columnas  
  - Desktop: 4 columnas

## Estructura de Imágenes

### Ubicación de archivos:
- **Filamentos**: `/public/assets/filamentos/`
- **Otros productos**: `/public/assets/productos/`

### Convención de nombres:

#### Para FILAMENTOS (basado en familia + color):
```
{FAMILIA} {COLOR}.png             // UNA imagen por color (sin adicionales)
```

**NOTAS IMPORTANTES:**
- **Solo UNA imagen por color** para filamentos
- **No necesitas** imágenes adicionales `_1.png`, `_2.png`, etc.
- **No hay galería** de imágenes en ProductPage para filamentos
- **Cambio automático** de imagen al seleccionar color

#### Para otros productos (basado en ID):
```
{product_id}.png          // Imagen principal
{product_id}_1.png        // Imagen adicional 1  
{product_id}_2.png        // Imagen adicional 2
{product_id}_3.png        // Imagen adicional 3
```

### Ejemplos basados en tus archivos actuales:

**Filamentos 3N3 EPET:**
```
/public/assets/filamentos/3N3 EPET.png              // Principal
/public/assets/filamentos/3N3 EPET AZUL.png         // Color azul
/public/assets/filamentos/3N3 EPET BLANCO.png       // Color blanco
/public/assets/filamentos/3N3 EPET NEGRO.png        // Color negro
/public/assets/filamentos/3N3 EPET ROJO CARMIN.png  // Color rojo carmín
```

**Filamentos 3N3 PETG:**
```
/public/assets/filamentos/3N3 PETG.png              // Principal
/public/assets/filamentos/3N3 PETG AZUL.png         // Color azul
/public/assets/filamentos/3N3 PETG BRONCE.png       // Color bronce
/public/assets/filamentos/3N3 PETG GRIS ESPACIAL.png // Color gris espacial
```

## Comportamiento en la aplicación:

### ProductsPage:
- Muestra **solo la imagen principal** (`product.image`)
- Para filamentos: Es la primera imagen del primer color disponible
- Para otros productos: Es la primera imagen del array `product.images[0]`

### ProductPage:

#### **Para FILAMENTOS:**
- **NO hay galería de imágenes** (solo una imagen visible)
- **Sin color seleccionado**: Muestra la imagen del primer color disponible
- **Con color seleccionado**: Cambia automáticamente a la imagen específica de ese color
- **Una sola imagen por color**: No hay imágenes adicionales `_1`, `_2`, etc.

#### **Para OTROS PRODUCTOS:**
- **SÍ hay galería de imágenes** navegable
- **Sin color seleccionado**: Muestra `product.images[]` (imágenes generales)
- **Con color seleccionado**: Muestra `color.images[]` (imágenes específicas del color)
- Incluye thumbnails para navegar entre imágenes
- Fallback a imagen principal si alguna imagen no carga

## Manejo de errores:
- Si una imagen no existe, automáticamente fallback a `product.image`
- El sistema es tolerante a imágenes faltantes
- No rompe la funcionalidad si solo existe la imagen principal

## Implementación técnica:

### En fetchProducts.ts:
```typescript
// Para filamentos - solo una imagen por color
const colorImages = [
  `/assets/filamentos/${familia} ${colorName.toUpperCase()}.png`,
  // NO hay imágenes adicionales _1, _2, etc.
];

// Actualizar imagen principal de filamentos
transformedProducts.forEach(product => {
  if (product.category === "FILAMENTOS" && product.colors && product.colors.length > 0) {
    // Usar la primera imagen del primer color como imagen principal
    const firstColorImage = product.colors[0].images?.[0];
    if (firstColorImage) {
      product.image = firstColorImage;
    }
  }
});
```

### En ProductPage.tsx:
```typescript
// Para filamentos: Solo una imagen, cambia según color
useEffect(() => {
  if (product && selectedColor) {
    const colorData = product.colors?.find((c) => c.name === selectedColor);
    if (colorData && colorData.images) {
      // Para filamentos, solo usar la primera imagen del color (sin galería)
      if (product.category === "FILAMENTOS") {
        setCurrentImages([colorData.images[0]]);
      } else {
        setCurrentImages(colorData.images);
      }
    }
    setCurrentImageIndex(0);
  }
}, [product, selectedColor]);

// Thumbnails solo para productos que NO son filamentos
{currentImages.length > 1 && product.category !== "FILAMENTOS" && (
  <div className="thumbnails">...</div>
)}
```
