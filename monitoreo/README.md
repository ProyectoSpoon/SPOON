# 📊 Sistema de Monitoreo SPOON

Sistema completo de monitoreo y observabilidad para el flujo de menú del restaurante en SPOON, utilizando **Prometheus** y **Grafana**.

## 🎯 ¿Qué Monitorea?

### 📋 Flujo de Menú del Restaurante:
- ✅ **Carga de categorías y productos** - Tiempo de respuesta y errores
- ✅ **Creación y publicación de menús** - Performance y éxito de operaciones
- ✅ **Gestión de combinaciones** - Creación y validación
- ✅ **Operaciones de cache** - Hit/miss rates, tamaños, tiempos
- ✅ **Errores del sistema** - Detección y clasificación automática
- ✅ **Métricas de negocio** - Productos activos, restaurantes, engagement

### 🔧 Métricas Técnicas:
- ⏱️ **Tiempos de respuesta** de APIs y componentes
- 💾 **Eficiencia del cache** y localStorage
- 🚨 **Detección de errores** en tiempo real
- 📈 **Throughput** y carga del sistema
- 🗄️ **Performance de base de datos**

## 🚀 Instalación Rápida

### Opción 1: Script Automático (Recomendado)
```bash
cd SPOON
monitoreo\scripts\instalar-monitoreo.bat
```

### Opción 2: Instalación Manual
```bash
# 1. Instalar dependencias
npm install prom-client

# 2. Copiar configuraciones
copy monitoreo\alertas\prometheus-config.yml prometheus\prometheus.yml
copy monitoreo\alertas\reglas-menu.yml prometheus\alert.rules

# 3. Configurar Grafana
mkdir grafana\provisioning\dashboards\spoon
copy monitoreo\dashboards\*.json grafana\provisioning\dashboards\spoon\
```

## 📈 Dashboards Disponibles

### 1. 🍽️ **Flujo de Menú del Restaurante**
**Archivo:** `dashboards/flujo-menu.json`

**Métricas incluidas:**
- 📊 Resumen de operaciones de menú
- ⏱️ Tiempo de carga de categorías
- 📦 Productos en menú activo
- 💾 Hit rate del cache
- 🚨 Errores en tiempo real
- 📈 Gráficos de tendencias
- 🏪 Distribución por categorías

**Vista previa:**
```
┌─────────────────┬─────────────────┬─────────────────┐
│ Operaciones/min │ Tiempo Carga    │ Productos Activos│
│      127        │     0.8s ✅     │       89        │
└─────────────────┴─────────────────┴─────────────────┘
│ 📈 Gráfico: Operaciones por tiempo                 │
│ ⏱️ Gráfico: Distribución de tiempos de carga       │
│ 🏪 Gráfico: Productos por categoría (pie chart)    │
```

### 2. 🔧 **Performance y Errores** (Próximamente)
- Métricas de APIs
- Errores HTTP detallados
- Performance de base de datos

### 3. 💼 **Métricas de Negocio** (Próximamente)
- KPIs ejecutivos
- Engagement de restaurantes
- Análisis de uso

## 🔧 Uso en el Código

### Instrumentación Automática con Decoradores

```typescript
import { instrumentarOperacionMenu } from '../monitoreo/middleware/instrumentacion';

class MenuService {
  @instrumentarOperacionMenu({
    componente: 'api',
    operacion: 'cargar_categorias',
    categoria: 'datos'
  })
  async cargarCategorias() {
    // Tu código aquí - se instrumenta automáticamente
    return await fetch('/api/categorias');
  }
}
```

### Medición Manual de Tiempo

```typescript
import { medirTiempo } from '../monitoreo/middleware/instrumentacion';

const saveToCache = useCallback(() => {
  const medicion = medirTiempo('cache', 'guardar_menu');
  
  try {
    // Tu código de cache
    localStorage.setItem('menu', JSON.stringify(data));
    medicion.registrarExito();
  } catch (error) {
    medicion.registrarError(error);
    throw error;
  } finally {
    medicion.finalizar();
  }
}, []);
```

### Métricas Específicas

```typescript
import { 
  registrarOperacionMenu,
  actualizarProductosMenu,
  registrarOperacionCache 
} from '../monitoreo/metricas';

// Registrar operación de menú
registrarOperacionMenu('publicar_menu', 'restaurante_123', 'exitoso', 'platos');

// Actualizar contador de productos
actualizarProductosMenu('restaurante_123', 'platos_principales', 15);

// Registrar operación de cache
registrarOperacionCache('hit', 'exitoso', 'menu', 'categorias');
```

