@echo off
echo 🚀 Iniciando sistema de monitoreo SPOON sin Docker...
echo.

echo ⚠️  NOTA: Docker Desktop no está ejecutándose
echo 💡 Solución: Usar el sistema de métricas sin Prometheus/Grafana
echo.

echo 📊 OPCIÓN 1: Ver métricas directamente en el navegador
echo    1. Iniciar Next.js: npm run dev
echo    2. Ir a: http://localhost:3000/api/metrics
echo    3. Ver métricas en formato Prometheus (texto)
echo.

echo 📈 OPCIÓN 2: Usar herramientas online para visualizar
echo    1. Copiar métricas de http://localhost:3000/api/metrics
echo    2. Ir a: https://prometheus.io/docs/prometheus/latest/querying/basics/
echo    3. Usar PromQL online para consultas
echo.

echo 🔧 OPCIÓN 3: Instalar Prometheus/Grafana localmente (sin Docker)
echo    1. Descargar Prometheus: https://prometheus.io/download/
echo    2. Descargar Grafana: https://grafana.com/grafana/download
echo    3. Ejecutar como aplicaciones nativas de Windows
echo.

echo 🎯 RECOMENDACIÓN INMEDIATA:
echo    Usar OPCIÓN 1 para ver que las métricas funcionan
echo    Luego instalar Docker Desktop cuando sea conveniente
echo.

echo 📋 PASOS PARA USAR SIN DOCKER:
echo.
echo 1. Abrir nueva terminal y ejecutar:
echo    cd SPOON
echo    npm run dev
echo.
echo 2. Esperar a que Next.js inicie (puerto 3000)
echo.
echo 3. Abrir navegador y ir a:
echo    http://localhost:3000/api/metrics
echo.
echo 4. Deberías ver métricas en formato texto como:
echo    # HELP nodejs_version_info Node.js version info
echo    # TYPE nodejs_version_info gauge
echo    nodejs_version_info{version="v18.17.0",major="18",minor="17",patch="0"} 1
echo.
echo 5. Para probar que funciona, ejecutar:
echo    node monitoreo\scripts\test-metricas.js
echo.

echo 🔍 VERIFICAR QUE DOCKER ESTÁ INSTALADO:
docker --version 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker no está instalado o no está en PATH
    echo 💡 Instalar Docker Desktop desde: https://www.docker.com/products/docker-desktop/
) else (
    echo ✅ Docker está instalado
    echo 💡 Iniciar Docker Desktop desde el menú de Windows
)

echo.
echo 🎉 MIENTRAS TANTO: El sistema de métricas funciona perfectamente
echo    Solo necesitas Next.js ejecutándose para ver las métricas
echo.
echo 📚 DOCUMENTACIÓN:
echo    - README completo: monitoreo\README.md
echo    - Ejemplo de código: monitoreo\ejemplos\useMenuCache-instrumentado.ts
echo.
pause
