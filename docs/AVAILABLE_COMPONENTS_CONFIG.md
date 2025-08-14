# Configuración de Componentes Disponibles

## Descripción

El archivo `app/config/availableComponents.ts` contiene la configuración centralizada de todos los componentes disponibles para las páginas del dashboard. Esta configuración incluye tanto los componentes front-end como back-office, y permite controlar en qué páginas se muestran cada componente.

## Estructura

### Interface ComponentConfig

```typescript
export interface ComponentConfig {
  id: string;                    // Identificador único del componente
  title: string;                 // Título mostrado en la interfaz
  description: string;           // Descripción del componente
  category: string;              // Categoría para agrupar componentes
  // Componentes dinámicos
  frontComponent?: string;       // Ruta del componente front-end
  backComponent?: string;        // Ruta del componente back-office
  // Flags de visibilidad por página
  showInHome: boolean;          // Si se muestra en la página Home
  showInAbout: boolean;         // Si se muestra en la página About
  // Configuración adicional
  props?: Record<string, any>;  // Props específicas para el componente
}
```

### Array availableComponents

Contiene todos los componentes disponibles organizados por categorías:

- **Contenido**: Heroes, materiales, servicios, galerías, etc.
- **Banners**: Banners principales, parallax
- **Marcas**: Logos carrusel, fijos, dinámicos
- **Social**: Testimonios, feed de Instagram
- **Categorías Colecciones**: Categorías y colecciones
- **Ubicación**: Componentes de ubicación

## Uso

### Importación

```typescript
import { 
  availableComponents, 
  ComponentConfig,
  getComponentsForPage,
  getFrontComponents,
  getBackComponents 
} from "@/app/config/availableComponents";
```

### Hook para componentes dinámicos

```typescript
import { useDynamicComponents } from "@/hooks/useDynamicComponents";

// En un componente
const { renderComponent, getComponentProps, availableComponentIds } = useDynamicComponents({
  page: 'home',  // 'home' | 'about'
  type: 'front'  // 'front' | 'back'
});
```

### Ejemplos de uso

#### 1. Obtener componentes para una página específica

```typescript
// Obtener solo componentes que se muestran en Home
const homeComponents = getComponentsForPage('home');

// Obtener solo componentes que se muestran en About
const aboutComponents = getComponentsForPage('about');
```

#### 2. Filtrar por categoría

```typescript
// Obtener solo componentes de banners
const bannerComponents = availableComponents.filter(
  comp => comp.category === "Banners"
);

// Obtener solo componentes de contenido
const contentComponents = availableComponents.filter(
  comp => comp.category === "Contenido"
);
```

#### 3. Buscar un componente específico

```typescript
// Encontrar un componente por ID
const heroComponent = availableComponents.find(
  comp => comp.id === "hero01"
);

// Verificar si existe un componente
const hasHero = availableComponents.some(
  comp => comp.id === "hero01"
);
```

#### 4. Renderizar componentes dinámicamente

```typescript
// Usando el hook
const { renderComponent, getComponentProps } = useDynamicComponents({
  page: 'home',
  type: 'front'
});

// Renderizar un componente
const component = renderComponent('hero01', getComponentProps('hero01'));
```

#### 5. Configuración por defecto

```typescript
// Configuración por defecto con los primeros 10 componentes
const defaultConfig = {
  visibleComponents: availableComponents.slice(0, 10).map(comp => comp.id),
  order: availableComponents.slice(0, 10).map(comp => comp.id),
};
```

## Archivos que usan esta configuración

- `app/dashboard/contenido-home/page.tsx`
- `app/dashboard/about-us/page.tsx`
- `app/components/ClientHomeComponents.tsx`
- `app/components/HomeConfigManager.tsx`
- `app/components/AboutConfigManager.tsx`

## Agregar nuevos componentes

Para agregar un nuevo componente:

1. Agregar la entrada al array `availableComponents` en `app/config/availableComponents.ts`
2. Asegurarse de que el `id` sea único
3. Asignar la categoría apropiada
4. Configurar las rutas de los componentes front-end y back-office
5. Establecer los flags de visibilidad (`showInHome`, `showInAbout`)
6. Proporcionar título y descripción descriptivos
7. Agregar props específicas si es necesario

### Ejemplo de nuevo componente

```typescript
{
  id: "nuevoComponente",
  title: "Nuevo Componente",
  description: "Descripción del nuevo componente",
  category: "Contenido",
  frontComponent: "@/components/PIXELUP/NuevoComponente/NuevoComponente",
  backComponent: "@/components/PIXELUP/NuevoComponente/NuevoComponenteBO",
  showInHome: true,
  showInAbout: false,
  props: { 
    customProp: "valor" 
  },
},
```

## Funciones de utilidad

### getComponentsForPage(page)
Filtra los componentes que se muestran en una página específica.

```typescript
const homeComponents = getComponentsForPage('home');
const aboutComponents = getComponentsForPage('about');
```

### getFrontComponents()
Obtiene todos los componentes que tienen componente front-end.

### getBackComponents()
Obtiene todos los componentes que tienen componente back-office.

## Hook useDynamicComponents

El hook `useDynamicComponents` proporciona una forma fácil de cargar y renderizar componentes dinámicamente:

```typescript
const { 
  components,           // Mapa de componentes cargados
  renderComponent,      // Función para renderizar un componente
  getComponentProps,    // Función para obtener props de un componente
  availableComponentIds // Array de IDs disponibles
} = useDynamicComponents({
  page: 'home',  // 'home' | 'about'
  type: 'front'  // 'front' | 'back'
});
```

## Ventajas

- **Centralización**: Una sola fuente de verdad para todos los componentes
- **Reutilización**: No hay duplicación de código
- **Mantenimiento**: Cambios en un solo lugar se reflejan en todos los archivos
- **Consistencia**: Todos los archivos usan la misma configuración
- **Escalabilidad**: Fácil agregar nuevos componentes
- **Control de visibilidad**: Control granular sobre qué componentes se muestran en cada página
- **Carga dinámica**: Los componentes se cargan dinámicamente según sea necesario
- **Props automáticas**: Las props específicas se aplican automáticamente

## Notas importantes

- Siempre usar la importación desde `@/app/config/availableComponents`
- No definir `availableComponents` localmente en otros archivos
- Mantener la estructura de la interface `ComponentConfig`
- Usar categorías consistentes para agrupar componentes similares
- Configurar correctamente los flags de visibilidad
- Asegurarse de que las rutas de los componentes sean correctas
- Usar el hook `useDynamicComponents` para renderizar componentes dinámicamente 