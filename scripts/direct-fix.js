// Script para corregir directamente el archivo page.tsx
const fs = require('fs');
const path = require('path');

// Crear directorios y archivos faltantes
console.log('Creando directorios y archivos faltantes...');
const directorios = [
  '../test-data/menu-dia',
  '../test-data/especiales',
  '../test-data/favoritos',
  '../test-data/programacion-semanal'
];

directorios.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`Creando directorio: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
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
    console.log(`Creando archivo: ${filePath}`);
    fs.writeFileSync(filePath, archivo.content, 'utf8');
  }
});

// Leer el archivo de productos
const productosPath = path.join(__dirname, '../test-data/productos.json');
console.log(`Leyendo archivo de productos: ${productosPath}`);
const productos = JSON.parse(fs.readFileSync(productosPath, 'utf8'));

// Filtrar productos por categoría
const productosPorCategoria = {};
productos.forEach(producto => {
  const categoriaId = producto.id_categoria;
  if (!productosPorCategoria[categoriaId]) {
    productosPorCategoria[categoriaId] = [];
  }
  productosPorCategoria[categoriaId].push(producto);
});

// Contar productos por categoría
const conteoProductos = {};
Object.keys(productosPorCategoria).forEach(categoriaId => {
  conteoProductos[categoriaId] = productosPorCategoria[categoriaId].length;
});

console.log('Conteo de productos por categoría:', conteoProductos);

// Generar código para los productos hardcodeados
let productosHardcodedCode = `// Productos hardcodeados por categoría para la búsqueda
const PRODUCTOS_HARDCODED: Record<string, VersionedProduct[]> = {\n`;

// Generar código para cada categoría
Object.keys(productosPorCategoria).forEach(categoriaId => {
  productosHardcodedCode += `  '${categoriaId}': [\n`;
  
  productosPorCategoria[categoriaId].forEach((producto, index) => {
    productosHardcodedCode += `    {
      id: '${producto.id_producto}',
      nombre: '${producto.nombre.replace(/'/g, "\\'")}',
      descripcion: '${producto.descripcion.replace(/'/g, "\\'")}',
      categoriaId: '${producto.id_categoria}',
      currentVersion: 1,
      priceHistory: [],
      versions: [],
      stock: {
        currentQuantity: ${producto.stock_actual},
        minQuantity: ${producto.stock_minimo},
        maxQuantity: 100,
        status: 'in_stock',
        lastUpdated: new Date()
      },
      status: 'active',
      metadata: {
        createdAt: new Date(),
        createdBy: 'system',
        lastModified: new Date(),
        lastModifiedBy: 'system'
      }
    }${index < productosPorCategoria[categoriaId].length - 1 ? ',' : ''}\n`;
  });
  
  productosHardcodedCode += `  ],\n`;
});

productosHardcodedCode += `};\n`;

// Leer el archivo page.tsx
const pagePath = path.join(__dirname, '../src/app/dashboard/carta/menu-dia/page.tsx');
console.log(`Leyendo archivo: ${pagePath}`);
let content = fs.readFileSync(pagePath, 'utf8');

// Reemplazar el objeto PRODUCTOS_HARDCODED
const productosHardcodedRegex = /\/\/ Productos hardcodeados por categoría para la búsqueda\nconst PRODUCTOS_HARDCODED: Record<string, VersionedProduct\[\]> = \{[\s\S]*?\};/g;
content = content.replace(productosHardcodedRegex, productosHardcodedCode);

// Reemplazar el conteo hardcodeado
const conteoHardcodeadoRegex = /const conteoProductos = contarProductosPorCategoria\(\);/g;
const nuevoConteo = `const conteoProductos = ${JSON.stringify(conteoProductos)};`;
content = content.replace(conteoHardcodeadoRegex, nuevoConteo);

// Guardar el archivo modificado
fs.writeFileSync(pagePath, content, 'utf8');
console.log(`Archivo modificado: ${pagePath}`);

// Crear un archivo HTML para limpiar el caché
const clearCachePath = path.join(__dirname, '../public/clear-all-cache.html');
const clearCacheContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Limpiando Caché</title>
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
  <h1>Limpiando Caché</h1>
  <div class="message">Eliminando todos los datos del caché...</div>
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
console.log(`Archivo de limpieza de caché creado: ${clearCachePath}`);

console.log('Proceso completado. Abra http://localhost:3000/clear-all-cache.html para limpiar el caché y ver los cambios.');
