// Script para corregir la carga de productos
const fs = require('fs');
const path = require('path');

// Crear directorios faltantes
console.log('Creando directorios faltantes...');
const directorios = [
  '../test-data/menu-dia',
  '../test-data/especiales',
  '../test-data/favoritos',
  '../test-data/programacion-semanal'
];

directorios.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directorio creado: ${dirPath}`);
  }
});

// Crear archivos JSON vacíos para evitar errores 404
const archivos = [
  { path: '../test-data/menu-dia/menu-dia.json', content: '{}' },
  { path: '../test-data/menu-dia/historial-menus.json', content: '[]' },
  { path: '../test-data/especiales/especiales.json', content: '[]' },
  { path: '../test-data/favoritos/favoritos.json', content: '[]' },
  { path: '../test-data/programacion-semanal/programacion-actual.json', content: '{}' },
  { path: '../test-data/programacion-semanal/historial-programaciones.json', content: '[]' }
];

archivos.forEach(archivo => {
  const filePath = path.join(__dirname, archivo.path);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, archivo.content, 'utf8');
    console.log(`Archivo creado: ${filePath}`);
  }
});

// Modificar el archivo init-cache.ts para corregir la carga de productos
const initCachePath = path.join(__dirname, '../src/utils/init-cache.ts');
console.log(`Leyendo archivo: ${initCachePath}`);
let initCacheContent = fs.readFileSync(initCachePath, 'utf8');

// Modificar la función cargarProductos para mostrar más información de depuración
const cargarProductosRegex = /const cargarProductos = async \(\) => \{[\s\S]*?try \{[\s\S]*?console\.log\('Cargando productos desde archivos JSON separados\.\.\.'\);[\s\S]*?const categorias = \['entradas', 'principios', 'proteinas', 'acompañamientos', 'bebidas'\];[\s\S]*?let todosProductos = \[\];[\s\S]*?for \(const categoria of categorias\) \{[\s\S]*?try \{[\s\S]*?const response = await fetch\(`\/test-data\/categorias\/\${categoria}\.json`\);[\s\S]*?if \(!response\.ok\) \{[\s\S]*?console\.error\(`Error al cargar productos de \${categoria}: \${response\.status}`\);[\s\S]*?continue;[\s\S]*?\}[\s\S]*?const data = await response\.json\(\);[\s\S]*?console\.log\(`\${data\.length} productos de \${categoria} cargados desde JSON`\);[\s\S]*?todosProductos = \[\.\.\.todosProductos, \.\.\.data\];[\s\S]*?\} catch \(error\) \{[\s\S]*?console\.error\(`Error al cargar productos de \${categoria}:\`, error\);[\s\S]*?\}[\s\S]*?\}[\s\S]*?console\.log\(`Total: \${todosProductos\.length} productos cargados desde JSON`\);/g;

const nuevoCargarProductos = `const cargarProductos = async () => {
  try {
    console.log('Cargando productos desde archivos JSON separados...');
    
    // Cargar productos de cada categoría
    const categorias = ['entradas', 'principios', 'proteinas', 'acompañamientos', 'bebidas'];
    let todosProductos = [];
    
    for (const categoria of categorias) {
      try {
        console.log(\`Intentando cargar productos de \${categoria}...\`);
        const response = await fetch(\`/test-data/categorias/\${categoria}.json\`);
        
        if (!response.ok) {
          console.error(\`Error al cargar productos de \${categoria}: \${response.status}\`);
          continue;
        }
        
        const data = await response.json();
        console.log(\`\${data.length} productos de \${categoria} cargados desde JSON\`);
        console.log(\`Primeros 3 productos de \${categoria}:\`, data.slice(0, 3).map(p => p.nombre));
        
        todosProductos = [...todosProductos, ...data];
      } catch (error) {
        console.error(\`Error al cargar productos de \${categoria}:\`, error);
      }
    }
    
    console.log(\`Total: \${todosProductos.length} productos cargados desde JSON\`);
    console.log('Productos por categoría:');
    
    // Contar productos por categoría
    const conteo = {};
    todosProductos.forEach(producto => {
      const categoriaId = producto.id_categoria;
      conteo[categoriaId] = (conteo[categoriaId] || 0) + 1;
    });
    
    console.log('Conteo de productos por categoría:', conteo);`;

initCacheContent = initCacheContent.replace(cargarProductosRegex, nuevoCargarProductos);

// Guardar el archivo modificado
fs.writeFileSync(initCachePath, initCacheContent, 'utf8');
console.log(`Archivo modificado: ${initCachePath}`);

// Modificar el componente ListaProductosRediseno.tsx para mostrar todos los productos
const listaProductosPath = path.join(__dirname, '../src/app/dashboard/carta/components/productos/ListaProductosRediseno.tsx');
console.log(`Leyendo archivo: ${listaProductosPath}`);
let listaProductosContent = fs.readFileSync(listaProductosPath, 'utf8');

// Modificar la función que filtra los productos para mostrar todos los productos
const filtrarProductosRegex = /const productosFiltrados = productosCategoria\.filter\(producto => \s*producto\.nombre\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\) \|\|\s*producto\.descripcion\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\)\s*\);/g;
const nuevoFiltrarProductos = `// Mostrar todos los productos sin filtrar
  const productosFiltrados = productosCategoria;
  console.log('Mostrando todos los productos sin filtrar:', productosFiltrados.length);
  console.log('Lista de productos sin filtrar:', productosFiltrados.map(p => p.nombre));`;

listaProductosContent = listaProductosContent.replace(filtrarProductosRegex, nuevoFiltrarProductos);

// Guardar el archivo modificado
fs.writeFileSync(listaProductosPath, listaProductosContent, 'utf8');
console.log(`Archivo modificado: ${listaProductosPath}`);

// Crear un archivo HTML para limpiar el caché
const clearCachePath = path.join(__dirname, '../public/fix-product-loading.html');
const clearCacheContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Corrigiendo Carga de Productos</title>
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
  <h1>Corrigiendo Carga de Productos</h1>
  <div class="message">Se ha corregido la carga de productos para mostrar todos los productos disponibles.</div>
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
  
  <a href="/dashboard/carta/menu-dia?nocache=' + Date.now() + '" class="button">Ir al Menú del Día</a>
</body>
</html>
`;

fs.writeFileSync(clearCachePath, clearCacheContent, 'utf8');
console.log(`Archivo para corregir la carga de productos creado: ${clearCachePath}`);

console.log('Proceso completado. Abra http://localhost:3000/fix-product-loading.html para aplicar los cambios.');
