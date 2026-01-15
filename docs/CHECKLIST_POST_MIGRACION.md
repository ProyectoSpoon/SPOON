# Checklist Post-Migración: PostgreSQL → Supabase

## ✅ Completado

### Migración de Código
- [x] 32 endpoints migrados a Supabase SDK
- [x] Autenticación migrada a Supabase Auth
- [x] Eliminadas dependencias de `pg`, `bcryptjs`, `jsonwebtoken`
- [x] Archivo `database.ts` deprecado

### Documentación
- [x] Documento principal de migración creado
- [x] Checklist de verificación creado
- [x] Patrones de migración documentados

---

## 🔄 Pendiente de Configuración

### 1. Supabase Dashboard
- [ ] Configurar Google OAuth Provider
  - [ ] Ir a Authentication → Providers → Google
  - [ ] Agregar Google Client ID
  - [ ] Agregar Google Client Secret
  - [ ] Configurar Redirect URLs
  - [ ] Habilitar provider

### 2. Row Level Security (RLS)
- [ ] Habilitar RLS en tabla `public.restaurants`
  ```sql
  ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
  ```
- [ ] Crear política de acceso para restaurantes
  ```sql
  CREATE POLICY "Users can view their own restaurants"
  ON public.restaurants FOR SELECT
  USING (auth.uid() = owner_id);
  ```
- [ ] RLS para `restaurant.menu_items`
- [ ] RLS para `restaurant.business_hours`
- [ ] RLS para otras tablas sensibles

### 3. Esquemas Expuestos en API
- [ ] Verificar en Dashboard → Settings → API
- [ ] Asegurar que `public`, `restaurant`, `system` están expuestos
- [ ] `auth` schema debe estar protegido

### 4. Variables de Entorno
- [ ] Verificar `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Verificar `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Verificar `SUPABASE_SERVICE_ROLE_KEY` (solo server-side)
- [ ] Remover/deprecar `JWT_SECRET` si ya no se usa

---

## 🧪 Testing Requerido

### Autenticación
- [ ] Registro de nuevo usuario funciona
- [ ] Login con email/password funciona
- [ ] Google OAuth funciona (después de configurar)
- [ ] Sesiones persisten correctamente
- [ ] Logout funciona

### Onboarding de Restaurantes
- [ ] Crear restaurante nuevo
- [ ] Guardar información general
- [ ] Seleccionar y guardar ubicación (departamento/ciudad)
- [ ] Subir logo
- [ ] Subir imagen de portada
- [ ] Configurar horarios comerciales
- [ ] Validar completitud del onboarding

### Gestión de Menú
- [ ] Listar productos del catálogo
- [ ] Filtrar por categoría
- [ ] Agregar producto al menú del restaurante
- [ ] Ver ingredientes disponibles
- [ ] Crear nueva categoría

### APIs Legacy
- [ ] Endpoints de configuración funcionan
- [ ] Health check responde correctamente

---

## 🔍 Verificaciones de Seguridad

### Endpoints Protegidos
Verificar que estos endpoints requieren autenticación:
- [ ] `/api/restaurants/*` - Requiere sesión
- [ ] `/api/configuracion/*` - Requiere sesión
- [ ] `/api/menu-dia/*` - Requiere sesión

### Datos Sensibles
- [ ] Passwords no se envían en responses
- [ ] JWT tokens no se loguean
- [ ] Datos de usuario protegidos por RLS

---

## 📊 Métricas y Monitoreo

### Supabase Dashboard
- [ ] Revisar "Database" → "Table Editor" para verificar datos
- [ ] Revisar "Authentication" → "Users" para usuarios registrados
- [ ] Monitorear "Logs" para errores

### Errores Comunes Post-Migración
- [ ] Verificar console del navegador
- [ ] Revisar logs del servidor Next.js
- [ ] Buscar errores 401 (auth)
- [ ] Buscar errores 500 (server)
- [ ] Buscar errores relacionados con `pool.query` (debería haber 0)

---

## 🚨 Problemas Conocidos y Soluciones

### "Pool is not defined"
**Causa:** Archivo todavía importando `@/lib/database`  
**Solución:** Revisar imports y migrar a Supabase SDK

### "Session is null"
**Causa:** Usuario no autenticado o sesión expirada  
**Solución:** 
1. Verificar que el login funciona
2. Verificar cookies en el navegador
3. Revisar configuración de Supabase Auth

### "Schema 'restaurant' does not exist"
**Causa:** Schema no expuesto en Supabase API  
**Solución:** Dashboard → Settings → API → Exposed schemas

### Google OAuth no funciona
**Causa:** Provider no configurado  
**Solución:** Seguir pasos en sección "Supabase Dashboard" arriba

---

## 📈 Optimizaciones Recomendadas

### Queries
- [ ] Implementar pagination en listados largos
- [ ] Usar `.select()` con campos específicos (no `*`)
- [ ] Implementar caching donde sea apropiado

### Performance
- [ ] Habilitar Database Indexes en campos frecuentemente consultados
- [ ] Implementar Image Optimization para logos/portadas
- [ ] Considerar CDN para assets estáticos

### Experiencia de Usuario
- [ ] Implementar loading states durante queries
- [ ] Agregar error boundaries
- [ ] Implementar retry logic para requests fallidos

---

## 🔄 Proximas Mejoras

### Corto Plazo (1-2 semanas)
1. Implementar analytics con lógica de negocio real
2. Migrar cron jobs a Supabase Edge Functions
3. Completar testing end-to-end
4. Documentar API completa

### Mediano Plazo (1 mes)
1. Implementar RLS completo
2. Agregar real-time subscriptions donde sea útil
3. Implementar sistema de notifications
4. Mejorar manejo de errores

### Largo Plazo (3 meses)
1. Implementar multi-tenancy robusto
2. Sistema de audit logs completo
3. Backup y recovery automatizado
4. Monitoreo y alertas avanzadas

---

## ✅ Sign-off

**Migración completada por:** Antigravity AI  
**Fecha:** 2026-01-13  
**Archivos migrados:** 32/32 (100%)  
**Status:** ✅ Completado - Listo para testing

**Aprobado por:** _____________  
**Fecha de aprobación:** _____________

**Notas adicionales:**
_________________________________________________
_________________________________________________
_________________________________________________
