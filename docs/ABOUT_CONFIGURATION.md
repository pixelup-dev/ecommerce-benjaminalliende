# Configuración Dinámica de About Us

## Descripción

Este sistema permite gestionar dinámicamente qué componentes se muestran en la página "About Us" (Sobre Nosotros) y en qué orden aparecen, todo desde el panel de administración (Back Office).

## Características

- ✅ **Visibilidad de componentes**: Activar/desactivar componentes individuales
- ✅ **Ordenamiento**: Cambiar el orden de aparición de los componentes
- ✅ **Interfaz intuitiva**: Panel de configuración con drag and drop
- ✅ **Persistencia**: Los cambios se guardan en la base de datos
- ✅ **Cache**: Sistema de revalidación automática del cache
- ✅ **Fallback**: Configuración por defecto si no hay configuración guardada
- ✅ **Restricción por plan**: Solo disponible para Plan Avanzado y Plan Pro

## Componentes Disponibles

| ID                  | Nombre         | Descripción                         | Categoría |
| ------------------- | -------------- | ----------------------------------- | --------- |
| `bannerAbout`       | Banner About   | Banner principal de la página       | Banners   |
| `aboutUs`           | About Us Texto | Contenido principal de la página    | Contenido |

## Cómo Usar

### 1. Acceder al Panel de Configuración

1. Ve al dashboard de administración
2. Navega a **About Us**
3. En la parte inferior verás el panel "Configuración de About Us"

### 2. Gestionar Visibilidad

- **Activar componente**: Haz clic en "Agregar Componentes" y selecciona el componente deseado
- **Desactivar componente**: Haz clic en el botón X (desactivar) en el componente activo
- Los cambios se aplican inmediatamente en la vista previa

### 3. Cambiar Orden

Para cada componente activo, puedes:

- **Arrastrar y soltar**: Usa el handle de arrastre para reordenar
- **Mover arriba**: Haz clic en el botón ↑
- **Mover abajo**: Haz clic en el botón ↓

### 4. Guardar Cambios

1. Haz clic en **"Guardar Cambios"**
2. Espera a que aparezca el mensaje de confirmación
3. Los cambios se aplicarán automáticamente en el sitio web

## Estructura Técnica

### Archivos Principales

- `app/dashboard/about-us/page.tsx` - Panel de administración
- `app/nosotros/page.tsx` - Página pública que usa la configuración
- `app/components/AboutConfigManager.tsx` - Gestor de configuración
- `app/utils/aboutConfig.ts` - Utilidades de configuración

### Content Block de Configuración

La configuración se almacena en un content block especial con ID: `NEXT_PUBLIC_ABOUT_CONFIG_CONTENTBLOCK`

Estructura del JSON:

```json
{
  "visibleComponents": ["bannerAbout", "aboutUs"],
  "order": ["bannerAbout", "aboutUs"]
}
```

### Variables de Entorno

```env
NEXT_PUBLIC_ABOUT_CONFIG_CONTENTBLOCK=about-config-default
```

## Restricciones por Plan

- **Plan Inicia**: Solo puede ver los componentes, no puede modificar la configuración
- **Plan Avanzado**: Puede modificar la configuración completa
- **Plan Pro**: Puede modificar la configuración completa

## Flujo de Datos

1. **Carga inicial**: Se carga la configuración desde el content block
2. **Edición**: El usuario modifica la configuración en el panel
3. **Guardado**: Se guarda la nueva configuración en el content block
4. **Revalidación**: Se revalida el cache de la página `/nosotros`
5. **Aplicación**: Los cambios se reflejan en el sitio web

## Componentes de Vista Previa

El sistema incluye vistas previas de los componentes para ayudar al usuario a entender qué está configurando:

- **Banner About**: Muestra el banner principal
- **About Us Texto**: Muestra el contenido principal

## Manejo de Errores

- Si no hay configuración guardada, se usa la configuración por defecto
- Si hay errores al cargar, se muestra un mensaje de error
- Si hay errores al guardar, se muestra un toast de error

## Cache y Rendimiento

- La configuración se cachea para mejorar el rendimiento
- Se revalida automáticamente cuando se guardan cambios
- Los componentes se cargan dinámicamente para evitar problemas de SSR 