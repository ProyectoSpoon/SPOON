// Script para corregir el archivo init-cache.ts

const fs = require('fs');
const path = require('path');

// Ruta al archivo init-cache.ts
const initCachePath = path.join(__dirname, '../src/utils/init-cache.ts');

// Leer el archivo
console.log(`Leyendo archivo: ${initCachePath}`);
let content = fs.readFileSync(initCachePath, 'utf8');

// Modificar la función cargarProductos para forzar la carga desde el archivo JSON
const cargarProductosRegex = /const cargarProductos = async \(\) => \{[\s\S]*?try \{[\s\S]*?const cachedProductos[\s\S]*?if \(cachedProductos\) \{[\s\S]*?return JSON\.parse\(cachedProductos\);[\s\S]*?\}/g;
const nuevoCargarProductos = `const cargarProductos = async () => {
  try {
    console.log('Cargando productos desde el archivo JSON...');
    
    // Siempre cargar desde el archivo JSON, ignorar caché
    const response = await fetch('/test-data/productos.json');
    if (!response.ok) {
      throw new Error(\`Error al cargar productos: \${response.status}\`);
    }
    
    const data = await response.json();
    console.log(\`\${data.length} productos cargados desde JSON\`);
    
    // Guardar en caché
    localStorage.setItem(CACHE_KEYS.PRODUCTOS, JSON.stringify(data));
    
    return data;`;

content = content.replace(cargarProductosRegex, nuevoCargarProductos);

// Agregar función para recargar productos
const reloadProductosRegex = /export const reloadProductos = async \(\) => \{[\s\S]*?\};/g;
const nuevoReloadProductos = `export const reloadProductos = async () => {
  console.log('Recargando productos desde el archivo JSON...');
  
  try {
    // Eliminar productos del caché
    localStorage.removeItem(CACHE_KEYS.PRODUCTOS);
    console.log('Caché de productos eliminado');
    
    // Cargar productos frescos
    const productos = await cargarProductos();
    console.log(\`\${productos.length} productos cargados correctamente\`);
    
    // Forzar recarga de la página
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('Error al recargar productos:', error);
    return false;
  }
};`;

// Si la función ya existe, reemplazarla; de lo contrario, agregarla al final del archivo
if (content.match(reloadProductosRegex)) {
  content = content.replace(reloadProductosRegex, nuevoReloadProductos);
} else {
  content += '\n\n' + nuevoReloadProductos;
}

// Modificar la función forceInitializeCache para recargar la página después de inicializar el caché
const forceInitializeCacheRegex = /export const forceInitializeCache = async \(\) => \{[\s\S]*?\};/g;
const nuevoForceInitializeCache = `export const forceInitializeCache = async () => {
  console.log('Forzando inicialización del caché...');
  
  try {
    // Limpiar todo el caché
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
      console.log(\`Caché '\${key}' eliminado\`);
    });
    
    // Inicializar caché
    await initializeCache();
    console.log('Caché inicializado correctamente');
    
    // Recargar la página para aplicar los cambios
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('Error al forzar inicialización del caché:', error);
    return false;
  }
};`;

content = content.replace(forceInitializeCacheRegex, nuevoForceInitializeCache);

// Guardar el archivo modificado
fs.writeFileSync(initCachePath, content, 'utf8');
console.log(`Archivo modificado: ${initCachePath}`);

console.log('Proceso completado. Reinicie el servidor para aplicar los cambios.');
