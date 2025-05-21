// Script para dividir el archivo productos.json en varios archivos JSON por categoría
const fs = require('fs');
const path = require('path');

// Ruta al archivo productos.json
const productosPath = path.join(__dirname, '../test-data/productos.json');
console.log(`Leyendo archivo: ${productosPath}`);
let productos = JSON.parse(fs.readFileSync(productosPath, 'utf8'));

// Crear directorio para los archivos JSON separados
const categoriesDir = path.join(__dirname, '../test-data/categorias');
if (!fs.existsSync(categoriesDir)) {
  fs.mkdirSync(categoriesDir, { recursive: true });
  console.log(`Directorio creado: ${categoriesDir}`);
}

// Mapeo de categorías
const categorias = {
  'CAT_001': 'entradas',
  'CAT_002': 'principios',
  'CAT_003': 'proteinas',
  'CAT_004': 'acompañamientos',
  'CAT_005': 'bebidas'
};

// Agrupar productos por categoría
const productosPorCategoria = {};
Object.keys(categorias).forEach(categoriaId => {
  productosPorCategoria[categoriaId] = productos.filter(producto => 
    producto.id_categoria === categoriaId
  );
});

// Guardar cada categoría en un archivo JSON separado
Object.entries(productosPorCategoria).forEach(([categoriaId, productos]) => {
  const nombreCategoria = categorias[categoriaId];
  const filePath = path.join(categoriesDir, `${nombreCategoria}.json`);
  fs.writeFileSync(filePath, JSON.stringify(productos, null, 2), 'utf8');
  console.log(`Archivo creado: ${filePath} con ${productos.length} productos`);
});

// Modificar el archivo init-cache.ts para cargar los archivos JSON separados
const initCachePath = path.join(__dirname, '../src/utils/init-cache.ts');
console.log(`Leyendo archivo: ${initCachePath}`);
let initCacheContent = fs.readFileSync(initCachePath, 'utf8');

// Modificar la función cargarProductos para cargar los archivos JSON separados
const cargarProductosRegex = /const cargarProductos = async \(\) => \{[\s\S]*?try \{[\s\S]*?const response = await fetch\('\/test-data\/productos\.json'\);[\s\S]*?if \(!response\.ok\) \{[\s\S]*?throw new Error\(`Error al cargar productos: \${response\.status}\`\);[\s\S]*?\}[\s\S]*?const data = await response\.json\(\);[\s\S]*?console\.log\(`\${data\.length} productos cargados desde JSON`\);[\s\S]*?localStorage\.setItem\(CACHE_KEYS\.PRODUCTOS, JSON\.stringify\(data\)\);[\s\S]*?return data;/g;

const nuevoCargarProductos = `const cargarProductos = async () => {
  try {
    console.log('Cargando productos desde archivos JSON separados...');
    
    // Cargar productos de cada categoría
    const categorias = ['entradas', 'principios', 'proteinas', 'acompañamientos', 'bebidas'];
    let todosProductos = [];
    
    for (const categoria of categorias) {
      try {
        const response = await fetch(\`/test-data/categorias/\${categoria}.json\`);
        if (!response.ok) {
          console.error(\`Error al cargar productos de \${categoria}: \${response.status}\`);
          continue;
        }
        
        const data = await response.json();
        console.log(\`\${data.length} productos de \${categoria} cargados desde JSON\`);
        todosProductos = [...todosProductos, ...data];
      } catch (error) {
        console.error(\`Error al cargar productos de \${categoria}:\`, error);
      }
    }
    
    console.log(\`Total: \${todosProductos.length} productos cargados desde JSON\`);
    
    // Guardar en caché
    localStorage.setItem(CACHE_KEYS.PRODUCTOS, JSON.stringify(todosProductos));
    
    return todosProductos;`;

initCacheContent = initCacheContent.replace(cargarProductosRegex, nuevoCargarProductos);

// Guardar el archivo modificado
fs.writeFileSync(initCachePath, initCacheContent, 'utf8');
console.log(`Archivo modificado: ${initCachePath}`);

// Modificar el archivo jsonDataService.ts para cargar los archivos JSON separados
const jsonDataServicePath = path.join(__dirname, '../src/services/json-data.service.ts');
console.log(`Leyendo archivo: ${jsonDataServicePath}`);
let jsonDataServiceContent = fs.readFileSync(jsonDataServicePath, 'utf8');

// Modificar la función getProductos para cargar los archivos JSON separados
const getProductosRegex = /async getProductos\(\): Promise<any\[\]> \{[\s\S]*?try \{[\s\S]*?const response = await fetch\('\/test-data\/productos\.json'\);[\s\S]*?if \(!response\.ok\) \{[\s\S]*?throw new Error\(`Error al cargar productos: \${response\.status}\`\);[\s\S]*?\}[\s\S]*?const data = await response\.json\(\);[\s\S]*?return data;[\s\S]*?\} catch \(error\) \{[\s\S]*?console\.error\('Error al cargar productos:', error\);[\s\S]*?return \[\];[\s\S]*?\}/g;

const nuevoGetProductos = `async getProductos(): Promise<any[]> {
    try {
      console.log('Cargando productos desde archivos JSON separados...');
      
      // Cargar productos de cada categoría
      const categorias = ['entradas', 'principios', 'proteinas', 'acompañamientos', 'bebidas'];
      let todosProductos = [];
      
      for (const categoria of categorias) {
        try {
          const response = await fetch(\`/test-data/categorias/\${categoria}.json\`);
          if (!response.ok) {
            console.error(\`Error al cargar productos de \${categoria}: \${response.status}\`);
            continue;
          }
          
          const data = await response.json();
          console.log(\`\${data.length} productos de \${categoria} cargados desde JSON\`);
          todosProductos = [...todosProductos, ...data];
        } catch (error) {
          console.error(\`Error al cargar productos de \${categoria}:\`, error);
        }
      }
      
      console.log(\`Total: \${todosProductos.length} productos cargados desde JSON\`);
      return todosProductos;
    } catch (error) {
      console.error('Error al cargar productos:', error);
      return [];
    }`;

jsonDataServiceContent = jsonDataServiceContent.replace(getProductosRegex, nuevoGetProductos);

// Guardar el archivo modificado
fs.writeFileSync(jsonDataServicePath, jsonDataServiceContent, 'utf8');
console.log(`Archivo modificado: ${jsonDataServicePath}`);

// Crear un archivo HTML para limpiar el caché
const clearCachePath = path.join(__dirname, '../public/split-productos.html');
const clearCacheContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Productos Divididos por Categoría</title>
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
  <h1>Productos Divididos por Categoría</h1>
  <div class="message">Se ha dividido el archivo productos.json en varios archivos JSON por categoría.</div>
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
console.log(`Archivo para mostrar los productos divididos creado: ${clearCachePath}`);

console.log('Proceso completado. Abra http://localhost:3000/split-productos.html para aplicar los cambios.');
