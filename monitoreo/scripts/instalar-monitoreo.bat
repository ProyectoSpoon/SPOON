@echo off
echo 🚀 Instalando sistema de monitoreo SPOON...
echo.

:: Verificar que estamos en la carpeta correcta
if not exist "package.json" (
    echo ❌ Error: Ejecuta este script desde la carpeta SPOON
    echo    Ejemplo: cd SPOON && monitoreo\scripts\instalar-monitoreo.bat
    pause
    exit /b 1
)

echo 📦 Instalando dependencias de Node.js...
call npm install prom-client
if %errorlevel% neq 0 (
    echo ❌ Error al instalar prom-client
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas correctamente
echo.

echo 📊 Configurando Prometheus...
:: Crear carpeta prometheus si no existe
if not exist "prometheus" mkdir prometheus

:: Copiar configuración de Prometheus
copy "monitoreo\alertas\prometheus-config.yml" "prometheus\prometheus.yml" >nul
if %errorlevel% neq 0 (
    echo ❌ Error al copiar configuración de Prometheus
    pause
    exit /b 1
)

:: Copiar reglas de alertas
copy "monitoreo\alertas\reglas-menu.yml" "prometheus\alert.rules" >nul
if %errorlevel% neq 0 (
    echo ❌ Error al copiar reglas de alertas
    pause
    exit /b 1
)

echo ✅ Prometheus configurado correctamente
echo.

echo 📈 Configurando Grafana...
:: Crear estructura de carpetas para Grafana
if not exist "grafana" mkdir grafana
if not exist "grafana\provisioning" mkdir grafana\provisioning
if not exist "grafana\provisioning\dashboards" mkdir grafana\provisioning\dashboards
if not exist "grafana\provisioning\dashboards\spoon" mkdir grafana\provisioning\dashboards\spoon
if not exist "grafana\provisioning\datasources" mkdir grafana\provisioning\datasources

:: Copiar dashboards
copy "monitoreo\dashboards\*.json" "grafana\provisioning\dashboards\spoon\" >nul
if %errorlevel% neq 0 (
    echo ❌ Error al copiar dashboards de Grafana
    pause
    exit /b 1
)

:: Crear configuración de datasource para Grafana
echo apiVersion: 1 > grafana\provisioning\datasources\prometheus.yml
echo datasources: >> grafana\provisioning\datasources\prometheus.yml
echo   - name: Prometheus >> grafana\provisioning\datasources\prometheus.yml
echo     type: prometheus >> grafana\provisioning\datasources\prometheus.yml
echo     access: proxy >> grafana\provisioning\datasources\prometheus.yml
echo     url: http://localhost:9090 >> grafana\provisioning\datasources\prometheus.yml
echo     isDefault: true >> grafana\provisioning\datasources\prometheus.yml

:: Crear configuración de dashboards para Grafana
echo apiVersion: 1 > grafana\provisioning\dashboards\dashboard.yml
echo providers: >> grafana\provisioning\dashboards\dashboard.yml
echo   - name: 'spoon-dashboards' >> grafana\provisioning\dashboards\dashboard.yml
echo     orgId: 1 >> grafana\provisioning\dashboards\dashboard.yml
echo     folder: 'SPOON' >> grafana\provisioning\dashboards\dashboard.yml
echo     type: file >> grafana\provisioning\dashboards\dashboard.yml
echo     disableDeletion: false >> grafana\provisioning\dashboards\dashboard.yml
echo     updateIntervalSeconds: 10 >> grafana\provisioning\dashboards\dashboard.yml
echo     allowUiUpdates: true >> grafana\provisioning\dashboards\dashboard.yml
echo     options: >> grafana\provisioning\dashboards\dashboard.yml
echo       path: /etc/grafana/provisioning/dashboards/spoon >> grafana\provisioning\dashboards\dashboard.yml

echo ✅ Grafana configurado correctamente
echo.

echo 🔧 Verificando configuración...
:: Verificar que el endpoint de métricas existe
if exist "src\app\api\metrics\route.ts" (
    echo ✅ Endpoint de métricas encontrado
) else (
    echo ❌ Endpoint de métricas no encontrado
    echo    El archivo src\app\api\metrics\route.ts debería existir
)

:: Verificar que las métricas están disponibles
if exist "monitoreo\metricas\index.ts" (
    echo ✅ Métricas configuradas
) else (
    echo ❌ Métricas no encontradas
)

echo.
echo 🎉 ¡Instalación completada!
echo.
echo 📍 Próximos pasos:
echo    1. Iniciar Prometheus: docker-compose up prometheus
echo    2. Iniciar Grafana: docker-compose up grafana
echo    3. Acceder a Grafana: http://localhost:3005 (admin/admin)
echo    4. Acceder a Prometheus: http://localhost:9090
echo    5. Ver métricas: http://localhost:3000/api/metrics
echo.
echo 📚 Documentación:
echo    - Dashboards: monitoreo\dashboards\
echo    - Métricas: monitoreo\metricas\
echo    - Alertas: monitoreo\alertas\
echo.
echo ⚠️  Nota: Asegúrate de que tu aplicación Next.js esté ejecutándose
echo    en el puerto 3000 para que Prometheus pueda recoger las métricas.
echo.
pause
