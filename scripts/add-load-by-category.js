// Script para agregar función de carga de productos por categoría
const fs = require('fs');
const path = require('path');

// Modificar el archivo jsonDataService.ts para agregar función de carga por categoría
const jsonDataServicePath = path.join(__dirname, '../src/services/json-data.service.ts');
console.log(`Leyendo archivo: ${jsonDataServicePath}`);
let jsonDataServiceContent = fs.readFileSync(jsonDataServicePath, 'utf8');

// Agregar función getProductosByCategoria
const getProductosByCategoriaFunction = `
  /**
   * Obtiene los productos de una categoría específica
   * @param categoriaId ID de la categoría (CAT_001, CAT_002, etc.)
   * @returns Array de productos de la categoría
   */
  async getProductosByCategoria(categoriaId: string): Promise<any[]> {
    try {
      // Mapeo de IDs de categoría a nombres de archivo
      const categoriasMap: Record<string, string> = {
        'CAT_001': 'entradas',
        'CAT_002': 'principios',
        'CAT_003': 'proteinas',
        'CAT_004': 'acompañamientos',
        'CAT_005': 'bebidas'
      };
      
      const nombreArchivo = categoriasMap[categoriaId];
      if (!nombreArchivo) {
        console.error(\`Categoría no válida: \${categoriaId}\`);
        return [];
      }
      
      console.log(\`Cargando productos de categoría \${categoriaId} (\${nombreArchivo})...\`);
      
      const response = await fetch(\`/test-data/categorias/\${nombreArchivo}.json\`);
      if (!response.ok) {
        throw new Error(\`Error al cargar productos de \${nombreArchivo}: \${response.status}\`);
      }
      
      const data = await response.json();
      console.log(\`\${data.length} productos de \${nombreArchivo} cargados desde JSON\`);
      return data;
    } catch (error) {
      console.error(\`Error al cargar productos de categoría \${categoriaId}:\`, error);
      return [];
    }
  }`;

// Buscar el final de la clase JsonDataService
const classEndRegex = /}\s*export const jsonDataService = new JsonDataService\(\);/g;
const replacement = `  ${getProductosByCategoriaFunction}
}

export const jsonDataService = new JsonDataService();`;

jsonDataServiceContent = jsonDataServiceContent.replace(classEndRegex, replacement);

// Guardar el archivo modificado
fs.writeFileSync(jsonDataServicePath, jsonDataServiceContent, 'utf8');
console.log(`Archivo modificado: ${jsonDataServicePath}`);

// Modificar el componente ListaProductosRediseno.tsx para usar la nueva función
const listaProductosPath = path.join(__dirname, '../src/app/dashboard/carta/components/productos/ListaProductosRediseno.tsx');
console.log(`Leyendo archivo: ${listaProductosPath}`);
let listaProductosContent = fs.readFileSync(listaProductosPath, 'utf8');

// Modificar la función de carga de productos
const cargarProductosRegex = /const cargarProductos = async \(\) => \{[\s\S]*?if \(!categoriaId\) \{[\s\S]*?console\.log\('No hay categoría seleccionada, no se cargarán productos'\);[\s\S]*?return;[\s\S]*?\}[\s\S]*?setCargandoProductos\(true\);[\s\S]*?try \{[\s\S]*?localStorage\.removeItem\('menu_productos'\);[\s\S]*?console\.log\('Caché de productos eliminado para forzar recarga'\);[\s\S]*?console\.log\('Intentando cargar productos desde JSON\.\.\.'\);[\s\S]*?const productos = await jsonDataService\.getProductos\(\);[\s\S]*?console\.log\('Productos cargados desde JSON:', productos\);[\s\S]*?console\.log\('Total de productos cargados:', productos\.length\);/g;

const nuevoCargarProductos = `const cargarProductos = async () => {
      console.log('Cargando productos para categoría:', categoriaId);
      
      if (!categoriaId) {
        console.log('No hay categoría seleccionada, no se cargarán productos');
        return;
      }
      
      setCargandoProductos(true);
      try {
        // Limpiar caché para forzar recarga
        localStorage.removeItem('menu_productos');
        console.log('Caché de productos eliminado para forzar recarga');
        
        // Cargar productos específicos de la categoría
        console.log(\`Intentando cargar productos de categoría \${categoriaId}...\`);
        const productos = await jsonDataService.getProductosByCategoria(categoriaId);
        console.log(\`Productos de categoría \${categoriaId} cargados:`, productos);
        console.log('Total de productos cargados:', productos.length);`;

listaProductosContent = listaProductosContent.replace(cargarProductosRegex, nuevoCargarProductos);

// Guardar el archivo modificado
fs.writeFileSync(listaProductosPath, listaProductosContent, 'utf8');
console.log(`Archivo modificado: ${listaProductosPath}`);

// Crear un archivo HTML para limpiar el caché
const clearCachePath = path.join(__dirname, '../public/load-by-category.html');
const clearCacheContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Carga de Productos por Categoría</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }
    h1 {
      color: #333;
    }
    .message {
      margin: 20px 0;
      padding: 10px;
      background-color: #f0f0f0;
      border-radius: 5px;
    }
    .success {
      color: green;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <h1>Carga de Productos por Categoría</h1>
  <div class="message">Se ha agregado la función para cargar productos por categoría específica.</div>
  <div id="status" class="message"></div>
  
  <script>
    // Limpiar todo el localStorage
    localStorage.clear();
    
    // Mostrar mensaje de éxito
    document.getElementById('status').innerHTML = 'Caché limpiado correctamente. <span class="success">Redirigiendo en 2 segundos...</span>';
    
    // Redirigir después de 2 segundos
    setTimeout(() => {
      window.location.href = '/dashboard/carta/menu-dia?nocache=' + Date.now();
    }, 2000);
  </script>
  
  <a href="/dashboard/carta/menu-dia?nocache=${Date.now()}" class="button">Ir al Menú del Día</a>
</body>
</html>
`;

fs.writeFileSync(clearCachePath, clearCacheContent, 'utf8');
console.log(`Archivo para mostrar la carga por categoría creado: ${clearCachePath}`);

console.log('Proceso completado. Abra http://localhost:3000/load-by-category.html para aplicar los cambios.');
