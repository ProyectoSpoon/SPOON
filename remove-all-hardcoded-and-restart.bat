@echo off
echo Eliminando todos los productos hardcodeados y reiniciando servidor...

echo Ejecutando script para eliminar todos los productos hardcodeados...
cd spoon-restaurant
node scripts/remove-all-hardcoded-products.js

echo Deteniendo procesos de Node.js...
taskkill /f /im node.exe >nul 2>&1

echo Eliminando directorio .next...
if exist .next (
  rmdir /s /q .next
  echo Directorio .next eliminado correctamente.
) else (
  echo El directorio .next no existe.
)



echo Proceso completado. El servidor se está reiniciando.
echo Por favor, espere unos momentos y luego abra http://localhost:3000/remove-all-hardcoded.html
echo para limpiar el caché del navegador y ver los cambios.
