// scripts/create-test-user.js

/**
 * Script para crear un usuario de prueba con datos predefinidos
 * Ejecutar con: node scripts/create-test-user.js
 */

// Importar el módulo ts-node para poder ejecutar archivos TypeScript
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    target: 'es2017',
  },
});

// Importar la función de creación de usuario de prueba
const { createTestUser } = require('../src/utils/create-test-user');

// Crear el usuario de prueba
try {
  console.log('Creando usuario de prueba...');
  const result = createTestUser();
  console.log('Usuario de prueba creado exitosamente');
  console.log('Datos guardados en localStorage (disponibles en el navegador)');
} catch (error) {
  console.error('Error al crear usuario de prueba:', error);
  process.exit(1);
}
