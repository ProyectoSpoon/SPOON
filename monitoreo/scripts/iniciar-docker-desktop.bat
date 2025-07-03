@echo off
echo 🐳 Iniciando Docker Desktop para SPOON...
echo.

echo 🔍 Verificando estado de Docker...
docker --version 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker no está instalado
    echo 💡 Instalar desde: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo ✅ Docker está instalado
echo.

echo 🚀 Intentando iniciar Docker Desktop...
echo ⏳ Esto puede tomar 2-3 minutos...
echo.

:: Intentar iniciar Docker Desktop
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

:: Esperar un momento
timeout /t 5 /nobreak >nul

echo 🔄 Esperando a que Docker Desktop inicie...
echo 💡 Verás el ícono de Docker en la bandeja del sistema cuando esté listo
echo.

:: Verificar cada 10 segundos si Docker está funcionando
set /a contador=0
:check_docker
set /a contador+=1
echo Intento %contador%/18 - Verificando Docker...

docker ps >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo 🎉 ¡Docker Desktop está funcionando!
    echo.
    goto docker_ready
)

if %contador% geq 18 (
    echo.
    echo ⚠️  Docker Desktop está tardando más de lo esperado
    echo 💡 Posibles soluciones:
    echo    1. Esperar un poco más (puede tardar hasta 5 minutos)
    echo    2. Reiniciar Docker Desktop manualmente
    echo    3. Reiniciar Windows si es necesario
    echo.
    echo 🔧 Para iniciar manualmente:
    echo    1. Buscar "Docker Desktop" en el menú de Windows
    echo    2. Hacer clic derecho → "Ejecutar como administrador"
    echo    3. Esperar a que aparezca el ícono en la bandeja
    echo.
    goto manual_instructions
)

timeout /t 10 /nobreak >nul
goto check_docker

:docker_ready
echo 🚀 Iniciando servicios de monitoreo...
echo.

echo 📊 Iniciando Prometheus...
start cmd /k "cd /d %CD% && docker-compose up prometheus"

timeout /t 3 /nobreak >nul

echo 📈 Iniciando Grafana...
start cmd /k "cd /d %CD% && docker-compose up grafana"

echo.
echo 🎉 ¡Servicios iniciados!
echo.
echo 📍 URLs de acceso:
echo    - Prometheus: http://localhost:9090
echo    - Grafana: http://localhost:3005 (admin/admin)
echo    - Métricas: http://localhost:3000/api/metrics
echo.
echo 💡 Los servicios se están iniciando en ventanas separadas
echo    Espera 1-2 minutos para que estén completamente listos
echo.
goto end

:manual_instructions
echo 📋 INSTRUCCIONES MANUALES:
echo.
echo 1. 🐳 Iniciar Docker Desktop:
echo    - Buscar "Docker Desktop" en el menú de Windows
echo    - Ejecutar como administrador
echo    - Esperar a ver el ícono en la bandeja del sistema
echo.
echo 2. 🔄 Una vez que Docker esté listo, ejecutar:
echo    docker-compose up prometheus grafana
echo.
echo 3. 📊 Acceder a los dashboards:
echo    - Grafana: http://localhost:3005 (admin/admin)
echo    - Prometheus: http://localhost:9090
echo.

:end
echo 📚 DOCUMENTACIÓN:
echo    - Guía sin Docker: monitoreo\GUIA-SIN-DOCKER.md
echo    - README completo: monitoreo\README.md
echo.
pause
