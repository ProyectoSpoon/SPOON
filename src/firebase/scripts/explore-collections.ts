// src/firebase/scripts/explore-collections.ts

import { db } from '../config';
import { collection, getDocs } from 'firebase/firestore';

const COLLECTIONS = [
  'Acompañamientos',  // Notar la mayúscula inicial
  'Bebida',
  'Categoria de Menú',
  'Centro de Ayuda',
  'Ciudades y Regiones',
  'Comensal',
  'Dueño Restaurante',
  'Entrada',
  'Menús',
  'Opiniones',
  'Platos',
  'Principio',
  'Proteina',
  'Recompensas',
  'Reportes',
  'Restaurante',
  'Tipos de cocina',
  'Tipos de Comida'
];

export const exploreFirebaseCollections = async (): Promise<void> => {
  console.log('Script iniciado');

  try {
    console.log('=== EXPLORANDO COLECCIONES DE FIREBASE ===');
    console.log(`📚 Total colecciones a explorar: ${COLLECTIONS.length}`);
    console.log('🔍 Buscando en colecciones:', COLLECTIONS.join(', '), '\n');

    for (const collectionName of COLLECTIONS) {
      console.log(`\n📂 Explorando colección: ${collectionName}`);
      
      try {
        const collectionRef = collection(db, collectionName);
        const documents = await getDocs(collectionRef);
        
        if (documents.empty) {
          console.log(`   ⚠️  La colección '${collectionName}' está vacía`);
          continue;
        }

        console.log(`   ✅ Encontrados ${documents.size} documentos`);
        const sampleDoc = documents.docs[0].data();
        console.log('   📄 Estructura del primer documento:');
        Object.entries(sampleDoc).forEach(([field, value]) => {
          const type = Array.isArray(value) ? 'array' : typeof value;
          console.log(`      - ${field}: ${type}`);
        });

      } catch (error: any) {
        console.log(`   ❌ Error: ${error?.message || 'Error desconocido'}`);
      }
    }

  } catch (error) {
    console.error('❌ Error crítico:', error);
  }
};

// Ejecutamos el script
exploreFirebaseCollections()
  .then(() => console.log('\n✅ Exploración completada'))
  .catch(error => console.error('\n❌ Error en la exploración:', error));