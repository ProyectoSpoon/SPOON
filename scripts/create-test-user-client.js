// Script para crear un usuario de prueba para Spoon Restaurant usando el SDK de cliente

// Importamos las funciones necesarias
const { registerWithEmail } = require('../src/firebase/auth');

// Datos del usuario de prueba
const testUser = {
  email: 'test@spoonrestaurant.com',
  password: 'Test2025!',
  nombre: 'Usuario',
  apellido: 'Prueba'
};

// Función para crear el usuario de prueba
async function createTestUser() {
  try {
    console.log(`Creando usuario de prueba: ${testUser.email}`);
    
    // Registrar el usuario usando la función existente
    const result = await registerWithEmail(
      testUser.email, 
      testUser.password,
      testUser.nombre,
      testUser.apellido
    );
    
    console.log('Usuario creado exitosamente:', result.user.uid);
    console.log('\n===== USUARIO DE PRUEBA CREADO =====');
    console.log(`Email: ${testUser.email}`);
    console.log(`Contraseña: ${testUser.password}`);
    console.log('=====================================\n');
    
    console.log('Puedes usar estas credenciales para iniciar sesión en la aplicación.');
    
    // Salir del proceso
    process.exit(0);
    
  } catch (error) {
    console.error('Error al crear el usuario de prueba:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\nEl usuario ya existe. Puedes usar las siguientes credenciales:');
      console.log(`Email: ${testUser.email}`);
      console.log(`Contraseña: ${testUser.password}`);
    }
    
    // Salir del proceso con error
    process.exit(1);
  }
}

// Ejecutar la función
createTestUser();
