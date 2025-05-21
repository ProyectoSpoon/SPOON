// Script para corregir la posición del botón de depuración en el componente MenuDiaPage

const fs = require('fs');
const path = require('path');

// Ruta al archivo del componente MenuDiaPage
const menuDiaPagePath = path.join(__dirname, '../src/app/dashboard/carta/menu-dia/page.tsx');

// Leer el archivo
console.log(`Leyendo archivo: ${menuDiaPagePath}`);
let content = fs.readFileSync(menuDiaPagePath, 'utf8');

// Buscar la sección donde está el botón de depuración
const debugButtonRegex = /<button\s+className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm"\s+onClick={\(\) => \{\s*setDebugResults\(checkLocalStorage\(\)\);\s*setShowDebugModal\(true\);\s*\}}\s*>\s*Depurar Caché\s*<\/button>/;

// Verificar si se encontró la sección
if (debugButtonRegex.test(content)) {
  console.log('Botón de depuración encontrado.');
  
  // Eliminar el botón de su posición actual
  const contentWithoutButton = content.replace(debugButtonRegex, '');
  
  // Buscar la sección donde se debe insertar el botón
  const headerEndRegex = /<h1 className="text-2xl font-bold text-gray-700">Menu - Almuerzos<\/h1>/;
  
  if (headerEndRegex.test(contentWithoutButton)) {
    console.log('Sección del encabezado encontrada.');
    
    // Insertar el botón después del encabezado
    const modifiedContent = contentWithoutButton.replace(
      headerEndRegex,
      `<h1 className="text-2xl font-bold text-gray-700">Menu - Almuerzos</h1>
        <button
          className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm"
          onClick={() => {
            setDebugResults(checkLocalStorage());
            setShowDebugModal(true);
          }}
        >
          Depurar Caché
        </button>`
    );
    
    // Guardar los cambios
    fs.writeFileSync(menuDiaPagePath, modifiedContent, 'utf8');
    console.log('Archivo modificado correctamente. Se ha corregido la posición del botón de depuración.');
  } else {
    console.error('No se encontró la sección del encabezado en el archivo.');
  }
} else {
  console.error('No se encontró el botón de depuración en el archivo.');
}
