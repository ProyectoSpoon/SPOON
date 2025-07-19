# 🔍 DIAGNÓSTICO: Dashboard Configuración

## 📊 **Estado Actual**

### **Rutas Identificadas:**
- ✅ `/dashboard/configuracion` - Página principal con pestañas
- ✅ `/dashboard/configuracion/components/InformacionGeneral.tsx` - Componente de información
- ✅ `/api/configuracion/informacion-general` - API del dashboard
- ✅ `/api/restaurants/[id]/general-info` - API del flujo inicial

---

## 🔍 **Problemas Identificados**

### **1. Duplicación de APIs**
**Problema**: Existen dos APIs diferentes para la misma funcionalidad:

| API | Propósito | Lógica de Búsqueda |
|-----|-----------|-------------------|
| `/api/configuracion/informacion-general` | Dashboard | Busca por `owner_id` del usuario |
| `/api/restaurants/[id]/general-info` | Flujo inicial | Busca por `id` específico del restaurante |

**Riesgo**: Datos inconsistentes entre dashboard y flujo inicial.

### **2. Diferencias en Mapeo de Datos**

**API Dashboard** (`/api/configuracion/informacion-general`):
```typescript
const responseData = {
  nombreRestaurante: restaurant.name || '',
  descripcion: restaurant.description || '',
  telefono: restaurant.phone || '',
  email: restaurant.email || '',
  tipoComida: restaurant.cuisine_type || '',  // ✅ Correcto
  direccion: restaurant.address || '',
  ciudad: restaurant.city || '',
  estado: restaurant.state || '',
  pais: restaurant.country || '',
  // ... más campos
};
```

**API Flujo Inicial** (`/api/restaurants/[id]/general-info`):
```typescript
const responseData = {
  nombreRestaurante: restaurant.name || '',
  descripcion: restaurant.description || '',
  telefono: restaurant.phone || '',
  email: restaurant.email || '',
  tipoComida: restaurant.cuisine_type_id || '',  // ⚠️ Diferente campo
  direccion: restaurant.address || '',
  // ... campos similares pero con diferencias
};
```

### **3. Lógica de Autenticación Diferente**

**Dashboard**: Usa JWT para extraer `userId` y buscar restaurante por `owner_id`
**Flujo Inicial**: Usa ID directo del restaurante desde parámetros de URL

---

## ✅ **Soluciones Recomendadas**

### **Opción 1: Unificar APIs (Recomendado)**
- Crear una sola API que maneje ambos casos
- Usar lógica híbrida: si hay `restaurantId` en parámetros, usarlo; si no, extraer del JWT

### **Opción 2: Sincronizar Mapeo**
- Asegurar que ambas APIs usen el mismo mapeo de campos
- Corregir inconsistencias como `cuisine_type` vs `cuisine_type_id`

### **Opción 3: Redireccionar Dashboard**
- Hacer que el dashboard use la misma API del flujo inicial
- Extraer `restaurantId` del JWT y llamar `/api/restaurants/[id]/general-info`

---

## 🧪 **Plan de Pruebas**

### **Paso 1: Verificar Carga de Datos**
1. Ir a `/dashboard/configuracion`
2. Abrir DevTools → Network
3. Verificar llamada a `/api/configuracion/informacion-general`
4. Comprobar si devuelve datos correctos

### **Paso 2: Comparar con Flujo Inicial**
1. Ir a `/config-restaurante/informacion-general`
2. Verificar llamada a `/api/restaurants/[id]/general-info`
3. Comparar datos devueltos

### **Paso 3: Identificar Discrepancias**
- ¿Los nombres coinciden?
- ¿Los teléfonos son iguales?
- ¿El tipo de comida es consistente?

---

## 🛠️ **Implementación Sugerida**

### **Solución Inmediata**: Corregir API del Dashboard

```typescript
// En /api/configuracion/informacion-general/route.ts
// Cambiar la consulta para usar cuisine_type_id consistentemente

const existingRestaurantQuery = `
  SELECT 
    id, name, description, phone, email, cuisine_type_id,  -- ✅ Usar cuisine_type_id
    address, city, state, country, logo_url, cover_image_url,
    status, created_at, updated_at
  FROM restaurant.restaurants 
  WHERE owner_id = $1 AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1
`;

// Y en el mapeo:
const responseData = {
  // ...
  tipoComida: restaurant.cuisine_type_id || '',  // ✅ Consistente
  // ...
};
```

---

## 📋 **Checklist de Validación**

- [ ] Dashboard carga información correctamente
- [ ] Datos coinciden con flujo inicial
- [ ] Campos obligatorios se muestran completos
- [ ] Imágenes (logo/portada) se cargan si existen
- [ ] Formulario permite editar y guardar
- [ ] Mensajes de error son claros
- [ ] Progreso se actualiza correctamente

---

## 🎯 **Resultado Esperado**

Después de las correcciones:
- ✅ Dashboard muestra toda la información del restaurante
- ✅ Datos consistentes entre dashboard y flujo inicial
- ✅ Formulario funcional para editar información
- ✅ Sincronización correcta con base de datos
- ✅ Experiencia de usuario fluida

---

**¡Listo para implementar las correcciones!** 🚀
