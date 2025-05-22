@echo off
echo ===================================================
echo Iniciando servidor de desarrollo con caché limpio
echo ===================================================

echo.
echo Limpiando caché del navegador...
echo NOTA: Esto no limpia el localStorage, deberás usar clear-cache.html para eso.
echo.

echo Iniciando servidor de desarrollo...
npm run dev
