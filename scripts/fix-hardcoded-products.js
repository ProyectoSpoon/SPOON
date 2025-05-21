// Script para corregir los productos hardcodeados en menu-dia/page.tsx

const fs = require('fs');
const path = require('path');

// Ruta al archivo page.tsx
const pagePath = path.join(__dirname, '../src/app/dashboard/carta/menu-dia/page.tsx');

// Leer el archivo
console.log(`Leyendo archivo: ${pagePath}`);
let content = fs.readFileSync(pagePath, 'utf8');

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

// Reemplazar el conteo hardcodeado
const conteoHardcodeadoRegex = /const conteoProductos = contarProductosPorCategoria\(\);/g;
const nuevoConteo = `const conteoProductos = ${JSON.stringify(conteoProductos)};`;
content = content.replace(conteoHardcodeadoRegex, nuevoConteo);

// Generar código para los productos hardcodeados de la categoría CAT_001 (Entradas)
let productosCAT001Code = `'CAT_001': [\n`;

productosPorCategoria['CAT_001'].forEach((producto, index) => {
  productosCAT001Code += `      {
        id: '${producto.id_producto}',
        nombre: '${producto.nombre}',
        descripcion: '${producto.descripcion}',
        descripcion_corta: '${producto.descripcion_corta}',
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
      }${index < productosPorCategoria['CAT_001'].length - 1 ? ',' : ''}\n`;
});

productosCAT001Code += `    ]`;

// Reemplazar los productos hardcodeados de la categoría CAT_001
const productosCAT001Regex = /'CAT_001': \[\s*\{[\s\S]*?\}\s*\]/g;
content = content.replace(productosCAT001Regex, productosCAT001Code);

// Guardar el archivo modificado
fs.writeFileSync(pagePath, content, 'utf8');
console.log(`Archivo modificado: ${pagePath}`);

// Crear los directorios faltantes
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

console.log('Proceso completado. Reinicie el servidor para aplicar los cambios.');
