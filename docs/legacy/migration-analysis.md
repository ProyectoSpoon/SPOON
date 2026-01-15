# Análisis de Migración - SPOON Database v2.0
## De Estructura Actual a Nueva Arquitectura con Esquemas

### Resumen de Cambios

Esta migración transformará completamente la estructura de la base de datos de SPOON de una arquitectura simple con IDs seriales a una arquitectura moderna con esquemas organizacionales y UUIDs.

---

## 📊 Estructura Actual vs Nueva

### **ESTRUCTURA ACTUAL** (Tablas existentes)
```sql
-- Tablas con IDs SERIAL y sin esquemas
restaurantes (id VARCHAR(50) PRIMARY KEY DEFAULT 'default')
categorias (id UUID, tipo VARCHAR(20))
productos (id UUID, categoria_id UUID, subcategoria_id UUID)
precio_historial (id UUID, producto_id UUID)
producto_versiones (id UUID, producto_id UUID)
stock_actualizaciones (id UUID, producto_id UUID)
menus (id UUID, restaurante_id VARCHAR(50))
menu_productos (id UUID, menu_id UUID, producto_id UUID)
combinaciones (id UUID, restaurante_id VARCHAR(50))
combinacion_productos (id UUID, combinacion_id UUID, producto_id UUID)
```

### **NUEVA ESTRUCTURA** (Con esquemas y UUIDs)
```sql
-- 6 Esquemas organizacionales
auth.users (id UUID)
auth.user_sessions (id UUID)
auth.permissions (id UUID)
auth.role_permissions (id UUID)

restaurant.restaurants (id UUID)
restaurant.restaurant_users (id UUID)
restaurant.business_hours (id UUID)
restaurant.special_hours (id UUID)

menu.categories (id UUID)
menu.products (id UUID)
menu.product_versions (id UUID)
menu.product_price_history (id UUID)
menu.product_stock (id UUID)
menu.stock_movements (id UUID)
menu.daily_menus (id UUID)
menu.menu_combinations (id UUID)
menu.combination_sides (id UUID)

sales.orders (id UUID)
sales.order_items (id UUID)
sales.daily_sales_summary (id UUID)

audit.activity_logs (id UUID)
audit.menu_publication_logs (id UUID)

config.system_settings (id UUID)
```

---

## ⚠️ Impacto de la Migración

### **DATOS QUE SE PERDERÁN**
1. **Todos los datos actuales** en las tablas existentes
2. **Relaciones existentes** entre productos y categorías
3. **Historial de precios** actual
4. **Combinaciones** configuradas
5. **Menús** creados

### **DATOS QUE SE CONSERVARÁN/MIGRARÁN**
1. **Estructura conceptual** - Las mismas entidades pero mejor organizadas
2. **Datos de ejemplo** - Se crearán nuevos datos de demostración
3. **Configuraciones básicas** - Categorías estándar se recrearán

### **NUEVAS CAPACIDADES**
1. **Sistema de autenticación completo** con roles y permisos
2. **Gestión multi-restaurante** con usuarios por restaurante
3. **Auditoría automática** de todos los cambios
4. **Sistema de ventas completo** con órdenes y pagos
5. **Inventario en tiempo real** con movimientos de stock
6. **Configuraciones flexibles** por restaurante
7. **Horarios de negocio** y horarios especiales
8. **Vistas optimizadas** para reporting

---

## 🔄 Plan de Migración Segura

### **Fase 1: Backup y Preparación**
```sql
-- 1. Crear backup completo de la base actual
pg_dump -h localhost -U postgres -d spoon_db > backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql

-- 2. Exportar datos críticos para migración manual si es necesario
COPY (SELECT * FROM productos) TO '/tmp/productos_backup.csv' WITH CSV HEADER;
COPY (SELECT * FROM categorias) TO '/tmp/categorias_backup.csv' WITH CSV HEADER;
COPY (SELECT * FROM combinaciones) TO '/tmp/combinaciones_backup.csv' WITH CSV HEADER;
```

### **Fase 2: Migración de Estructura**
```sql
-- 1. Eliminar tablas actuales (DESTRUCTIVO)
DROP TABLE IF EXISTS combinacion_productos CASCADE;
DROP TABLE IF EXISTS combinaciones CASCADE;
DROP TABLE IF EXISTS menu_productos CASCADE;
DROP TABLE IF EXISTS menus CASCADE;
DROP TABLE IF EXISTS stock_actualizaciones CASCADE;
DROP TABLE IF EXISTS producto_versiones CASCADE;
DROP TABLE IF EXISTS precio_historial CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS restaurantes CASCADE;

-- 2. Ejecutar script de nueva estructura
\i scripts/create-complete-database-structure.sql
```

### **Fase 3: Migración de Datos (Opcional)**
```sql
-- Script personalizado para migrar datos específicos si es necesario
-- (Se desarrollaría según los datos que se quieran conservar)
```

---

## 📋 Checklist Pre-Migración

### **Verificaciones Necesarias**
- [ ] **Backup completo** de la base de datos actual
- [ ] **Documentar datos críticos** que se deben conservar
- [ ] **Verificar conexiones activas** a la base de datos
- [ ] **Notificar a usuarios** sobre el mantenimiento
- [ ] **Preparar datos de prueba** para validación post-migración

