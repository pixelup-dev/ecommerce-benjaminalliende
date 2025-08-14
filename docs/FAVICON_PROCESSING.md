# Procesamiento de Favicons Dinámicos

## Descripción

El componente `DynamicFavicon` en `app/layout.tsx` procesa automáticamente el logo del sitio para crear favicons optimizados que se adaptan correctamente al formato cuadrado requerido por los navegadores.

## Problema Resuelto

Cuando se selecciona un logo horizontal (más ancho que alto) en `LogoEdit.tsx`, el favicon tradicional se vería achatado o distorsionado porque los navegadores esperan un espacio cuadrado para mostrar el favicon.

## Solución Implementada

### 1. Procesamiento de Imágenes
- Utiliza el API Canvas de HTML5 para procesar la imagen del logo
- Calcula automáticamente las proporciones para mantener la relación de aspecto
- Centra la imagen en un canvas cuadrado del tamaño apropiado

### 2. Múltiples Tamaños
Genera favicons en los siguientes tamaños estándar:
- 16x16 píxeles (para pestañas de navegador)
- 32x32 píxeles (tamaño estándar)
- 48x48 píxeles (para bookmarks)
- 64x64 píxeles (para alta resolución)
- 128x128 píxeles (para dispositivos móviles)

### 3. Algoritmo de Redimensionamiento

```typescript
const calculateFaviconDimensions = (imgWidth: number, imgHeight: number, canvasSize: number) => {
  const imgAspectRatio = imgWidth / imgHeight;
  
  if (imgAspectRatio > 1) {
    // Imagen horizontal: ajustar altura al canvas, centrar horizontalmente
    drawHeight = canvasSize;
    drawWidth = canvasSize * imgAspectRatio;
    offsetX = (canvasSize - drawWidth) / 2;
    offsetY = 0;
  } else {
    // Imagen vertical o cuadrada: ajustar ancho al canvas, centrar verticalmente
    drawWidth = canvasSize;
    drawHeight = canvasSize / imgAspectRatio;
    offsetX = 0;
    offsetY = (canvasSize - drawHeight) / 2;
  }
}
```

### 4. Características Técnicas

- **Suavizado de imagen**: Aplica `imageSmoothingEnabled` y `imageSmoothingQuality: 'high'` para mejor calidad
- **Formato PNG**: Utiliza PNG para transparencia y mejor calidad
- **Cross-origin**: Maneja imágenes de diferentes dominios con `crossOrigin: 'anonymous'`
- **Fallback**: Si falla el procesamiento, usa la imagen original como respaldo

### 5. Compatibilidad

- Genera múltiples elementos `<link>` para diferentes tamaños
- Mantiene un favicon genérico para compatibilidad con navegadores antiguos
- Funciona con cualquier formato de imagen soportado por el navegador

## Uso

El componente se ejecuta automáticamente cuando:
1. Se carga la página inicialmente
2. Se actualiza el logo desde `LogoEdit.tsx`
3. Cambia el contexto del logo (`useLogo`)

## Beneficios

- ✅ Favicons siempre cuadrados y bien proporcionados
- ✅ Compatibilidad con logos horizontales y verticales
- ✅ Múltiples tamaños para diferentes dispositivos
- ✅ Calidad optimizada con suavizado
- ✅ Fallback robusto en caso de errores
- ✅ Procesamiento automático sin intervención manual

## Ejemplo Visual

**Antes (logo horizontal):**
```
┌─────────────┐
│ ███████████ │ ← Favicon achatado
└─────────────┘
```

**Después (logo horizontal procesado):**
```
┌─────────────┐
│  ████████   │ ← Logo centrado y proporcional
│  ████████   │
└─────────────┘
``` 