## 🚨 Alertas Configuradas

### Alertas de Performance
- ⚠️ **Carga lenta de categorías** (>3s)
- ⚠️ **Publicación lenta de menú** (>10s)
- ⚠️ **Hit rate bajo del cache** (<70%)
- ⚠️ **APIs lentas** (>5s)

### Alertas de Errores
- 🚨 **Errores altos en menú** (>0.1/s)
- 🚨 **Errores HTTP altos** (>0.1/s)
- ⚠️ **Errores de cache** (>0.05/s)

### Alertas de Negocio
- ℹ️ **Menú sin productos** (>5min)
- ℹ️ **Restaurante inactivo** (>24h)
- ℹ️ **Sin combinaciones recientes** (>2h)

## 📍 URLs de Acceso

### Desarrollo Local
- **Grafana:** http://localhost:3005 (admin/admin)
- **Prometheus:** http://localhost:9090
- **Métricas:** http://localhost:3000/api/metrics

### Producción
- **Grafana:** https://grafana.spoon.com
- **Prometheus:** https://prometheus.spoon.com
- **Métricas:** https://api.spoon.com/metrics

## 🔧 Configuración

### Prometheus
**Archivo:** `alertas/prometheus-config.yml`
- Scrape interval: 15s
- Targets: localhost:3000, localhost:3009
- Retention: 15 días

### Grafana
**Carpeta:** `dashboards/`
- Auto-provisioning habilitado
- Datasource: Prometheus
- Refresh: 30s

### Alertas
**Archivo:** `alertas/reglas-menu.yml`
- 15 reglas configuradas
- Severidades: info, warning, critical
- Runbooks incluidos

## 📚 Estructura de Archivos

```
monitoreo/
├── metricas/                    # Definición de métricas
│   ├── menu-metricas.ts        # Métricas del menú
│   ├── cache-metricas.ts       # Métricas del cache
│   ├── api-metricas.ts         # Métricas de APIs
│   └── index.ts                # Exportaciones
├── middleware/                  # Instrumentación
│   └── instrumentacion.ts      # Decoradores y helpers
├── dashboards/                  # Dashboards de Grafana
│   └── flujo-menu.json         # Dashboard principal
├── alertas/                     # Configuración de alertas
│   ├── prometheus-config.yml   # Config de Prometheus
│   └── reglas-menu.yml         # Reglas de alertas
├── scripts/                     # Scripts de instalación
│   └── instalar-monitoreo.bat  # Instalación automática
└── README.md                    # Esta documentación
```

## 🎯 Próximos Pasos

### Fase 1: Instrumentación Básica ✅
- [x] Métricas de menú
- [x] Métricas de cache
- [x] Dashboard principal
- [x] Alertas básicas

### Fase 2: Instrumentación Avanzada
- [ ] Instrumentar useMenuCache.ts
- [ ] Instrumentar APIs de menú
- [ ] Métricas de base de datos
- [ ] Dashboard de performance

### Fase 3: Métricas de Negocio
- [ ] KPIs ejecutivos
- [ ] Métricas por restaurante
- [ ] Análisis de engagement
- [ ] Predicciones

## 🆘 Troubleshooting

### Problema: No aparecen métricas en Grafana
**Solución:**
1. Verificar que Next.js esté ejecutándose en puerto 3000
2. Verificar endpoint: http://localhost:3000/api/metrics
3. Verificar que Prometheus esté scrapeando: http://localhost:9090/targets

### Problema: Alertas no funcionan
**Solución:**
1. Verificar reglas en Prometheus: http://localhost:9090/rules
2. Verificar configuración en `prometheus/prometheus.yml`
3. Reiniciar Prometheus: `docker-compose restart prometheus`

### Problema: Dashboards no cargan
**Solución:**
1. Verificar datasource en Grafana
2. Verificar que los archivos JSON estén en `grafana/provisioning/dashboards/spoon/`
3. Reiniciar Grafana: `docker-compose restart grafana`

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs de Prometheus: `docker logs prometheus`
2. Revisar logs de Grafana: `docker logs grafana`
3. Verificar métricas: `curl http://localhost:3000/api/metrics`

---

**🎉 ¡El monitoreo de SPOON está listo para darte visibilidad completa del flujo de menú!**
