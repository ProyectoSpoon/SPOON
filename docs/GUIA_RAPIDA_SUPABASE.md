# Guía Rápida: Desarrollo con Supabase SDK

## 🚀 Quick Start

### Configuración Inicial

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// En cualquier API route
const supabase = createRouteHandlerClient({ cookies });
```

---

## 🔐 Autenticación

### Obtener Usuario Actual

```typescript
const { data: { session }, error } = await supabase.auth.getSession();

if (!session) {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
}

const userId = session.user.id;
const userEmail = session.user.email;
```

### Registrar Usuario

```typescript
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    data: {
      first_name: firstName,
      last_name: lastName,
      role: 'restaurant_owner'
    }
  }
});
```

### Login

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password
});
```

---

## 📊 Queries Comunes

### SELECT básico

```typescript
const { data, error } = await supabase
  .schema('public')
  .from('restaurants')
  .select('*');
```

### SELECT con filtros

```typescript
const { data, error } = await supabase
  .schema('public')
  .from('restaurants')
  .select('id, name, email')
  .eq('owner_id', userId)
  .eq('status', 'active')
  .single(); // Para obtener UN solo resultado
```

### SELECT con joins

```typescript
const { data, error } = await supabase
  .schema('restaurant')
  .from('menu_items')
  .select(`
    id,
    is_available,
    product:product_id (
      id,
      name,
      description
    )
  `)
  .eq('restaurant_id', restaurantId);
```

### INSERT

```typescript
const { data, error } = await supabase
  .schema('public')
  .from('restaurants')
  .insert({
    name: 'Mi Restaurante',
    email: 'contact@restaurant.com',
    owner_id: userId,
    created_at: new Date().toISOString()
  })
  .select() // Para obtener el registro insertado
  .single();
```

### UPDATE

```typescript
const { data, error } = await supabase
  .schema('public')
  .from('restaurants')
  .update({
    name: 'Nuevo Nombre',
    updated_at: new Date().toISOString()
  })
  .eq('id', restaurantId)
  .select()
  .single();
```

### DELETE

```typescript
const { error } = await supabase
  .schema('public')
  .from('restaurants')
  .delete()
  .eq('id', restaurantId);
```

---

## 🎯 Patrones Útiles

### Obtener Restaurante del Usuario Autenticado

```typescript
async function getUserRestaurant(supabase: SupabaseClient) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: restaurant } = await supabase
    .schema('public')
    .from('restaurants')
    .select('id, name')
    .eq('owner_id', session.user.id)
    .eq('status', 'active')
    .limit(1)
    .single();

  return restaurant;
}
```

### Manejo de Errores

```typescript
const { data, error } = await supabase
  .from('restaurants')
  .select('*')
  .eq('id', id)
  .single();

if (error) {
  console.error('Database error:', error);
  return NextResponse.json(
    { error: 'No se pudo obtener el restaurante' },
    { status: error.code === 'PGRST116' ? 404 : 500 }
  );
}

if (!data) {
  return NextResponse.json(
    { error: 'Restaurante no encontrado' },
    { status: 404 }
  );
}
```

### Paginación

```typescript
const pageSize = 20;
const page = 1;

const { data, error, count } = await supabase
  .from('products')
  .select('*', { count: 'exact' })
  .range((page - 1) * pageSize, page * pageSize - 1)
  .order('created_at', { ascending: false });
```

### Búsqueda (Search)

```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .ilike('name', `%${searchTerm}%`);
```

---

## 🗂️ Esquemas del Proyecto

### `public`
Tablas principales del sistema:
- `restaurants` - Datos de restaurantes
- `countries`, `departments`, `cities` - Datos geográficos

### `auth`
- `users` - Usuarios del sistema (gestionado por Supabase Auth)

### `restaurant`
Datos específicos de cada restaurante:
- `business_hours` - Horarios comerciales
- `menu_items` - Items del menú
- `menu_pricing` - Precios
- `daily_menus` - Menús diarios
- `special_hours` - Horarios especiales

### `system`
Catálogos globales:
- `products` - Catálogo de productos
- `categories` - Categorías del sistema

---

## ⚠️ Errores Comunes

### Error: "relation does not exist"
**Solución:** Verifica que el schema esté especificado correctamente
```typescript
.schema('public') // o 'restaurant', 'system'
```

### Error: "No rows found"
**Causas comunes:**
1. Usar `.single()` en una query que retorna 0 o múltiples resultados
2. Filtros demasiado restrictivos

**Solución:** Verificar datos o no usar `.single()`

### Error: "JWT expired"
**Solución:** El usuario necesita volver a loguearse

### Error: "Missing schema"
**Solución:** Verificar que el schema esté expuesto en Supabase Dashboard

---

## 💡 Tips

1. **Siempre especificar el schema:** `.schema('public')`
2. **Usar `.single()` solo cuando esperas UN resultado**
3. **Manejar errores explícitamente**
4. **Usar TypeScript para type safety**
5. **Log errors en desarrollo, no en producción**
6. **Validar datos antes de insertar**
7. **Usar transacciones para operaciones críticas (vía RPC)**

---

## 📚 Recursos

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [SQL to Supabase Query Builder](https://supabase.com/docs/reference/javascript/select)

---

**Última actualización:** 2026-01-13
