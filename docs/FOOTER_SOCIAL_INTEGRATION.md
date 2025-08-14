# Integración de Redes Sociales en el Footer

## Descripción

La configuración de redes sociales del footer ahora está completamente sincronizada con el componente `RedesSociales` existente, eliminando la duplicación de datos y proporcionando una única fuente de verdad para todas las redes sociales de la tienda.

## Arquitectura

### Componentes principales:

1. **`RedesSociales.tsx`** - Componente principal para gestionar redes sociales
2. **`Footer01BO.tsx`** - Panel de administración del footer que integra RedesSociales
3. **`useFooterConfig.tsx`** - Hook que sincroniza configuración del footer con redes sociales
4. **`DynamicFooter.tsx`** - Renderizador dinámico de footers
5. **`Footer01.tsx`** - Componente frontend que muestra las redes sociales configuradas

## Flujo de datos

```
RedesSociales Component
     ↓ (guarda en)
REDESSOCIALES ContentBlock
     ↓ (lee desde)
useFooterConfig Hook
     ↓ (proporciona a)
Footer Components (Footer01, Footer02, etc.)
```

## Configuración

### Variables de entorno requeridas:

- `NEXT_PUBLIC_REDESSOCIALES_CONTENTBLOCK` - ID del content block para redes sociales (default: "REDESSOCIALES")
- `NEXT_PUBLIC_FOOTER_CONFIG_CONTENTBLOCK` - ID del content block para configuración del footer (default: "footer-config-default")

### Content Blocks utilizados:

1. **REDESSOCIALES** - Almacena la configuración de redes sociales
2. **footer-config-default** - Almacena la configuración general del footer

## Características principales

### 📱 Redes sociales soportadas:

- Instagram
- Facebook
- WhatsApp
- LinkedIn
- TikTok

### 🔄 Sincronización automática:

- Los cambios en el componente RedesSociales se reflejan automáticamente en el footer
- No hay duplicación de configuración
- Una sola fuente de verdad para todas las redes sociales

### 🎨 Personalización:

- Iconos SVG optimizados para cada red social
- Colores personalizables desde la configuración del footer
- Soporte para mostrar/ocultar redes sociales en el footer

## Uso en el Dashboard

### Para configurar redes sociales:

1. Ve a la sección "Footer" en el dashboard
2. En la sección "Configuración de Redes Sociales":
   - Activa/desactiva la visibilidad en el footer
   - Configura cada red social individualmente
   - Los cambios se aplican automáticamente

### Para gestionar redes sociales globalmente:

1. Ve a la sección específica de "Redes Sociales" (si existe)
2. O usa el componente integrado en la configuración del footer

## API y funciones exportadas

### Desde `RedesSociales.tsx`:

```typescript
// Obtener configuración de redes sociales
export const getSocialNetworksConfig = async () => Promise<SocialNetwork[]>;

// Obtener icono para una red social específica
export const getSocialNetworkIcon = (networkName: string) => React.ReactNode;
```

### Desde `useFooterConfig.tsx`:

```typescript
// Hook para obtener configuración completa del footer (incluye redes sociales)
export function useFooterConfig() {
  return {
    config: FooterConfig, // Incluye socialNetworks sincronizadas
    loading: boolean,
    error: string | null,
    refreshConfig: () => void
  }
}
```

## Estructura de datos

### Social Network:

```typescript
interface SocialNetwork {
  name: string; // "Instagram", "Facebook", etc.
  url: string; // URL de la red social
  enabled: boolean; // Si está habilitada
  icon: React.ReactNode; // Icono SVG
}
```

### Footer Config:

```typescript
interface FooterConfig {
  // ... otras configuraciones
  showSocial: boolean; // Mostrar/ocultar sección de RRSS
  socialNetworks?: SocialNetwork[]; // Configuración sincronizada
  // ... resto de configuraciones
}
```

## Migración y compatibilidad

### Cambios realizados:

1. ❌ **Eliminado**: Configuración duplicada de redes sociales en FooterConfig
2. ✅ **Agregado**: Sincronización con el componente RedesSociales existente
3. ✅ **Mejorado**: Hook useFooterConfig ahora incluye redes sociales
4. ✅ **Actualizado**: Script de inicialización sin duplicación

### Retrocompatibilidad:

- El footer mantiene fallbacks a la configuración anterior si no encuentra la nueva
- Los iconos se asignan automáticamente al cargar la configuración
- No se requieren cambios en la base de datos existente

## Troubleshooting

### Problema: Las redes sociales no aparecen en el footer

**Solución:**

1. Verificar que `showSocial: true` en la configuración del footer
2. Verificar que al menos una red social esté habilitada con URL válida
3. Revisar las variables de entorno de los content blocks

### Problema: Los iconos no se muestran correctamente

**Solución:**

1. Verificar que el nombre de la red social coincida con los soportados
2. Los iconos se asignan automáticamente, no es necesario configurarlos manualmente

### Problema: Los cambios no se reflejan

**Solución:**

1. Verificar que el cache se haya revalidado
2. Comprobar que la configuración se guardó correctamente en el content block
3. Refrescar la página del frontend

## Scripts de inicialización

Para inicializar la configuración del footer:

```bash
node scripts/initFooterConfig.js
```

Este script crea la configuración por defecto sin incluir redes sociales duplicadas, ya que se sincronizan automáticamente.

## Ventajas de esta implementación

1. **📊 Una sola fuente de verdad** - Las redes sociales se gestionan desde un solo lugar
2. **🔄 Sincronización automática** - Los cambios se propagan automáticamente
3. **🧹 Código más limpio** - Eliminación de duplicación
4. **⚡ Mejor rendimiento** - Menos llamadas a la API
5. **🛠️ Fácil mantenimiento** - Cambios centralizados
6. **🔌 Reutilizable** - El componente RedesSociales puede usarse en otros lugares
