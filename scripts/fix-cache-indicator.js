// Script para modificar el componente MenuDiaPage y asegurar que el indicador de caché
// sea visible cuando hay información agregada al menú

const fs = require('fs');
const path = require('path');

// Ruta al archivo del componente MenuDiaPage
const menuDiaPagePath = path.join(__dirname, '../src/app/dashboard/carta/menu-dia/page.tsx');

// Leer el archivo
console.log(`Leyendo archivo: ${menuDiaPagePath}`);
let content = fs.readFileSync(menuDiaPagePath, 'utf8');

// Buscar la sección donde se muestra el indicador de caché
const cacheIndicatorRegex = /{menuData\.productosMenu\.length > 0 && \(\s*<div[^>]*>[\s\S]*?<\/div>\s*\)}/;

// Verificar si se encontró la sección
if (cacheIndicatorRegex.test(content)) {
  console.log('Sección del indicador de caché encontrada.');
  
  // Modificar la condición para que siempre muestre el indicador de caché
  // cuando hay productos en el menú
  const modifiedContent = content.replace(
    cacheIndicatorRegex,
    `{menuData.productosMenu.length > 0 ? (
          <div className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
            <span className="text-gray-600 mr-1">Caché:</span>
            <span className={\`font-medium \${cacheTimeRemaining <= 5 ? 'text-red-500' : 'text-green-600'}\`}>
              {cacheTimeRemaining} min
            </span>
          </div>
        ) : (
          <div className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center">
            <span className="text-gray-600">No hay productos en el menú</span>
          </div>
        )}`
  );
  
  // Guardar los cambios
  fs.writeFileSync(menuDiaPagePath, modifiedContent, 'utf8');
  console.log('Archivo modificado correctamente.');
  
  // Agregar código de depuración para verificar el estado del caché
  const debugCode = `
  // Efecto para verificar el estado del caché
  useEffect(() => {
    console.log('Estado del caché:');
    console.log('- isLoaded:', isLoaded);
    console.log('- hasCache():', hasCache());
    console.log('- menuData.productosMenu.length:', menuData.productosMenu.length);
    console.log('- getCacheRemainingTime():', getCacheRemainingTime());
    
    // Verificar localStorage directamente
    try {
      const cached = localStorage.getItem('menu_crear_menu');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        console.log('- Datos en localStorage:', data);
        console.log('- Timestamp:', new Date(timestamp).toLocaleString());
        console.log('- Tiempo restante:', (1000 * 60 * 30 - (Date.now() - timestamp)) / (1000 * 60), 'minutos');
      } else {
        console.log('- No hay datos en localStorage');
      }
    } catch (error) {
      console.error('- Error al verificar localStorage:', error);
    }
  }, [isLoaded, menuData.productosMenu.length]);`;
  
  // Insertar el código de depuración después del último useEffect
  const lastUseEffectIndex = content.lastIndexOf('useEffect(');
  const lastUseEffectClosingBrace = content.indexOf('}, [', lastUseEffectIndex);
  const insertionPoint = content.indexOf(');', lastUseEffectClosingBrace) + 2;
  
  const contentWithDebug = [
    content.slice(0, insertionPoint),
    debugCode,
    content.slice(insertionPoint)
  ].join('');
  
  // Guardar los cambios con el código de depuración
  fs.writeFileSync(menuDiaPagePath, contentWithDebug, 'utf8');
  console.log('Código de depuración agregado correctamente.');
  
  console.log('\nModificaciones completadas. Por favor, reinicie el servidor de desarrollo para aplicar los cambios.');
} else {
  console.error('No se encontró la sección del indicador de caché en el archivo.');
}
