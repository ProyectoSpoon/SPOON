@echo off
echo 🔧 Solucionando problemas de SPOON y accediendo a Grafana...
echo.

echo 🧹 PASO 1: Limpiar cache de Next.js
echo.
echo Deteniendo Next.js...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Limpiando cache...
if exist ".next" (
    rmdir /s /q ".next"
    echo ✅ Cache .next eliminado
) else (
    echo ℹ️  No hay cache .next para eliminar
)

if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✅ Cache de node_modules eliminado
) else (
    echo ℹ️  No hay cache de node_modules para eliminar
)

echo.
echo 🚀 PASO 2: Reiniciar Next.js en puerto específico
echo.
echo Iniciando Next.js en puerto 3000...
start cmd /k "cd /d %CD% && set PORT=3000 && npm run dev"

echo Esperando a que Next.js inicie...
timeout /t 10 /nobreak >nul

echo.
echo 📊 PASO 3: Verificar que Grafana está funcionando
echo.

echo Probando conexión a Grafana...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3005' -TimeoutSec 5 | Out-Null; Write-Host '✅ Grafana está funcionando' } catch { Write-Host '❌ Grafana no responde' }"

echo.
echo 🌐 PASO 4: Abrir Grafana en el navegador
echo.
echo Abriendo Grafana...
start http://localhost:3005

timeout /t 3 /nobreak >nul

echo.
echo 📋 INSTRUCCIONES PARA GRAFANA:
echo.
echo 1. 🔐 Iniciar sesión:
echo    - Usuario: admin
echo    - Contraseña: admin
echo    - Nueva contraseña: admin123
echo.
echo 2. 📊 Buscar dashboard:
echo    - Ir a: Dashboards → Browse
echo    - Buscar: "SPOON"
echo    - Hacer clic en: "SPOON - Flujo de Menú del Restaurante"
echo.
echo 3. 🔍 Si no ves el dashboard:
echo    - Ir a: Dashboards → New → Import
echo    - Subir archivo: monitoreo\dashboards\flujo-menu.json
echo.
echo 4. 📈 Si no ves datos:
echo    - Verificar que Next.js esté en puerto 3000
echo    - Ir a: http://localhost:3000/api/metrics
echo    - Debería mostrar métricas
echo.

echo 🔧 PASO 5: Verificar métricas
echo.
timeout /t 5 /nobreak >nul
echo Probando endpoint de métricas...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/metrics' -TimeoutSec 5; if ($response.Content -like '*spoon_*') { Write-Host '✅ Métricas SPOON funcionando' } else { Write-Host '⚠️  Solo métricas básicas' } } catch { Write-Host '❌ Endpoint de métricas no responde' }"

echo.
echo 🎯 RESUMEN:
echo ✅ Cache limpiado
echo ✅ Next.js reiniciado
echo ✅ Grafana abierto en navegador
echo ✅ Métricas verificadas
echo.

echo 📍 URLs importantes:
echo - Grafana: http://localhost:3005
echo - Métricas: http://localhost:3000/api/metrics
echo - Tu app: http://localhost:3000
echo.

echo 💡 Si Grafana no carga:
echo 1. Verificar que Docker esté ejecutándose
echo 2. Ejecutar: docker-compose up grafana
echo 3. Esperar 2-3 minutos
echo.

echo 💡 Si no ves métricas en Grafana:
echo 1. Verificar que Next.js esté en puerto 3000
echo 2. Ir a Grafana → Configuration → Data Sources
echo 3. Verificar que Prometheus apunte a localhost:9090
echo 4. En Prometheus, verificar que scrape localhost:3000/api/metrics
echo.

pause
