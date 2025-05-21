// Script para mostrar todos los productos sin paginación
const fs = require('fs');
const path = require('path');

// Ruta al archivo ListaProductosRediseno.tsx
const listaProductosPath = path.join(__dirname, '../src/app/dashboard/carta/components/productos/ListaProductosRediseno.tsx');
console.log(`Leyendo archivo: ${listaProductosPath}`);
let content = fs.readFileSync(listaProductosPath, 'utf8');

// Modificar el componente para mostrar todos los productos sin paginación
// Buscar la sección donde se define el estilo de la tabla
const tableStyleRegex = /style=\{\{ maxHeight: '300px', overflowY: 'auto' \}\}/g;
const newTableStyle = `style={{ maxHeight: '800px', overflowY: 'auto' }}`;
content = content.replace(tableStyleRegex, newTableStyle);

// Modificar la función que filtra los productos para mostrar todos los productos
const filtrarProductosRegex = /const productosFiltrados = productosCategoria\.filter\(producto => \s*producto\.nombre\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\) \|\|\s*producto\.descripcion\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\)\s*\);/g;
const newFiltrarProductos = `const productosFiltrados = productosCategoria;
  console.log('Mostrando todos los productos sin filtrar:', productosFiltrados.length);
  console.log('Lista de productos sin filtrar:', productosFiltrados.map(p => p.nombre));`;
content = content.replace(filtrarProductosRegex, newFiltrarProductos);

// Guardar el archivo modificado
fs.writeFileSync(listaProductosPath, content, 'utf8');
console.log(`Archivo modificado: ${listaProductosPath}`);

// Crear un archivo HTML para limpiar el caché
const clearCachePath = path.join(__dirname, '../public/show-all-products.html');
const clearCacheContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Mostrando Todos los Productos</title>
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
  <h1>Mostrando Todos los Productos</h1>
  <div class="message">Eliminando filtros de productos...</div>
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
console.log(`Archivo para mostrar todos los productos creado: ${clearCachePath}`);

console.log('Proceso completado. Abra http://localhost:3000/show-all-products.html para aplicar los cambios.');
