import pool, { query } from './database';
import { initAuthTables } from '@/services/postgres/auth.service';
import { MenuService } from '@/services/postgres/menu.service';

/**
 * Inicializa todas las tablas necesarias para la aplicación
 */
export async function initializeDatabase() {
  try {
    console.log('Inicializando base de datos Spoon...');

    // Tablas de autenticación
    await initAuthTables();
    
    // Tablas del módulo de menú
    await MenuService.initTables();
    
    // Otras tablas necesarias para la aplicación
    // ...
    
    console.log('Base de datos inicializada correctamente');
    return true;
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}

/**
 * Función para inicializar datos de prueba si es necesario
 */
export async function seedTestData() {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Añadiendo datos de prueba para entorno de desarrollo...');
      
      // Verificar si ya hay categorías
      const categoriasResult = await query('SELECT COUNT(*) FROM categorias WHERE restaurante_id = 1');
      const categoriasCount = parseInt(categoriasResult.rows[0].count);
      
      if (categoriasCount === 0) {
        // Insertar categorías base
        await query(`
          INSERT INTO categorias (nombre, orden, restaurante_id) 
          VALUES 
            ('Entradas', 1, 1),
            ('Principios', 2, 1),
            ('Proteinas', 3, 1),
            ('Acompañamientos', 4, 1),
            ('Bebidas', 5, 1)
        `);
        console.log('Categorías base añadidas');
      }
      
      // Aquí se añadirían más datos de prueba según sea necesario
      
      console.log('Datos de prueba añadidos correctamente');
    }
  } catch (error) {
    console.error('Error al añadir datos de prueba:', error);
    // No lanzamos el error para que la aplicación pueda seguir funcionando
  }
}

// Si este archivo se ejecuta directamente
if (require.main === module) {
  (async () => {
    try {
      await initializeDatabase();
      await seedTestData();
      console.log('Proceso de inicialización completado');
      process.exit(0);
    } catch (error) {
      console.error('Error durante la inicialización:', error);
      process.exit(1);
    }
  })();
}
