# Configuración del Footer

Este documento describe el sistema de configuración global del footer que permite personalizar el estilo y contenido del footer de manera dinámica.

## Características Principales

### Configuración Visual

- **Colores personalizables**: Fondo, texto y acentos
- **Secciones configurables**: Logo, enlaces, colecciones, redes sociales, newsletter
- **Vista previa en tiempo real**: Muestra los cambios antes de guardar

### Contenido Dinámico

- **Enlaces personalizados**: Configuración de enlaces del footer
- **Redes sociales**: Configuración de redes sociales con URLs
- **Newsletter**: Configuración opcional de suscripción
- **Texto de copyright**: Personalizable

### Gestión de Suscripciones

- **Plan Inicia**: Configuración básica (colores, redes sociales, logo, colecciones)
- **Plan Avanzado**: Configuración completa
- **Plan Pro**: Configuración completa

## Estructura Técnica

### Archivos Principales

- `app/dashboard/footer/page.tsx` - Panel de administración
- `components/PIXELUP/Footer/Footer01/Footer01BO.tsx` - Componente de configuración
- `components/PIXELUP/Footer/Footer01/Footer01.tsx` - Componente de visualización
- `hooks/useFooterConfig.tsx` - Hook para manejar la configuración
- `scripts/initFooterConfig.js` - Script de inicialización

### Content Block de Configuración

La configuración se almacena en un content block especial con ID: `NEXT_PUBLIC_FOOTER_CONFIG_CONTENTBLOCK`

Estructura del JSON:

```json
{
  "title": "Footer",
  "description": "Descripción del footer",
  "copyrightText": "© 2024 Nombre Tienda | Todos los derechos reservados.",

  "showLogo": true,
  "showLinks": true,
  "showCollections": true,
  "showSocial": true,
  "showNewsletter": false,

  "socialNetworks": [
    {
      "name": "Instagram",
      "url": "https://instagram.com/tuempresa",
      "enabled": true,
      "icon": "instagram"
    }
  ],

  "backgroundColor": "#1f2937",
  "textColor": "#ffffff",
  "accentColor": "#f59e0b",

  "newsletterTitle": "Suscríbete a nuestro newsletter",
  "newsletterDescription": "Recibe las últimas novedades y ofertas",
  "newsletterPlaceholder": "Tu email",

  "customLinks": [
    {
      "title": "Política de Privacidad",
      "url": "/politica-privacidad",
      "enabled": true
    }
  ]
}
```

### Variables de Entorno

```env
NEXT_PUBLIC_FOOTER_CONFIG_CONTENTBLOCK=footer-config-default
```

## Diferencias por Plan

### Plan Inicia (Básico)

**Funcionalidades disponibles:**

- ✅ Configuración de colores (fondo, texto, acentos)
- ✅ Redes sociales (habilitar/deshabilitar y configurar URLs)
- ✅ Mostrar/ocultar logo
- ✅ Mostrar/ocultar colecciones
- ✅ Mostrar/ocultar redes sociales
- ❌ Configuración de texto personalizado
- ❌ Enlaces personalizados
- ❌ Newsletter
- ❌ Configuración avanzada de secciones
- ❌ **Selección de plantillas de diseño**

### Plan Avanzado y Pro

**Funcionalidades completas:**

- ✅ Todas las funcionalidades del Plan Inicia
- ✅ Configuración de texto personalizado (título, descripción, copyright)
- ✅ Enlaces personalizados configurables
- ✅ Newsletter completo
- ✅ Control total de todas las secciones
- ✅ Configuración avanzada
- ✅ **Selección de plantillas de diseño**

## Flujo de Datos

1. **Carga inicial**: Se carga la configuración desde el content block
2. **Edición**: El usuario modifica la configuración en el panel (según su plan)
3. **Vista previa**: Se muestra una vista previa en tiempo real
4. **Guardado**: Se guarda la nueva configuración en el content block
5. **Revalidación**: Se revalida el cache de la página principal
6. **Aplicación**: Los cambios se reflejan en el sitio web

## Componentes de Configuración

### Configuración General

- **Título**: Título del footer
- **Descripción**: Descripción que aparece junto al logo
- **Texto de Copyright**: Texto personalizable del copyright

### Secciones Visibles

- **Mostrar Logo**: Controla la visibilidad del logo
- **Mostrar Enlaces**: Controla la visibilidad de los enlaces
- **Mostrar Colecciones**: Controla la visibilidad de las colecciones
- **Mostrar Redes Sociales**: Controla la visibilidad de las redes sociales
- **Mostrar Newsletter**: Controla la visibilidad del newsletter

### Configuración de Colores

- **Color de Fondo**: Color de fondo del footer
- **Color de Texto**: Color del texto principal
- **Color de Acento**: Color para enlaces y elementos destacados

### Redes Sociales

- **Configuración individual**: Cada red social puede habilitarse/deshabilitarse
- **URLs personalizables**: URLs específicas para cada red social
- **Iconos automáticos**: Los iconos se asignan automáticamente según el nombre

### Newsletter

- **Título personalizable**: Título de la sección newsletter
- **Descripción**: Descripción del newsletter
- **Placeholder**: Texto del campo de entrada

### Enlaces Personalizados

- **Enlaces configurables**: Lista de enlaces personalizables
- **Habilitación individual**: Cada enlace puede habilitarse/deshabilitarse
- **URLs personalizables**: URLs específicas para cada enlace

## Inicialización

Para inicializar la configuración del footer por primera vez:

```bash
node scripts/initFooterConfig.js
```

## Manejo de Errores

- Si no hay configuración guardada, se usa la configuración por defecto
- Si hay errores al cargar, se muestra un mensaje de error
- Si hay errores al guardar, se muestra un toast de error

## Cache y Rendimiento

- La configuración se cachea en el cliente para mejor rendimiento
- Se revalida automáticamente cuando se guardan cambios
- Los cambios se aplican inmediatamente en el sitio web

## Compatibilidad

El sistema es compatible con:

- Todos los navegadores modernos
- Dispositivos móviles y de escritorio
- Diferentes tamaños de pantalla
- Modo oscuro/claro (si está configurado)

## Migración

Para migrar desde el sistema anterior de redes sociales:

1. La configuración anterior se mantiene como fallback
2. El nuevo sistema tiene prioridad sobre la configuración anterior
3. Se puede migrar gradualmente sin interrumpir el funcionamiento

## Sistema de Plantillas

### Plantillas Disponibles

El sistema incluye 4 plantillas de diseño diferentes:

1. **Footer01 - Clásico**: Diseño tradicional con logo, enlaces y redes sociales
2. **Footer02 - Moderno**: Diseño moderno con layout más espacioso
3. **Footer03 - Minimalista**: Diseño limpio y minimalista
4. **Footer04 - Newsletter**: Diseño con newsletter integrado

### Selección de Plantilla

- Solo disponible en **Plan Avanzado** y **Plan Pro**
- Se selecciona desde el panel de configuración
- La vista previa se actualiza automáticamente
- Se mantiene toda la configuración de contenido y estilo

### Implementación Técnica

- Componente `DynamicFooter` que renderiza según la plantilla seleccionada
- Carga dinámica de plantillas para optimizar rendimiento
- Fallback a Footer01 en caso de error

Para más detalles, ver: [FOOTER_TEMPLATES.md](./FOOTER_TEMPLATES.md)

## Próximas Mejoras

- Soporte para múltiples idiomas
- Configuración de animaciones
- Integración con analytics
- Plantillas predefinidas
- Exportación/importación de configuraciones
