// Script para verificar si el caché del menú está funcionando correctamente

// Función para verificar si localStorage está disponible
function isLocalStorageAvailable() {
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// Función para verificar si hay datos en el caché del menú
function checkMenuCache() {
  const MENU_CACHE_KEY = 'menu_crear_menu';
  
  console.log('Verificando disponibilidad de localStorage...');
  if (!isLocalStorageAvailable()) {
    console.error('localStorage no está disponible en este navegador.');
    return;
  }
  
  console.log('localStorage está disponible.');
  
  console.log('Verificando caché del menú...');
  const cached = localStorage.getItem(MENU_CACHE_KEY);
  
  if (!cached) {
    console.log('No hay datos en caché del menú.');
    return;
  }
  
  try {
    const { data, timestamp } = JSON.parse(cached);
    const remainingMs = 1000 * 60 * 30 - (Date.now() - timestamp); // 30 minutos
    const remainingMinutes = Math.floor(remainingMs / (1000 * 60));
    
    console.log('Datos encontrados en caché del menú:');
    console.log('- Timestamp:', new Date(timestamp).toLocaleString());
    console.log('- Tiempo restante:', remainingMinutes > 0 ? `${remainingMinutes} minutos` : 'Expirado');
    
    if (data.productosMenu && data.productosMenu.length > 0) {
      console.log('- Productos en el menú:', data.productosMenu.length);
      console.log('- Nombres de productos:', data.productosMenu.map(p => p.nombre).join(', '));
    } else {
      console.log('- No hay productos en el menú.');
    }
    
    if (remainingMinutes <= 0) {
      console.log('El caché ha expirado y debería ser eliminado automáticamente.');
    }
  } catch (error) {
    console.error('Error al analizar los datos del caché:', error);
  }
}

// Ejecutar la verificación
checkMenuCache();

// Instrucciones para el usuario
console.log('\nPara usar este script:');
console.log('1. Abra la consola del navegador (F12 o Ctrl+Shift+I)');
console.log('2. Copie y pegue todo el contenido de este archivo en la consola');
console.log('3. Presione Enter para ejecutar');
console.log('4. Verifique los resultados en la consola');
