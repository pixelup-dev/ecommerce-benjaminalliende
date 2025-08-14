# Sistema de Colores y Estilos Dinámicos

## Descripción

Este sistema permite cambiar dinámicamente los colores principales del sitio web y el border-radius a través del panel de administración, similar al sistema de tipografías existente.

## Componentes

### 1. ColorContext (`context/ColorContext.tsx`)
- Proporciona el contexto para manejar los colores y border-radius del sitio
- Gestiona el estado global del color seleccionado y border-radius
- Incluye funciones para obtener valores de colores específicos
- Soporte para colores hexadecimales personalizados
- Conversión automática de hexadecimal a HSL

### 2. Componente Color (`components/Core/Color/Color.tsx`)
- Interfaz de usuario para seleccionar y cambiar colores y border-radius
- Se conecta con content blocks usando `NEXT_PUBLIC_COLORSITIO_CONTENTBLOCK` y `NEXT_PUBLIC_RADIUS_CONTENTBLOCK`
- Muestra vista previa de los colores y border-radius seleccionados
- Validación de colores hexadecimales en tiempo real

### 3. DynamicColorStyles (`components/Core/Color/DynamicColorStyles.tsx`)
- Componente que aplica dinámicamente las variables CSS
- Se ejecuta automáticamente cuando cambia el color o border-radius
- Modifica las variables CSS en tiempo real

## Colores Disponibles

### Colores Predefinidos

| Color | Valor | Color Primario | Color Secundario | Color Acento |
|-------|-------|----------------|------------------|--------------|
| Púrpura | `purple` | `302 24% 56%` | `302 30% 90%` | `264 30% 90%` |
| Azul | `blue` | `210 100% 50%` | `210 30% 90%` | `210 30% 90%` |
| Verde | `green` | `142 76% 36%` | `142 30% 90%` | `142 30% 90%` |
| Rojo | `red` | `0 84% 60%` | `0 30% 90%` | `0 30% 90%` |
| Naranja | `orange` | `25 95% 53%` | `25 30% 90%` | `25 30% 90%` |
| Rosa | `pink` | `330 81% 60%` | `330 30% 90%` | `330 30% 90%` |
| Verde Azulado | `teal` | `180 100% 25%` | `180 30% 90%` | `180 30% 90%` |
| Índigo | `indigo` | `240 100% 50%` | `240 30% 90%` | `240 30% 90%` |

### Colores Hexadecimales Personalizados

El sistema también soporta colores hexadecimales personalizados:
- Formato: `#RRGGBB` o `#RGB`
- Ejemplos: `#FF0000`, `#00FF00`, `#0000FF`, `#F0F`
- Conversión automática a HSL para compatibilidad

## Border Radius Disponibles

| Opción | Valor | Radio | Descripción |
|--------|-------|-------|-------------|
| Cuadrado | `square` | `0rem` | Bordes completamente cuadrados |
| Suave | `soft` | `0.5rem` | Bordes ligeramente redondeados (por defecto) |
| Redondeado | `rounded` | `1rem` | Bordes más redondeados |

## Variables CSS

El sistema utiliza las siguientes variables CSS dinámicas:

```css
:root {
  --dynamic-primary: [valor del color primario];
  --dynamic-secondary: [valor del color secundario];
  --dynamic-accent: [valor del color acento];
  --dynamic-radius: [valor del border radius];
}
```

Estas variables se aplican a:
- `--primary`: Color principal del sitio
- `--secondary`: Color secundario
- `--accent`: Color de acento
- `--ring`: Color del anillo (usado en focus states)
- `--radius`: Border radius global

## Configuración

### Variables de Entorno

Asegúrate de tener configuradas las siguientes variables de entorno:

```env
NEXT_PUBLIC_COLORSITIO_CONTENTBLOCK=tu_content_block_id_color
NEXT_PUBLIC_RADIUS_CONTENTBLOCK=tu_content_block_id_radius
```

### Integración en el Layout

El sistema está integrado en `app/layout.tsx`:

```tsx
import { ColorProvider } from "@/context/ColorContext";
import DynamicColorStyles from "@/components/Core/Color/DynamicColorStyles";

// En el JSX:
<ColorProvider>
  <APIContextProvider SiteId={SiteId}>
    <DynamicFavicon />
    <DynamicColorStyles />
    {/* resto de componentes */}
  </APIContextProvider>
</ColorProvider>
```

## Uso

### En el Dashboard

El componente Color está disponible en `/dashboard/usuarios` y permite:

#### Configuración de Colores:
1. Seleccionar un color predefinido de la lista desplegable
2. O elegir "Color personalizado (Hex)" para usar un color hexadecimal
3. Ingresar el código hexadecimal (ej: #FF0000)
4. Ver una vista previa en tiempo real
5. Aplicar los cambios al sitio

#### Configuración de Border Radius:
1. Seleccionar el tipo de border radius (Cuadrado, Suave, Redondeado)
2. Ver una vista previa con ejemplos visuales
3. Aplicar los cambios al sitio

### En el Código

Para usar el contexto de colores y border-radius en otros componentes:

```tsx
import { useColor } from "@/context/ColorContext";

const MyComponent = () => {
  const { currentColor, getColorValues, currentRadius, radiusOptions } = useColor();
  const colorValues = getColorValues(currentColor);
  const radiusOption = radiusOptions.find(option => option.value === currentRadius);
  
  return (
    <div 
      style={{ 
        backgroundColor: `hsl(${colorValues?.primary})`,
        borderRadius: radiusOption?.radius 
      }}
    >
      Contenido con color y border-radius dinámicos
    </div>
  );
};
```

## Funcionamiento

### Colores:
1. **Inicialización**: Al cargar la aplicación, el ColorContext obtiene la configuración del content block
2. **Selección**: El usuario selecciona un color predefinido o ingresa un hexadecimal
3. **Validación**: Se valida el formato hexadecimal si es necesario
4. **Conversión**: Los colores hexadecimales se convierten automáticamente a HSL
5. **Actualización**: Se actualiza el content block con el nuevo valor
6. **Aplicación**: DynamicColorStyles aplica las nuevas variables CSS
7. **Reflexión**: Los cambios se reflejan inmediatamente en toda la aplicación

### Border Radius:
1. **Inicialización**: Se obtiene la configuración del content block de radius
2. **Selección**: El usuario selecciona el tipo de border radius
3. **Actualización**: Se actualiza el content block correspondiente
4. **Aplicación**: Se aplican las nuevas variables CSS
5. **Reflexión**: Los cambios se reflejan en todos los elementos con border-radius

## Validación

### Colores Hexadecimales:
- Formato válido: `#RRGGBB` o `#RGB`
- Validación en tiempo real
- Mensajes de error claros
- Vista previa del color seleccionado

### Border Radius:
- Solo valores predefinidos permitidos
- Validación automática de valores
- Valores por defecto en caso de error

## Compatibilidad

- Funciona con el sistema de temas claro/oscuro existente
- Compatible con Tailwind CSS
- Mantiene la consistencia con el sistema de tipografías
- Soporta todos los navegadores modernos
- Conversión automática de formatos de color

## Notas Técnicas

- Los colores se almacenan en formato HSL para mejor compatibilidad
- Los colores hexadecimales se convierten automáticamente a HSL
- El sistema incluye validación robusta de valores
- Se mantienen valores por defecto en caso de errores
- Las variables CSS se aplican dinámicamente sin necesidad de recargar la página
- Soporte completo para colores personalizados y border-radius configurable 