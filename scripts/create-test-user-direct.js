// Script para crear un usuario de prueba para Spoon Restaurant
// Este script puede ejecutarse directamente desde la línea de comandos

// Importar las dependencias necesarias
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword,
  signOut
} = require('firebase/auth');
const { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp 
} = require('firebase/firestore');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
    
    // Crear el usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
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
      fechaRegistro: serverTimestamp(),
      RestauranteID: 'test-restaurant-id', // ID de un restaurante de prueba
      is2FAEnabled: false,
      failedAttempts: 0,
      lastFailedAttempt: null,
      requiresAdditionalInfo: false, // Ya tiene la información necesaria
      emailVerified: true, // Marcamos como verificado para pruebas
      role: testUser.role,
      permissions: testUser.permissions,
      activo: true,
      ultimoAcceso: serverTimestamp(),
      metodosAuth: ['email'],
      sesionesTotal: 0
    };
    
    // Guardar en la colección dueno_restaurante
    await setDoc(doc(db, 'dueno_restaurante', testUser.email), userData);
    console.log('Información del usuario guardada en Firestore');
    
    // Cerrar sesión para no quedar autenticado
    await signOut(auth);
    console.log('Sesión cerrada');
    
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
      process.exit(0);
    }
    
    // Salir del proceso con error
    process.exit(1);
  }
}

// Ejecutar la función
createTestUser();
