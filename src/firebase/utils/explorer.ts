// src/firebase/utils/explorer.ts

import { db } from '../config';
import { collection, getDocs } from 'firebase/firestore';

export const exploreFirebaseCollections = async (): Promise<void> => {
  try {
    // Obtener todas las colecciones
    const collections = await getDocs(collection(db, '_root_'));
    
    console.log('=== EXPLORANDO COLECCIONES DE FIREBASE ===\n');

    // Explorar cada colección
    for (const collectionRef of collections.docs) {
      const collectionName = collectionRef.id;
      console.log(`📁 Colección: ${collectionName}`);

      // Obtener documentos de la colección
      const documents = await getDocs(collection(db, collectionName));
      
      if (documents.empty) {
        console.log('   └── Colección vacía\n');
        continue;
      }

      // Mostrar estructura del primer documento como ejemplo
      const sampleDoc = documents.docs[0].data();
      console.log('   └── Estructura de campos:');
      Object.keys(sampleDoc).forEach(field => {
        console.log(`       └── ${field}: ${typeof sampleDoc[field]}`);
      });
      console.log(`   └── Total documentos: ${documents.size}\n`);
    }

  } catch (error) {
    console.error('Error explorando Firebase:', error);
  }
};