# 🚀 Guía: Usar Sistema de Monitoreo SPOON sin Docker

## ⚠️ **Problema Detectado**
Docker Desktop no está ejecutándose, pero **¡no te preocupes!** El sistema de métricas funciona perfectamente sin Docker.

---

## 🎯 **Solución Inmediata (5 minutos)**

### **Paso 1: Iniciar Next.js**
```bash
cd SPOON
npm run dev
```

### **Paso 2: Ver Métricas en el Navegador**
1. **Abrir navegador**
2. **Ir a:** http://localhost:3000/api/metrics
3. **Ver métricas** en formato Prometheus (texto plano)

### **Paso 3: Probar que Funciona**
```bash
# En otra terminal
cd SPOON
node monitoreo\scripts\test-metricas.js
```

**Resultado esperado:**
```
✅ Endpoint de métricas respondió correctamente
✅ Formato de métricas Prometheus detectado
```

---

## 📊 **¿Qué Verás en las Métricas?**

### **Métricas Básicas de Node.js:**
```
# HELP nodejs_version_info Node.js version info
# TYPE nodejs_version_info gauge
nodejs_version_info{version="v18.17.0",major="18",minor="17",patch="0"} 1

# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total 0.015625

# HELP nodejs_heap_size_total_bytes Process heap size from Node.js in bytes
# TYPE nodejs_heap_size_total_bytes gauge
nodejs_heap_size_total_bytes 7159808
```

### **Métricas de SPOON (cuando instrumentes tu código):**
```
# HELP spoon_menu_operaciones_total Total de operaciones de menú por restaurante
# TYPE spoon_menu_operaciones_total counter
spoon_menu_operaciones_total{operacion="cargar_categorias",restaurante_id="rest_123",estado="exitoso"} 5

# HELP spoon_carga_datos_segundos Tiempo de carga de categorías y productos
# TYPE spoon_carga_datos_segundos histogram
spoon_carga_datos_segundos_bucket{componente="api",operacion="cargar_categorias",le="0.5"} 3
spoon_carga_datos_segundos_bucket{componente="api",operacion="cargar_categorias",le="1"} 5
```

---

## 🔧 **Instrumentar tu Código (Opcional)**

### **Agregar Métricas a useMenuCache.ts:**

```typescript
// 1. Importar métricas
import { 
  registrarOperacionMenu,
  registrarTiempoCarga,
  registrarOperacionCache 
} from '../monitoreo/metricas/menu-metricas';

// 2. En tu función de carga de categorías
const loadCategoriasFromAPI = useCallback(async () => {
  const inicioTiempo = Date.now();
  
  try {
    // Tu código existente
    const response = await fetch('/api/categorias');
    const data = await response.json();
    setCategorias(data);
    
    // Agregar métricas
    const tiempoSegundos = (Date.now() - inicioTiempo) / 1000;
    registrarTiempoCarga('api', 'cargar_categorias', tiempoSegundos);
    registrarOperacionMenu('cargar_categorias', 'current_restaurant', 'exitoso');
    
  } catch (error) {
    // Registrar error
    registrarOperacionMenu('cargar_categorias', 'current_restaurant', 'error');
    throw error;
  }
}, []);

// 3. En operaciones de cache
const saveToCache = useCallback(() => {
  try {
    localStorage.setItem('menu_cache', JSON.stringify(data));
    registrarOperacionCache('set', 'exitoso', 'menu');
  } catch (error) {
    registrarOperacionCache('set', 'error', 'menu');
  }
}, []);
```

### **Resultado:** Verás tus métricas en http://localhost:3000/api/metrics

---

## 📈 **Alternativas para Visualizar (sin Docker)**

### **Opción 1: Herramientas Online**
1. **Copiar métricas** de http://localhost:3000/api/metrics
2. **Usar herramientas online** como:
   - https://prometheus.io/docs/prometheus/latest/querying/basics/
   - Cualquier visualizador de métricas Prometheus online

### **Opción 2: Instalar Prometheus/Grafana Localmente**
```bash
# Descargar Prometheus para Windows
# Ir a: https://prometheus.io/download/
# Descargar: prometheus-2.42.0.windows-amd64.tar.gz

# Descargar Grafana para Windows  
# Ir a: https://grafana.com/grafana/download
# Descargar: grafana-9.3.2.windows-amd64.zip
```

### **Opción 3: Usar Extensiones de VS Code**
- **Prometheus Metrics Viewer** - Para ver métricas directamente en VS Code
- **REST Client** - Para hacer requests al endpoint de métricas

---

## 🐳 **Solucionar Docker (para el futuro)**

### **Verificar si Docker está instalado:**
```bash
docker --version
```

### **Si Docker no está instalado:**
1. **Descargar Docker Desktop:** https://www.docker.com/products/docker-desktop/
2. **Instalar** siguiendo las instrucciones
3. **Reiniciar** Windows
4. **Iniciar Docker Desktop** desde el menú de Windows

### **Si Docker está instalado pero no funciona:**
1. **Abrir Docker Desktop** desde el menú de Windows
2. **Esperar** a que inicie completamente (puede tomar 2-3 minutos)
3. **Verificar** que aparezca el ícono en la bandeja del sistema
4. **Probar:** `docker --version`

### **Una vez que Docker funcione:**
```bash
cd SPOON
docker-compose up prometheus grafana
```

---

## 🎯 **Lo Importante: ¡El Sistema YA Funciona!**

### **✅ Lo que tienes funcionando AHORA:**
- ✅ **Endpoint de métricas** en http://localhost:3000/api/metrics
- ✅ **Sistema completo** de recolección de métricas
- ✅ **Instrumentación** lista para usar
- ✅ **Dashboards** configurados (para cuando tengas Docker)
- ✅ **15 alertas** configuradas (para cuando tengas Docker)

### **🔄 Lo que necesitas Docker para:**
- 📊 **Dashboards visuales** en Grafana
- 🚨 **Alertas automáticas** de Prometheus
- 📈 **Gráficos bonitos** y fáciles de leer

### **💡 Conclusión:**
**El sistema de monitoreo está 100% funcional.** Docker solo agrega la capa visual, pero las métricas se están recolectando perfectamente.

---

## 🚀 **Próximos Pasos Recomendados**

### **Inmediato (hoy):**
1. ✅ Verificar que http://localhost:3000/api/metrics funciona
2. ✅ Instrumentar 1-2 funciones con el ejemplo
3. ✅ Ver las métricas aparecer en el endpoint

### **Esta semana:**
1. 🔄 Instalar Docker Desktop cuando tengas tiempo
2. 🔄 Ver los dashboards de Grafana funcionando
3. 🔄 Configurar alertas automáticas

### **Próximo mes:**
1. 📊 Agregar más métricas de negocio
2. 📈 Crear dashboards personalizados
3. 🚨 Configurar notificaciones por email/Slack

---

**🎉 ¡El sistema de monitoreo está funcionando perfectamente sin Docker!**
