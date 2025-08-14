# Configuración Dinámica del Home

## Descripción

Este sistema permite gestionar dinámicamente qué componentes se muestran en la página principal del sitio web y en qué orden aparecen, todo desde el panel de administración (Back Office).

## Características

- ✅ **Visibilidad de componentes**: Activar/desactivar componentes individuales
- ✅ **Ordenamiento**: Cambiar el orden de aparición de los componentes
- ✅ **Interfaz intuitiva**: Panel de configuración con checkboxes y botones de ordenamiento
- ✅ **Persistencia**: Los cambios se guardan en la base de datos
- ✅ **Cache**: Sistema de revalidación automática del cache
- ✅ **Fallback**: Configuración por defecto si no hay configuración guardada

## Componentes Disponibles

| ID                  | Nombre         | Descripción                         |
| ------------------- | -------------- | ----------------------------------- |
| `marqueeTOP`        | Marquee        | Barra superior con texto deslizante |
| `bannerPrincipal01` | Banner         | Banner principal de la página       |
| `destacadosCat`     | Destacados Cat | Sección de productos destacados     |
| `testimonios03`     | Testimonios 03 | Testimonios de clientes             |
| `testimonios`       | Testimonios    | Testimonios principales             |
| `testimonios04`     | Testimonios 04 | Testimonios adicionales             |
| `sinFoto04`         | Sin Foto 04    | Sección de contenido sin imagen     |
| `colecciones01`     | Colección 01   | Primera colección de productos      |
| `colecciones02`     | Colección 02   | Segunda colección de productos      |
| `galeria02`         | Galería 02     | Galería de imágenes                 |
| `nosotros01`        | Nosotros 01    | Sección "Sobre nosotros"            |
| `sinFoto06`         | Sin Foto 06    | Contenido sin imagen                |
| `sinFoto07`         | Sin Foto 07    | Contenido sin imagen                |
| `ubicacion02`       | Ubicación 02   | Información de ubicación            |
| `servicios01`       | Servicios 01   | Primera sección de servicios        |
| `servicios02`       | Servicios 02   | Segunda sección de servicios        |
| `servicios03`       | Servicios 03   | Tercera sección de servicios        |
| `servicios04`       | Servicios 04   | Cuarta sección de servicios         |

## Cómo Usar

### 1. Acceder al Panel de Configuración

1. Ve al dashboard de administración
2. Navega a **Contenido > Home**
3. En la parte superior verás el panel "Configuración del Home"

### 2. Gestionar Visibilidad

- **Activar componente**: Marca el checkbox junto al nombre del componente
- **Desactivar componente**: Desmarca el checkbox
- Los cambios se aplican inmediatamente en la vista previa

### 3. Cambiar Orden

Para cada componente activo, puedes:

- **Mover arriba**: Haz clic en el botón ↑
- **Mover abajo**: Haz clic en el botón ↓
- **Ver posición actual**: Se muestra el número de posición

### 4. Guardar Cambios

1. Haz clic en **"Guardar Configuración"**
2. Espera a que aparezca el mensaje de confirmación
3. Los cambios se aplicarán automáticamente en el sitio web

## Estructura Técnica

### Archivos Principales

- `app/dashboard/contenido-home/page.tsx` - Panel de administración
- `app/page.tsx` - Página principal que usa la configuración (Server Component)
- `app/components/DynamicHomeComponents.tsx` - Server Component wrapper
- `app/components/ClientHomeComponents.tsx` - Client Component que renderiza dinámicamente
- `app/components/ClientOnlyWrapper.tsx` - Wrapper para componentes client-only
- `app/utils/homeConfig.ts` - Utilidades de configuración

### Content Block de Configuración

La configuración se almacena en un content block especial con ID: `NEXT_PUBLIC_HOME_CONFIG_CONTENTBLOCK`

Estructura del JSON:

```json
{
  "visibleComponents": ["marqueeTOP", "bannerPrincipal01", ...],
  "order": ["marqueeTOP", "bannerPrincipal01", ...]
}
```

### Variables de Entorno

```bash
NEXT_PUBLIC_HOME_CONFIG_CONTENTBLOCK=home-config-12345-67890-abcdef
```

## Inicialización

Para configurar el sistema por primera vez:

1. Asegúrate de que la variable de entorno `NEXT_PUBLIC_HOME_CONFIG_CONTENTBLOCK` esté configurada
2. Ejecuta el script de inicialización:
   ```bash
   node scripts/initHomeConfig.js
   ```
3. O crea manualmente el content block desde el panel de administración

## Troubleshooting

### Problemas Comunes

1. **Los cambios no se reflejan en el sitio**

   - Verifica que el cache se haya revalidado
   - Revisa la consola del navegador para errores

2. **Componente no aparece**

   - Verifica que el ID del componente esté en el mapeo
   - Revisa que el componente esté importado correctamente

3. **Error al guardar configuración**
   - Verifica que tengas permisos de administrador
   - Revisa la conexión a la base de datos

### Logs Útiles

Los logs importantes aparecen en:

- Consola del navegador (F12)
- Logs del servidor Next.js
- Logs de la API

## Extensibilidad

### Agregar Nuevos Componentes

1. Importa el componente en `DynamicHomeComponents.tsx`
2. Agrégalo al `componentMap`
3. Actualiza la lista de `availableComponents` en el panel de administración
4. Agrega el ID a la configuración por defecto en `homeConfig.ts`

### Ejemplo de Nuevo Componente

```typescript
// En DynamicHomeComponents.tsx
const NuevoComponente = React.lazy(
  () => import("@/components/PIXELUP/NuevoComponente")
);

const componentMap = {
  // ... otros componentes
  nuevoComponente: NuevoComponente,
};
```

## Consideraciones de Rendimiento

- Los componentes se cargan de forma lazy (solo cuando son visibles)
- Se usa Suspense para mostrar fallbacks durante la carga
- La configuración se cachea para mejorar el rendimiento
- Los cambios se revalidan automáticamente
- **Compatibilidad con Server Components**: Los componentes client se renderizan solo en el cliente para evitar conflictos con `metadata`

## Arquitectura Server/Client

### Separación de Responsabilidades

1. **Server Components** (Sin "use client"):

   - `app/page.tsx` - Página principal con `metadata`
   - `app/components/DynamicHomeComponents.tsx` - Wrapper que delega al client

2. **Client Components** (Con "use client"):
   - `app/components/ClientHomeComponents.tsx` - Renderiza componentes dinámicos
   - `app/components/ClientOnlyWrapper.tsx` - Asegura renderización solo en cliente

### Flujo de Renderizado

```
Server Component (page.tsx)
    ↓
Server Component (DynamicHomeComponents.tsx)
    ↓
Client Component (ClientHomeComponents.tsx)
    ↓
Componentes dinámicos con useEffect
```

Esta arquitectura permite:

- ✅ Mantener `metadata` en Server Components
- ✅ Usar `useEffect` en componentes client
- ✅ Evitar errores de hidratación
- ✅ Optimizar el rendimiento con SSR
