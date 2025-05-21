// Script para corregir la paginación de productos
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

// Guardar el archivo modificado
fs.writeFileSync(listaProductosPath, content, 'utf8');
console.log(`Archivo modificado: ${listaProductosPath}`);

// Ruta al archivo page.tsx
const pagePath = path.join(__dirname, '../src/app/dashboard/carta/menu-dia/page.tsx');
console.log(`Leyendo archivo: ${pagePath}`);
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Modificar el componente para expandir automáticamente la categoría seleccionada
// Buscar la sección donde se define el estado expandedCategory
const expandedCategoryRegex = /const \[expandedCategory, setExpandedCategory\] = useState<string \| null>\(null\);/g;
const newExpandedCategory = `const [expandedCategory, setExpandedCategory] = useState<string | null>('CAT_001'); // Expandir Entradas por defecto`;
pageContent = pageContent.replace(expandedCategoryRegex, newExpandedCategory);

// Guardar el archivo modificado
fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log(`Archivo modificado: ${pagePath}`);

// Ruta al archivo ListaCategoriasRediseno.tsx
const listaCategoriasPath = path.join(__dirname, '../src/app/dashboard/carta/components/categorias/ListaCategoriasRediseno.tsx');
console.log(`Leyendo archivo: ${listaCategoriasPath}`);
let categoriasContent = fs.readFileSync(listaCategoriasPath, 'utf8');

// Modificar el componente para mostrar los productos en lugar de un mensaje de texto
const expandedContentRegex = /{expandedCategory === categoria\.id && \(\s*<div className="px-4 py-3 bg-gray-50">\s*{\/\* Aquí iría el contenido expandido de la categoría \*\/}\s*<p className="text-sm text-gray-600">Contenido de la categoría {categoria\.nombre}<\/p>\s*<\/div>\s*\)}/g;
const newExpandedContent = `{expandedCategory === categoria.id && (
            <div className="px-4 py-3 bg-gray-50">
              {/* Aquí va el contenido expandido de la categoría */}
              {/* Renderizar ListaProductosRediseno para esta categoría */}
              {/* Este componente se renderiza en page.tsx */}
            </div>
          )}`;
categoriasContent = categoriasContent.replace(expandedContentRegex, newExpandedContent);

// Guardar el archivo modificado
fs.writeFileSync(listaCategoriasPath, categoriasContent, 'utf8');
console.log(`Archivo modificado: ${listaCategoriasPath}`);

// Crear un archivo HTML para limpiar el caché
const clearCachePath = path.join(__dirname, '../public/fix-pagination.html');
const clearCacheContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Corrigiendo Paginación</title>
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
  <h1>Corrigiendo Paginación</h1>
  <div class="message">Eliminando límites de paginación...</div>
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
console.log(`Archivo de corrección de paginación creado: ${clearCachePath}`);

console.log('Proceso completado. Abra http://localhost:3000/fix-pagination.html para aplicar los cambios.');
