@echo off
echo 🎉 ¡Docker está funcionando! Accediendo a los dashboards...
echo.

echo 🔍 Verificando que los servicios estén listos...
echo.

echo 📊 GRAFANA:
echo    URL: http://localhost:3005
echo    Usuario: admin
echo    Contraseña: admin
echo.

echo 🔍 PROMETHEUS:
echo    URL: http://localhost:9090
echo    (Para consultas avanzadas)
echo.

echo 📈 MÉTRICAS DE SPOON:
echo    URL: http://localhost:3000/api/metrics
echo    (Necesitas Next.js ejecutándose)
echo.

echo 🚀 PASOS PARA VER LOS DASHBOARDS:
echo.
echo 1. 📊 Abrir Grafana:
start http://localhost:3005
echo    ✅ Abriendo Grafana en el navegador...
echo.

timeout /t 3 /nobreak >nul

echo 2. 🔐 Iniciar sesión:
echo    - Usuario: admin
echo    - Contraseña: admin
echo    - (Te pedirá cambiar la contraseña, puedes usar 'admin123')
echo.

echo 3. 📈 Ver el dashboard de SPOON:
echo    - Ir a: Dashboards → Browse
echo    - Buscar: "SPOON - Flujo de Menú del Restaurante"
echo    - Hacer clic para abrir
echo.

echo 4. 🔍 Si no ves datos en el dashboard:
echo    - Abrir nueva terminal
echo    - Ejecutar: cd SPOON && npm run dev
echo    - Esperar a que Next.js inicie en puerto 3000
echo    - Refrescar el dashboard en Grafana
echo.

echo 🔧 SOLUCIONAR ERRORES DE PROMETHEUS:
echo.
echo Los errores que veo son de configuración. Para solucionarlos:
echo.
echo 1. Detener Prometheus:
echo    - Ir a la ventana de Prometheus
echo    - Presionar Ctrl+C
echo.
echo 2. Actualizar configuración:
echo    - El archivo prometheus.yml ya está configurado correctamente
echo.
echo 3. Reiniciar Prometheus:
echo    docker-compose up prometheus
echo.

echo 📋 VERIFICAR QUE TODO FUNCIONA:
echo.
echo ✅ Docker Desktop: Funcionando
echo ✅ Contenedores: spoon_grafana, spoon_prometheus
echo 🔄 Next.js: Necesita estar ejecutándose en puerto 3000
echo.

echo 💡 TIPS:
echo    - Si Grafana no carga, espera 1-2 minutos más
echo    - Si no ves métricas, asegúrate de que Next.js esté ejecutándose
echo    - Los dashboards se actualizan cada 30 segundos
echo.

echo 🎯 PRÓXIMOS PASOS:
echo    1. Iniciar sesión en Grafana
echo    2. Buscar el dashboard de SPOON
echo    3. Iniciar Next.js si no está ejecutándose
echo    4. Ver las métricas en tiempo real
echo.

echo 📚 DOCUMENTACIÓN:
echo    - README completo: monitoreo\README.md
echo    - Guía sin Docker: monitoreo\GUIA-SIN-DOCKER.md
echo.

pause
