@echo off
echo 🚀 Iniciando SPOON completo con monitoreo...
echo.

echo 🔍 PASO 1: Verificar estado actual
echo.

echo Verificando puertos ocupados...
netstat -an | findstr ":3000 :3002 :3005 :9090" | findstr LISTENING

echo.
echo 🧹 PASO 2: Limpiar procesos anteriores
echo.

echo Deteniendo procesos Node.js...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Limpiando cache de Next.js...
if exist ".next" (
    rmdir /s /q ".next"
    echo ✅ Cache .next eliminado
)

echo.
echo 🚀 PASO 3: Iniciar aplicación principal SPOON
echo.

echo Iniciando Next.js en puerto 3000...
start cmd /k "cd /d %CD% && npm run dev"

echo Esperando a que Next.js inicie...
timeout /t 15 /nobreak >nul

echo.
echo 📊 PASO 4: Verificar que la aplicación funciona
echo.

echo Probando aplicación principal...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 10; Write-Host '✅ SPOON funcionando en puerto 3000 - Código:' $response.StatusCode } catch { Write-Host '❌ SPOON no responde en puerto 3000' }"

echo.
echo Probando endpoint de métricas...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/metrics' -TimeoutSec 5; if ($response.Content -like '*spoon_*') { Write-Host '✅ Métricas SPOON funcionando' } else { Write-Host '⚠️  Solo métricas básicas' } } catch { Write-Host '❌ Endpoint de métricas no responde' }"

echo.
echo 📊 PASO 5: Verificar Grafana
echo.

echo Verificando Grafana...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3005' -TimeoutSec 5 | Out-Null; Write-Host '✅ Grafana funcionando en puerto 3005' } catch { Write-Host '❌ Grafana no responde' }"

echo.
echo 🎯 PASO 6: Abrir aplicaciones
echo.

echo Abriendo SPOON en navegador...
start http://localhost:3000

timeout /t 3 /nobreak >nul

echo Abriendo Grafana...
start http://localhost:3005

echo.
echo 📋 RESUMEN DE URLS:
echo.
echo 🏠 APLICACIÓN PRINCIPAL:
echo    - SPOON: http://localhost:3000
echo    - Dashboard: http://localhost:3000/dashboard
echo    - Carta: http://localhost:3000/dashboard/carta
echo    - Favoritos: http://localhost:3000/dashboard/carta/favoritos
echo.
echo 📊 MONITOREO:
echo    - Grafana: http://localhost:3005 (admin/admin)
echo    - Prometheus: http://localhost:9090
echo    - Métricas: http://localhost:3000/api/metrics
echo.

echo 💡 CREDENCIALES:
echo    - Grafana: admin / admin
echo    - SPOON: admin@spoon.com / (tu contraseña)
echo.

echo 🔧 SI HAY PROBLEMAS:
echo.
echo 1. Si SPOON no carga:
echo    - Verificar que npm run dev esté ejecutándose
echo    - Ir a http://localhost:3000/inicio
echo.
echo 2. Si Grafana no carga:
echo    - Esperar 2-3 minutos más
echo    - Verificar Docker Desktop
echo.
echo 3. Si no hay métricas:
echo    - Usar la aplicación SPOON (navegar, hacer acciones)
echo    - Las métricas aparecerán automáticamente
echo.

echo 📚 DOCUMENTACIÓN:
echo    - README: monitoreo\README.md
echo    - Ejemplos: monitoreo\ejemplos\
echo    - Dashboard: monitoreo\dashboards\flujo-menu.json
echo.

echo 🎉 ¡SPOON con monitoreo iniciado!
echo.
echo Próximos pasos:
echo 1. Usar la aplicación SPOON para generar métricas
echo 2. Ir a Grafana e importar el dashboard
echo 3. Ver las métricas en tiempo real
echo.

pause
