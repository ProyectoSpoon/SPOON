// Script para crear un usuario de prueba para Spoon Restaurant
// Este script debe ejecutarse en la consola del navegador mientras estás en la página de login

// Datos del usuario de prueba
const testUser = {
  email: 'test@spoonrestaurant.com',
  password: 'Test2025!',
  nombre: 'Usuario',
  apellido: 'Prueba',
  role: 'OWNER',
  permissions: ['READ_MENU', 'WRITE_MENU', 'READ_ORDERS', 'WRITE_ORDERS', 'READ_INVENTORY', 'WRITE_INVENTORY']
};

// Función para crear el usuario de prueba
async function createTestUser() {
  try {
    console.log(`Creando usuario de prueba: ${testUser.email}`);
    
    // Importar las funciones necesarias de Firebase
    const { createUserWithEmailAndPassword } = firebase.auth();
    const { doc, setDoc, serverTimestamp } = firebase.firestore;
    
    // Crear el usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      firebase.auth(),
      testUser.email, 
      testUser.password
    );
    
    const user = userCredential.user;
    console.log(`Usuario creado con UID: ${user.uid}`);
    
    // Guardar información adicional en Firestore
    const userData = {
      uid: user.uid,
      nombre: testUser.nombre,
      apellido: testUser.apellido,
      email: testUser.email,
      telefono: '',
      fechaRegistro: firebase.firestore.FieldValue.serverTimestamp(),
      RestauranteID: 'test-restaurant-id', // ID de un restaurante de prueba
      is2FAEnabled: false,
      failedAttempts: 0,
      lastFailedAttempt: null,
      requiresAdditionalInfo: false, // Ya tiene la información necesaria
      emailVerified: true, // Marcamos como verificado para pruebas
      role: testUser.role,
      permissions: testUser.permissions,
      activo: true,
      ultimoAcceso: firebase.firestore.FieldValue.serverTimestamp(),
      metodosAuth: ['email'],
      sesionesTotal: 0
    };
    
    // Guardar en la colección dueno_restaurante
    await firebase.firestore().collection('dueno_restaurante').doc(testUser.email).set(userData);
    console.log('Información del usuario guardada en Firestore');
    
    // Cerrar sesión para no quedar autenticado
    await firebase.auth().signOut();
    console.log('Sesión cerrada');
    
    console.log('\n===== USUARIO DE PRUEBA CREADO =====');
    console.log(`Email: ${testUser.email}`);
    console.log(`Contraseña: ${testUser.password}`);
    console.log('=====================================\n');
    
    console.log('Puedes usar estas credenciales para iniciar sesión en la aplicación.');
    
    return true;
    
  } catch (error) {
    console.error('Error al crear el usuario de prueba:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\nEl usuario ya existe. Puedes usar las siguientes credenciales:');
      console.log(`Email: ${testUser.email}`);
      console.log(`Contraseña: ${testUser.password}`);
    }
    
    return false;
  }
}

// Instrucciones para el usuario
console.log(`
=================================================
INSTRUCCIONES PARA CREAR UN USUARIO DE PRUEBA
=================================================

1. Asegúrate de estar en la página de login de Spoon Restaurant
2. Ejecuta la función createTestUser() en la consola
3. Espera a que el proceso termine
4. Usa las credenciales proporcionadas para iniciar sesión

Para ejecutar la función, escribe lo siguiente en la consola:
createTestUser()
`);
