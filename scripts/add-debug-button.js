// Script para agregar un botón de depuración al componente MenuDiaPage
// Este botón verificará el localStorage directamente y mostrará los resultados en la página

const fs = require('fs');
const path = require('path');

// Ruta al archivo del componente MenuDiaPage
const menuDiaPagePath = path.join(__dirname, '../src/app/dashboard/carta/menu-dia/page.tsx');

// Leer el archivo
console.log(`Leyendo archivo: ${menuDiaPagePath}`);
let content = fs.readFileSync(menuDiaPagePath, 'utf8');

// Código del botón de depuración
const debugButtonCode = `
  // Estado para mostrar el modal de depuración
  const [showDebugModal, setShowDebugModal] = useState(false);
  // Estado para almacenar los resultados de la depuración
  const [debugResults, setDebugResults] = useState<string[]>([]);

  // Función para verificar el localStorage
  const checkLocalStorage = () => {
    const results: string[] = [];
    
    results.push('Verificando localStorage...');
    
    try {
      // Verificar si localStorage está disponible
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      results.push('localStorage está disponible.');
      
      // Verificar el caché del menú
      const MENU_CACHE_KEY = 'menu_crear_menu';
      const cached = localStorage.getItem(MENU_CACHE_KEY);
      
      if (!cached) {
        results.push('No hay datos en caché del menú.');
        return results;
      }
      
      results.push('Datos del caché del menú encontrados:');
      
      const cacheData = JSON.parse(cached);
      results.push(\`- Timestamp: \${new Date(cacheData.timestamp).toLocaleString()}\`);
      
      const remainingMs = 1000 * 60 * 30 - (Date.now() - cacheData.timestamp); // 30 minutos
      const remainingMinutes = Math.floor(remainingMs / (1000 * 60));
      results.push(\`- Tiempo restante: \${remainingMinutes > 0 ? \`\${remainingMinutes} minutos\` : 'Expirado'}\`);
      
      if (cacheData.data && cacheData.data.productosMenu) {
        results.push(\`- Productos en el menú: \${cacheData.data.productosMenu.length}\`);
        if (cacheData.data.productosMenu.length > 0) {
          results.push(\`- Nombres de productos: \${cacheData.data.productosMenu.map((p: any) => p.nombre).join(', ')}\`);
        } else {
          results.push('- No hay productos en el menú.');
        }
      } else {
        results.push('- No hay datos de productos en el caché.');
      }
    } catch (error) {
      results.push(\`Error al verificar localStorage: \${error}\`);
    }
    
    return results;
  };
`;

// Código del modal de depuración
const debugModalCode = `
      {/* Modal de depuración */}
      {showDebugModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Resultados de depuración</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">
                {debugResults.join('\\n')}
              </pre>
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                onClick={() => setShowDebugModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
`;

// Código del botón para abrir el modal de depuración
const debugButtonJSXCode = `
        <button
          className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm"
          onClick={() => {
            setDebugResults(checkLocalStorage());
            setShowDebugModal(true);
          }}
        >
          Depurar Caché
        </button>
`;

// Insertar el código del botón de depuración después de la declaración de los estados
const lastUseStateIndex = content.lastIndexOf('useState<');
const lastUseStateClosingParen = content.indexOf(');', lastUseStateIndex);
const insertionPoint = lastUseStateClosingParen + 2;

// Insertar el código del botón de depuración
const contentWithDebugButton = [
  content.slice(0, insertionPoint),
  debugButtonCode,
  content.slice(insertionPoint)
].join('');

// Insertar el código del modal de depuración antes del cierre del componente
const returnIndex = contentWithDebugButton.lastIndexOf('return (');
const lastDivClosingTag = contentWithDebugButton.lastIndexOf('</div>');

// Insertar el código del modal de depuración
const contentWithDebugModal = [
  contentWithDebugButton.slice(0, lastDivClosingTag + 6),
  debugModalCode,
  contentWithDebugButton.slice(lastDivClosingTag + 6)
].join('');

// Insertar el botón para abrir el modal de depuración en el encabezado
const headerEndIndex = contentWithDebugModal.indexOf('</div>', contentWithDebugModal.indexOf('<h1 className="text-2xl font-bold text-gray-700">Menu - Almuerzos</h1>'));

// Insertar el botón para abrir el modal de depuración
const contentWithDebugButtonJSX = [
  contentWithDebugModal.slice(0, headerEndIndex),
  debugButtonJSXCode,
  contentWithDebugModal.slice(headerEndIndex)
].join('');

// Guardar los cambios
fs.writeFileSync(menuDiaPagePath, contentWithDebugButtonJSX, 'utf8');
console.log('Archivo modificado correctamente. Se ha agregado un botón de depuración al componente MenuDiaPage.');
console.log('\nPor favor, reinicie el servidor de desarrollo para aplicar los cambios.');
