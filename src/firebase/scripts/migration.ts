// src/firebase/scripts/migration.ts

import { db } from '../config';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc,
  writeBatch,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp 
} from 'firebase/firestore';
import { FirebaseCollections, COLLECTIONS } from '../utils/collections';
import { logMigrationError, logMigrationSuccess } from './migration-logger';

interface MigrationResult {
  success: boolean;
  totalProcessed: number;
  successful: number;
  failed: number;
  errors: Array<{
    collection: string;
    documentId: string;
    error: string;
  }>;
}

class DataMigration {
  private batchSize = 500;
  private results: MigrationResult = {
    success: false,
    totalProcessed: 0,
    successful: 0,
    failed: 0,
    errors: []
  };

  private async processBatch(
    batch: WriteBatch,
    documents: QueryDocumentSnapshot<DocumentData>[],
    transform: (data: DocumentData) => DocumentData,
    targetCollection: string
  ) {
    for (const doc of documents) {
      try {
        const transformedData = transform(doc.data());
        const newDocRef = doc(db, targetCollection, doc.id);
        batch.set(newDocRef, transformedData);
        this.results.successful++;
      } catch (error) {
        this.results.failed++;
        this.results.errors.push({
          collection: targetCollection,
          documentId: doc.id,
          error: error.message
        });
      }
      this.results.totalProcessed++;
    }
  }