### **Archivos que se Actualizarán**
- [ ] `src/config/database.ts` - Configuración de conexión
- [ ] `src/lib/database.ts` - Funciones de base de datos
- [ ] `src/app/api/*/route.ts` - Endpoints de API
- [ ] `src/types/` - Tipos TypeScript
- [ ] `docker-compose.yml` - Variables de entorno
- [ ] `.env` - Configuración de desarrollo

---

## 🔧 Cambios en Configuración de APIs

### **Cambios en Conexión de Base de Datos**

#### **ANTES:**
```typescript
// src/config/database.ts
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'spoon_admin',
  database: process.env.POSTGRES_DATABASE || 'spoon',
  // ...
});

// Consultas directas a tablas
const result = await query('SELECT * FROM productos WHERE categoria_id = $1', [categoryId]);
```

#### **DESPUÉS:**
```typescript
// src/config/database.ts
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  database: process.env.DB_NAME || 'spoon_db',
  // ...
});

// Consultas con esquemas
const result = await query('SELECT * FROM menu.products WHERE category_id = $1', [categoryId]);
```

### **Cambios en APIs**

#### **API de Productos - ANTES:**
```typescript
// src/app/api/productos/route.ts
export async function GET() {
  const result = await query(`
    SELECT p.*, c.nombre as categoria_nombre 
    FROM productos p 
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.estado = 'active'
  `);
  return NextResponse.json(result.rows);
}
```

#### **API de Productos - DESPUÉS:**
```typescript
// src/app/api/productos/route.ts
export async function GET() {
  const result = await query(`
    SELECT p.*, c.name as category_name 
    FROM menu.products p 
    LEFT JOIN menu.categories c ON p.category_id = c.id
    WHERE p.status = 'active' AND p.restaurant_id = $1
  `, [restaurantId]);
  return NextResponse.json(result.rows);
}
```

### **Cambios en Tipos TypeScript**

#### **ANTES:**
```typescript
interface Producto {
  id: string;
  nombre: string;
  precio_actual: number;
  categoria_id: string;
  estado: 'active' | 'inactive' | 'draft';
}
```

#### **DESPUÉS:**
```typescript
interface Product {
  id: string; // UUID
  restaurant_id: string; // UUID
  category_id: string; // UUID
  name: string;
  current_price: number;
  status: 'active' | 'inactive' | 'draft' | 'archived' | 'discontinued' | 'out_of_stock';
  created_at: string;
  updated_at: string;
}
```

---

## ⏱️ Tiempo Estimado de Migración

### **Downtime Esperado**
- **Backup:** 2-5 minutos
- **Migración de estructura:** 1-2 minutos
- **Verificación:** 2-3 minutos
- **Actualización de APIs:** 5-10 minutos
- **Testing:** 10-15 minutos

**Total estimado: 20-35 minutos**

---

## 🧪 Plan de Testing Post-Migración

### **Verificaciones Críticas**
1. **Conexión a base de datos** funciona correctamente
2. **APIs básicas** responden (health check)
3. **Autenticación** funciona con usuario admin
4. **Categorías y productos** se muestran correctamente
5. **Creación de nuevos productos** funciona
6. **Sistema de inventario** actualiza stock
7. **Auditoría** registra cambios automáticamente

### **Endpoints a Verificar**
```bash
# Health check
curl http://localhost:3000/api/health

# Categorías
curl http://localhost:3000/api/categorias

# Productos
curl http://localhost:3000/api/productos

# Menú del día
curl http://localhost:3000/api/menu-dia
```

---

## 🚨 Plan de Rollback

### **En caso de problemas:**
1. **Detener aplicación** inmediatamente
2. **Restaurar backup** de base de datos
3. **Revertir cambios** en archivos de configuración
4. **Reiniciar servicios** con configuración anterior
5. **Verificar funcionamiento** de la versión anterior

### **Comando de Rollback:**
```bash
# Restaurar backup
psql -h localhost -U postgres -d spoon_db < backup_pre_migration_YYYYMMDD_HHMMSS.sql

# Revertir archivos (usando git)
git checkout HEAD~1 -- src/config/ src/lib/ src/app/api/
```

---

## ✅ Beneficios Post-Migración

### **Inmediatos**
- ✅ **Estructura organizada** con esquemas
- ✅ **Datos de ejemplo** funcionando
- ✅ **APIs básicas** operativas
- ✅ **Sistema de autenticación** completo

### **A Mediano Plazo**
- 📊 **Reporting avanzado** con vistas optimizadas
- 🔒 **Auditoría completa** de operaciones
- 📱 **APIs optimizadas** para apps móviles
- 🏪 **Soporte multi-restaurante** nativo

### **A Largo Plazo**
- 🚀 **Escalabilidad mejorada** para miles de restaurantes
- 🔧 **Mantenimiento simplificado** con estructura clara
- 📈 **Performance optimizado** con índices especializados
- 🛡️ **Seguridad robusta** con roles y permisos

---

## 🎯 Recomendación

**Proceder con la migración** es altamente recomendado porque:

1. **La estructura actual es limitada** y no escalable
2. **Los datos actuales son principalmente de prueba**
3. **Los beneficios superan ampliamente** el costo de migración
4. **Es el momento ideal** antes de tener datos de producción críticos
5. **La nueva estructura es el futuro** del sistema SPOON

**Momento ideal:** Ahora, durante desarrollo, antes de datos de producción críticos.
