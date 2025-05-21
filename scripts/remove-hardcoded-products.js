// Script para eliminar productos hardcodeados del código
const fs = require('fs');
const path = require('path');

// Modificar el archivo page.tsx para eliminar productos hardcodeados
const pagePath = path.join(__dirname, '../src/app/dashboard/carta/menu-dia/page.tsx');
console.log(`Leyendo archivo: ${pagePath}`);
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Eliminar el objeto PRODUCTOS_HARDCODED
const productosHardcodedRegex = /\/\/ Productos hardcodeados por categoría para la búsqueda\nconst PRODUCTOS_HARDCODED: Record<string, VersionedProduct\[\]> = \{[\s\S]*?\};/g;
const nuevoProductosHardcoded = `// Productos se cargan dinámicamente desde los archivos JSON
const PRODUCTOS_HARDCODED: Record<string, VersionedProduct[]> = {};`;

pageContent = pageContent.replace(productosHardcodedRegex, nuevoProductosHardcoded);

// Guardar el archivo modificado
fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log(`Archivo modificado: ${pagePath}`);

// Modificar el archivo ListaProductosRediseno.tsx para eliminar productos hardcodeados
const listaProductosPath = path.join(__dirname, '../src/app/dashboard/carta/components/productos/ListaProductosRediseno.tsx');
console.log(`Leyendo archivo: ${listaProductosPath}`);
let listaProductosContent = fs.readFileSync(listaProductosPath, 'utf8');

// Eliminar el objeto PRODUCTOS_HARDCODED
const listaProductosHardcodedRegex = /\/\/ Productos hardcodeados por categoría\n\/\/ Los productos se cargarán dinámicamente desde los archivos JSON\nconst PRODUCTOS_HARDCODED: Record<string, VersionedProduct\[\]> = \{\};/g;
const nuevoListaProductosHardcoded = `// Los productos se cargan dinámicamente desde los archivos JSON separados por categoría
// No se utilizan productos hardcodeados`;

listaProductosContent = listaProductosContent.replace(listaProductosHardcodedRegex, nuevoListaProductosHardcoded);

// Modificar la función que obtiene los productos para la categoría seleccionada
const productosCategoriasRegex = /const productosCategoria = productosJSON\.length > 0 \s*\? productosJSON \s*: \(categoriaId \? PRODUCTOS_HARDCODED\[categoriaId\] \|\| \[\] : \[\]\);/g;
const nuevoProductosCategoria = `const productosCategoria = productosJSON.length > 0 
    ? productosJSON 
    : [];`;

listaProductosContent = listaProductosContent.replace(productosCategoriasRegex, nuevoProductosCategoria);

// Guardar el archivo modificado
fs.writeFileSync(listaProductosPath, listaProductosContent, 'utf8');
console.log(`Archivo modificado: ${listaProductosPath}`);

// Crear un archivo HTML para limpiar el caché
const clearCachePath = path.join(__dirname, '../public/remove-hardcoded-products.html');
const clearCacheContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Eliminando Productos Hardcodeados</title>
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
  <h1>Eliminando Productos Hardcodeados</h1>
  <div class="message">Se han eliminado los productos hardcodeados del código.</div>
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
console.log(`Archivo para eliminar productos hardcodeados creado: ${clearCachePath}`);

console.log('Proceso completado. Abra http://localhost:3000/remove-hardcoded-products.html para aplicar los cambios.');
