@echo off
echo Ejecutando script de creacion de tablas...

rem Establecer variables de conexion
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=spoon
set PGUSER=postgres
rem Dejar en blanco la contraseña para que la pida interactivamente
rem set PGPASSWORD=

rem Ruta al archivo SQL
set SQL_FILE=crear_tablas_menu.sql

rem Ejecutar el script con psql
psql -f %SQL_FILE%

echo Proceso completado.
pause
