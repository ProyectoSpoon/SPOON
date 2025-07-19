# 🕐 CONFIGURACIÓN DEL CRON JOB AUTOMÁTICO

## Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env.local`:

```env
# Secreto para autorizar las tareas cron
CRON_SECRET=tu_secreto_super_seguro_aqui

# URL de tu aplicación (para llamadas internas)
NEXTAUTH_URL=http://localhost:3000
# En producción: NEXTAUTH_URL=https://tu-dominio.com
```

## 🚀 OPCIONES DE IMPLEMENTACIÓN

### OPCIÓN 1: GitHub Actions (Recomendado) ✅
- **Archivo creado:** `.github/workflows/daily-cleanup.yml`
- **Configuración:** Automática en GitHub
- **Secretos requeridos en GitHub:**
  - `CRON_SECRET`: Tu secreto de cron
  - `APP_URL`: URL de tu aplicación

### OPCIÓN 2: Vercel Cron Jobs ✅
- **Archivo creado:** `vercel.json`
- **Configuración:** Automática en Vercel
- **Variable requerida:** `@cron-secret` en Vercel

### OPCIÓN 3: Scheduler Interno (Node-cron) ✅
- **Archivo creado:** `src/lib/scheduler.ts`
- **Dependencia instalada:** `node-cron`
- **Inicialización:** Automática al arrancar la app

## 🛠️ CONFIGURACIÓN PASO A PASO

### Para GitHub Actions:
1. Sube el código a GitHub
2. Ve a Settings > Secrets and variables > Actions
3. Agrega los secretos:
   - `CRON_SECRET`: tu_secreto_aqui
   - `APP_URL`: https://tu-dominio.com

### Para Vercel:
1. Despliega en Vercel
2. Ve a Settings > Environment Variables
3. Agrega: `CRON_SECRET` = tu_secreto_aqui

### Para Scheduler Interno:
1. Agrega `CRON_SECRET` a tu `.env.local`
2. Reinicia tu aplicación
3. El scheduler se iniciará automáticamente

## 🧪 TESTING

### Probar manualmente:
```bash
# Verificar estado del scheduler
curl http://localhost:3000/api/scheduler/init

# Ejecutar limpieza manual
curl -H "Authorization: Bearer tu_secreto" http://localhost:3000/api/cron/limpiar-menus
```

### Inicializar scheduler:
```bash
curl -X POST -H "Authorization: Bearer tu_secreto" http://localhost:3000/api/scheduler/init
```

## 📅 PROGRAMACIÓN

- **Frecuencia:** Diario a las 10:00 PM
- **Zona horaria:** America/Bogota (Colombia)
- **Función:** Limpia menús antiguos y archiva datos
- **Multi-empresa:** Procesa todos los restaurantes

## 🔐 SEGURIDAD

- Todas las opciones requieren `CRON_SECRET`
- GitHub Actions usa secretos encriptados
- Vercel usa variables de entorno seguras
- Scheduler interno verifica autorización

## 📊 MONITOREO

Los logs aparecerán en:
- **GitHub Actions:** Tab "Actions" en tu repositorio
- **Vercel:** Function logs en dashboard
- **Local:** Console de tu aplicación

¡El cron job está completamente configurado y listo para usar! 🎉
