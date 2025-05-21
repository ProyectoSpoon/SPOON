import * as admin from 'firebase-admin';
import { COLLECTIONS } from '../types/collections.types';
import path from 'path';

// Inicializar Firebase Admin con credenciales explícitas
const serviceAccount = {
  "type": "service_account",
  "project_id": "spoon-b9d18",
  "private_key_id": "tu-private-key-id",
  "private_key": "tu-private-key",
  "client_email": "firebase-adminsdk-xxxx@spoon-b9d18.iam.gserviceaccount.com",
  "client_id": "tu-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxx@spoon-b9d18.iam.gserviceaccount.com"
};

// Inicializar Firebase Admin
const app = admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

async function migrarYEliminarColeccion() {
  console.log('\n=== INICIANDO MIGRACIÓN Y LIMPIEZA DE COLECCIONES ===');

  try {
    // 1. Leer todos los documentos de la colección original
    console.log('Leyendo documentos de la colección original...');
    const coleccionVieja = await db.collection('dueno_restaurante').get();

    if (coleccionVieja.empty) {
      console.log('No se encontraron documentos para migrar');
      return;
    }

    // Almacenar todos los documentos en memoria
    const documentosParaMigrar = coleccionVieja.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    }));

    console.log(`Se encontraron ${documentosParaMigrar.length} documentos para migrar`);

    // 2. Migrar a la nueva colección
    let exitosos = 0;
    let fallidos = 0;
    const errores: Array<{ id: string; error: unknown }> = [];

    for (const documento of documentosParaMigrar) {
      try {
        console.log(`\nMigrando documento ${documento.id}...`);
        
        await db.collection(COLLECTIONS.DUENO_RESTAURANTE).doc(documento.id).set({
          ...documento.data,
          _migracion: {
            fecha: admin.firestore.Timestamp.now(),
            coleccionOrigen: 'dueno_restaurante'
          }
        });

        exitosos++;
        console.log(`✅ Documento ${documento.id} migrado correctamente`);
      } catch (error) {
        fallidos++;
        errores.push({ id: documento.id, error });
        console.error(`❌ Error al migrar documento ${documento.id}:`, error);
      }
    }

    // 3. Verificar migración
    console.log('\n=== VERIFICANDO MIGRACIÓN ===');
    const verificacion = await Promise.all(
      documentosParaMigrar.map(async (documento) => {
        const docSnap = await db.collection(COLLECTIONS.DUENO_RESTAURANTE).doc(documento.id).get();
        return docSnap.exists;
      })
    );

    const todosExisten = verificacion.every(exists => exists);

    if (todosExisten && fallidos === 0) {
      console.log('\n✅ Verificación exitosa - Procediendo a eliminar colección original');
      
      // 4. Eliminar documentos originales
      const batch = db.batch();
      
      for (const documento of documentosParaMigrar) {
        const docRef = db.collection('Dueño Restaurante').doc(documento.id);
        batch.delete(docRef);
      }
      
      await batch.commit();
      console.log('✅ Documentos originales eliminados');
    } else {
      console.error('\n❌ La verificación falló - NO se eliminará la colección original');
      console.error('Errores encontrados:', errores);
    }

    // 5. Resumen final
    console.log('\n=== RESUMEN DE MIGRACIÓN ===');
    console.log(`Total documentos procesados: ${documentosParaMigrar.length}`);
    console.log(`✅ Migrados exitosamente: ${exitosos}`);
    console.log(`❌ Fallidos: ${fallidos}`);
    
  } catch (error) {
    console.error('Error fatal durante la migración:', error);
    throw error;
  } finally {
    // Cerrar la aplicación de admin
    await app.delete();
  }
}

// Ejecutar migración
migrarYEliminarColeccion()
  .then(() => {
    console.log('\n🎉 Proceso completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });