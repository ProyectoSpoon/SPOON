#!/bin/bash

echo "===== Creando Usuario de Prueba para Spoon Restaurant ====="
echo ""

echo "Paso 1: Instalando dependencias necesarias..."
npm install pg bcryptjs dotenv
echo ""

echo "Paso 2: Inicializando tablas en PostgreSQL..."
node scripts/init-postgres-tables.js
echo ""

echo "Paso 3: Creando usuario de prueba..."
node scripts/create-postgres-test-user.js
echo ""

echo "===== Proceso completado ====="
echo ""
echo "Si no hubo errores, puedes usar las siguientes credenciales para iniciar sesión:"
echo "Email: test@spoonrestaurant.com"
echo "Contraseña: Test2025!"
echo ""

read -p "Presiona Enter para continuar..."
