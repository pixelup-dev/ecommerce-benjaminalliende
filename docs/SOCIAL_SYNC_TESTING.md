# Guía de Pruebas - Sincronización de Redes Sociales

Esta guía te ayudará a verificar que la sincronización entre redes sociales y el footer funciona correctamente.

## 🧪 Pasos de Prueba

### 1. Preparación

1. Asegúrate de estar en el dashboard (`/dashboard`)
2. Navega a la configuración del Footer
3. Abre la configuración de Redes Sociales en otra pestaña o ventana

### 2. Prueba Básica de Sincronización

#### Paso 1: Activar una red social

1. En el componente **RedesSociales**:
   - Activa el switch de **Instagram**
   - Agrega una URL: `https://instagram.com/tu-perfil`
   - Haz clic en **"Guardar Configuración"**

#### Paso 2: Verificar sincronización inmediata

1. Ve al componente **Footer Configuration**
2. En la **Vista Previa del Footer** deberías ver:
   - ✅ Instagram aparece INMEDIATAMENTE en la sección "Síguenos" (sin guardar)
   - ✅ El enlace funciona correctamente
   - ✅ **SIN necesidad de recargar la página**
   - ✅ **SIN necesidad de guardar primero**

### 3. Prueba de Desactivación

#### Paso 1: Desactivar red social

1. En **RedesSociales**:
   - Desactiva el switch de **Instagram**
   - Guarda los cambios

#### Paso 2: Verificar actualización

1. En la **Vista Previa del Footer**:
   - ✅ Instagram debe desaparecer inmediatamente
   - ✅ Si no hay más redes sociales activas, la sección "Síguenos" debe ocultarse

### 4. Prueba de Múltiples Redes

#### Paso 1: Agregar múltiples redes

1. En **RedesSociales**:
   - Haz clic en **"Agregar más redes sociales"**
   - Agrega **WhatsApp** con URL válida
   - Agrega **Facebook** con URL válida
   - Activa todas las redes
   - Guarda los cambios

#### Paso 2: Verificar en Footer

1. La vista previa debe mostrar:
   - ✅ Instagram, WhatsApp y Facebook
   - ✅ En el orden correcto
   - ✅ Con URLs funcionales

### 5. Prueba de Cambio de Plantilla

#### Paso 1: Cambiar plantilla de footer

1. En **Footer Configuration**:
   - Haz clic en **"Cambiar Plantilla"**
   - Selecciona **Footer02** (Moderno)

#### Paso 2: Verificar consistencia

1. Las redes sociales deben:
   - ✅ Mantenerse visibles en la nueva plantilla
   - ✅ Conservar todas las URLs
   - ✅ Adaptarse al nuevo diseño

### 6. Prueba de Visibilidad de Secciones

#### Paso 1: Desactivar sección social

1. En **Footer Configuration**:
   - En "Secciones Visibles"
   - Desactiva el switch de **"Redes Sociales"**

#### Paso 2: Verificar ocultación

1. La vista previa debe:
   - ✅ Ocultar completamente la sección de redes sociales
   - ✅ Mantener las otras secciones visibles

#### Paso 3: Reactivar sección

1. Reactiva el switch de **"Redes Sociales"**
2. Las redes sociales deben:
   - ✅ Reaparecer inmediatamente
   - ✅ Conservar la configuración anterior

## 🔍 Verificaciones de Estado

### Indicadores Visuales

**En RedesSociales:**

- 🔄 Spinner mientras guarda
- ✅ Mensaje "Configuración guardada correctamente"
- 🟡 Indicador "Cambios pendientes" si hay modificaciones sin guardar

**En Footer Configuration:**

- 🔄 Las redes sociales se cargan automáticamente
- ✅ Vista previa se actualiza en tiempo real
- 📊 Contador de redes sociales activas

### Consola del Navegador

**Sin errores esperados:**

```javascript
// ✅ Mensajes correctos
"Configuración de redes sociales guardada correctamente";
"Redes sociales cargadas desde contexto";

// ❌ Errores a evitar
"Error cargando configuración de redes sociales";
"No hay token de autenticación";
"Failed to fetch social networks";
```

## 🐛 Solución de Problemas

### Problema: Las redes sociales no se sincronizan

**Posibles causas:**

1. **SocialNetworksProvider** no está configurado
2. Errores de red o API
3. Variables de entorno incorrectas

**Solución:**

```bash
# Verificar que el provider está en el layout
grep -r "SocialNetworksProvider" app/dashboard/layout.tsx

# Verificar variables de entorno
echo $NEXT_PUBLIC_REDESSOCIALES_CONTENTBLOCK
```

### Problema: Error de autenticación

**Solución:**

1. Verificar que el token `AdminTokenAuth` existe
2. Refrescar la sesión del dashboard
3. Verificar permisos de API

### Problema: Vista previa no se actualiza

**Solución:**

1. Verificar que `useSocialNetworks` está siendo usado
2. Comprobar errores en la consola
3. Refrescar la página como último recurso

## 🎯 Prueba de Vista Previa en Tiempo Real

### Nueva Funcionalidad: Sin necesidad de guardar para ver cambios

1. **Activar un switch** en RedesSociales:

   - ✅ Se ve inmediatamente en la vista previa del footer
   - ✅ No necesitas hacer clic en "Guardar Configuración"
   - ✅ El indicador "Vista previa en tiempo real" se mantiene verde

2. **Cambiar URL** de una red social:

   - ✅ Se actualiza inmediatamente en la vista previa
   - ✅ Puedes probar diferentes URLs sin guardar

3. **Agregar/Eliminar** redes sociales:

   - ✅ Se reflejan inmediatamente en la vista previa
   - ✅ Solo se persisten cuando guardas

4. **Indicadores visuales**:
   - 🟢 "Vista previa en tiempo real" siempre visible
   - 🟠 "Cambios pendientes" solo cuando hay cambios sin guardar

## ✅ Criterios de Éxito

La sincronización funciona correctamente si:

- [ ] **Vista previa instantánea**: Los cambios se ven inmediatamente (< 100ms)
- [ ] **Tiempo real**: Los cambios se reflejan inmediatamente (< 1 segundo)
- [ ] **Consistencia**: Todas las vistas muestran los mismos datos
- [ ] **Persistencia**: Los cambios se mantienen al recargar la página SOLO después de guardar
- [ ] **Estados**: Los indicadores de carga y éxito funcionan
- [ ] **Errores**: Los errores se muestran claramente al usuario
- [ ] **Plantillas**: Funciona con todos los templates de footer
- [ ] **Planes**: Respeta las restricciones de plan básico/avanzado

## 📈 Pruebas de Rendimiento

### Tiempo de Sincronización

- **Objetivo**: < 500ms desde guardar hasta ver en vista previa
- **Método**: Usar DevTools para medir tiempo de respuesta

### Memoria

- **Objetivo**: Sin memory leaks al cambiar redes sociales
- **Método**: Monitorear uso de memoria en DevTools

### Red

- **Objetivo**: Mínimas llamadas a API
- **Método**: Verificar que solo se hace una llamada al guardar

## 🎯 Casos Límite

1. **Sin redes sociales activas**: La sección debe ocultarse
2. **Todas las redes activas**: Debe mostrar todas correctamente
3. **URLs inválidas**: Debe guardar pero mostrar advertencia
4. **Conexión lenta**: Debe mostrar estado de carga
5. **Error de API**: Debe mostrar mensaje de error claro

Esta guía garantiza que la sincronización funciona como se espera en todos los escenarios posibles.