  // Transformadores específicos para cada colección
  private transformProducto(data: DocumentData): DocumentData {
    return {
      id: data.ID || data.id,
      restauranteId: data.RestauranteID || data.restauranteId,
      categoriaId: this.determinarCategoria(data),
      nombre: data['nombre de plato'] || data.nombre,
      descripcion: data.Descripción || data.descripcion || '',
      imagen: data['Imagen Plato'] || data.imagen || '',
      precio: parseFloat(data.precio) || 0,
      costo: parseFloat(data.costo) || 0,
      etiquetas: this.extraerEtiquetas(data),
      stock: {
        actual: parseInt(data.stock?.actual || '0'),
        minimo: parseInt(data.stock?.minimo || '0'),
        unidad: data.stock?.unidad || 'unidad'
      },
      estado: this.determinarEstado(data),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
  }

  private transformMenu(data: DocumentData): DocumentData {
    return {
      id: data.ID || data.id,
      restauranteId: data.restauranteId,
      fecha: data.fecha instanceof Timestamp ? data.fecha : Timestamp.now(),
      combinaciones: this.transformarCombinaciones(data),
      estado: data.estado || 'borrador',
      createdAt: Timestamp.now(),
      updatedBy: data.updatedBy || null
    };
  }

  // Funciones auxiliares
  private determinarCategoria(data: DocumentData): string {
    if (data.ProteinaId) return 'proteina';
    if (data.EntradaId) return 'entrada';
    if (data.PrincipioId) return 'principio';
    if (data.BebidaId) return 'bebida';
    if (data.AcompañamientosId) return 'acompanamiento';
    return 'otros';
  }

  private extraerEtiquetas(data: DocumentData): string[] {
    const etiquetas = new Set<string>();
    
    if (data['Valor Nutricional']) etiquetas.add('nutricional');
    if (data.opciones) etiquetas.add('personalizable');
    if (data['Tipo de Comida']) etiquetas.add(data['Tipo de Comida']);
    
    return Array.from(etiquetas);
  }

  private determinarEstado(data: DocumentData): string {
    if (data.Disponibilidad === false) return 'agotado';
    if (data.estado === 'inactivo') return 'inactivo';
    return 'disponible';
  }

  private transformarCombinaciones(data: DocumentData): any[] {
    if (!Array.isArray(data.combinaciones)) return [];
    
    return data.combinaciones.map(comb => ({
      combinacionId: comb.id || comb.combinacionId,
      cantidad: parseInt(comb.cantidad) || 0,
      precio: parseFloat(comb.precio) || 0,
      disponible: comb.disponible !== false,
      vendidos: parseInt(comb.vendidos) || 0
    }));
  }

  // Método principal de migración
  public async migrate(): Promise<MigrationResult> {
    console.log('Iniciando migración de datos...');

    try {
      // Migración de productos
      await this.migrateCollection(
        FirebaseCollections.PLATOS,
        COLLECTIONS.PRODUCTOS,
        this.transformProducto.bind(this)
      );

      // Migración de menús
      await this.migrateCollection(
        FirebaseCollections.MENUS,
        COLLECTIONS.MENU_DIARIO,
        this.transformMenu.bind(this)
      );

      // Migración de categorías
      await this.migrateCategorias();

      // Actualización del resultado final
      this.results.success = this.results.failed === 0;

      // Registrar resultado
      await this.logMigrationResults();

      return this.results;

    } catch (error) {
      console.error('Error en la migración:', error);
      this.results.success = false;
      this.results.errors.push({
        collection: 'general',
        documentId: 'migration',
        error: error.message
      });

      return this.results;
    }
  }

  private async migrateCollection(
    sourceCollection: string,
    targetCollection: string,
    transform: (data: DocumentData) => DocumentData
  ): Promise<void> {
    console.log(`Migrando colección ${sourceCollection} a ${targetCollection}...`);

    const sourceRef = collection(db, sourceCollection);
    const snapshot = await getDocs(sourceRef);

    let batch = writeBatch(db);
    let count = 0;

    for (const doc of snapshot.docs) {
      try {
        const transformedData = transform(doc.data());
        const newDocRef = doc(db, targetCollection, doc.id);
        batch.set(newDocRef, transformedData);
        
        count++;
        this.results.successful++;

        if (count === this.batchSize) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      } catch (error) {
        this.results.failed++;
        this.results.errors.push({
          collection: sourceCollection,
          documentId: doc.id,
          error: error.message
        });
      }
      this.results.totalProcessed++;
    }

    if (count > 0) {
      await batch.commit();
    }
  }

  private async migrateCategorias(): Promise<void> {
    const categoriasBase = [
      { id: 'entrada', nombre: 'Entradas', tipo: 'entrada' },
      { id: 'principio', nombre: 'Principios', tipo: 'principio' },
      { id: 'proteina', nombre: 'Proteínas', tipo: 'proteina' },
      { id: 'acompanamiento', nombre: 'Acompañamientos', tipo: 'acompanamiento' },
      { id: 'bebida', nombre: 'Bebidas', tipo: 'bebida' }
    ];

    const batch = writeBatch(db);
    const restaurantes = await getDocs(collection(db, COLLECTIONS.RESTAURANTES));

    for (const restaurante of restaurantes.docs) {
      for (const categoria of categoriasBase) {
        const categoriaRef = doc(db, COLLECTIONS.CATEGORIAS_MENU, `${restaurante.id}_${categoria.id}`);
        batch.set(categoriaRef, {
          ...categoria,
          restauranteId: restaurante.id,
          orden: categoriasBase.indexOf(categoria),
          disponible: true,
          createdAt: Timestamp.now()
        });
      }
    }

    await batch.commit();
  }

  private async logMigrationResults(): Promise<void> {
    const logData = {
      timestamp: Timestamp.now(),
      results: this.results
    };

    await setDoc(
      doc(db, 'migration_logs', logData.timestamp.toDate().toISOString()),
      logData
    );
  }

  // Método de rollback
  public async rollback(timestamp: string): Promise<void> {
    const logRef = doc(db, 'migration_logs', timestamp);
    const logDoc = await getDoc(logRef);

    if (!logDoc.exists()) {
      throw new Error('No se encontró el registro de migración');
    }

    // Implementar lógica de rollback
    // Esta es una operación delicada que requiere validación adicional
    console.warn('Operación de rollback no implementada');
  }
}

// Función principal para ejecutar la migración
export async function runMigration(): Promise<MigrationResult> {
  const migration = new DataMigration();
  return migration.migrate();
}

// Script de ejecución
if (require.main === module) {
  runMigration()
    .then(results => {
      console.log('Resultados de la migración:', JSON.stringify(results, null, 2));
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error en la migración:', error);
      process.exit(1);
    });
}