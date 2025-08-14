# Sistema de Plantillas de Footer

## Descripción General

El sistema de plantillas de footer permite a los usuarios de **Plan Avanzado** y **Plan Pro** seleccionar entre diferentes diseños de footer, además de configurar todos los aspectos del contenido y estilo.

## Plantillas Disponibles

### 1. Footer01 - Clásico

- **Descripción**: Diseño tradicional con logo, enlaces y redes sociales
- **Características**:
  - Logo centrado en la parte superior
  - Enlaces organizados en columnas
  - Redes sociales en la parte inferior
  - Newsletter opcional
  - Copyright en la parte inferior

### 2. Footer02 - Moderno

- **Descripción**: Diseño moderno con layout más espacioso
- **Características**:
  - Layout más amplio y espacioso
  - Mejor distribución del contenido
  - Diseño más contemporáneo

### 3. Footer03 - Minimalista

- **Descripción**: Diseño limpio y minimalista
- **Características**:
  - Diseño simple y elegante
  - Menos elementos visuales
  - Enfoque en la funcionalidad

### 4. Footer04 - Newsletter

- **Descripción**: Diseño con newsletter integrado
- **Características**:
  - Newsletter prominente
  - Integración con Mailchimp
  - Diseño optimizado para captura de emails

## Configuración por Plan

### Plan Inicia

- ✅ Configuración de colores básicos
- ✅ Redes sociales
- ✅ Mostrar/ocultar logo
- ✅ Mostrar/ocultar colecciones
- ❌ Selección de plantillas
- ❌ Enlaces personalizados
- ❌ Configuración de newsletter

### Plan Avanzado y Pro

- ✅ **Todas las funcionalidades del Plan Inicia**
- ✅ **Selección de plantillas de diseño**
- ✅ Enlaces personalizados
- ✅ Configuración completa de newsletter
- ✅ Personalización de texto y descripciones

## Implementación Técnica

### Componente DynamicFooter

```typescript
// components/PIXELUP/Footer/DynamicFooter.tsx
export default function DynamicFooter() {
  const { config, loading, error } = useFooterConfig();

  // Renderizar según la plantilla seleccionada
  switch (config.selectedTemplate) {
    case "Footer01":
      return <Footer01 />;
    case "Footer02":
      return <Footer02 />;
    case "Footer03":
      return <Footer03 />;
    case "Footer04":
      return <Footer04 />;
    default:
      return <Footer01 />;
  }
}
```

### Configuración en Content Blocks

```typescript
interface FooterConfig {
  selectedTemplate: string; // "Footer01" | "Footer02" | "Footer03" | "Footer04"
  // ... resto de configuración
}
```

### Hook useFooterConfig

El hook maneja la carga y guardado de la configuración del footer, incluyendo la plantilla seleccionada.

## Uso en el Dashboard

### Selección de Plantilla

1. Ir a **Dashboard > Footer**
2. En la sección "Selección de Plantilla" (solo Plan Avanzado/Pro)
3. Hacer clic en la plantilla deseada
4. La vista previa se actualiza automáticamente
5. Guardar la configuración

### Vista Previa

- Cada plantilla muestra una vista previa en tiempo real
- Los cambios se reflejan inmediatamente
- Se mantiene la configuración de contenido y estilo

## Variables de Entorno

```env
NEXT_PUBLIC_FOOTER_CONFIG_CONTENTBLOCK=footer-config-default
```

## Migración de Datos

Para usuarios existentes:

1. Se mantiene la configuración actual
2. Se asigna "Footer01" como plantilla por defecto
3. Se preservan todas las configuraciones existentes

## Consideraciones de Rendimiento

- Las plantillas se cargan dinámicamente para optimizar el rendimiento
- Solo se carga la plantilla seleccionada
- Fallback a Footer01 en caso de error

## Personalización Avanzada

### Agregar Nuevas Plantillas

1. Crear el componente en `components/PIXELUP/Footer/FooterXX/`
2. Agregar la importación en `DynamicFooter.tsx`
3. Agregar el caso en el switch
4. Actualizar la lista de plantillas en `Footer01BO.tsx`

### Configuración Específica por Plantilla

Cada plantilla puede tener configuraciones específicas adicionales que se pueden agregar al `FooterConfig` interface.

## Troubleshooting

### Problemas Comunes

1. **Plantilla no se carga**: Verificar que el componente existe y está exportado correctamente
2. **Configuración no se guarda**: Verificar permisos de content blocks
3. **Vista previa no actualiza**: Verificar que el hook está funcionando correctamente

### Logs de Debug

```typescript
console.log("Footer config:", config);
console.log("Selected template:", config.selectedTemplate);
```
