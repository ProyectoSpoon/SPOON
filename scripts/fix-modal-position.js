// Script para corregir la posición del modal de depuración en el componente MenuDiaPage

const fs = require('fs');
const path = require('path');

// Ruta al archivo del componente MenuDiaPage
const menuDiaPagePath = path.join(__dirname, '../src/app/dashboard/carta/menu-dia/page.tsx');

// Leer el archivo
console.log(`Leyendo archivo: ${menuDiaPagePath}`);
let content = fs.readFileSync(menuDiaPagePath, 'utf8');

// Buscar la sección donde está el modal de depuración
const modalRegex = /\s*{\/\* Modal de depuración \*\/}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)/;

// Buscar el cierre del return statement
const returnClosingRegex = /\s*<\/div>\s*\);/;

// Verificar si se encontraron las secciones
if (modalRegex.test(content) && returnClosingRegex.test(content)) {
  console.log('Modal de depuración y cierre del return encontrados.');
  
  // Extraer el modal
  const modalMatch = content.match(modalRegex);
  if (!modalMatch) {
    console.error('No se pudo extraer el modal de depuración.');
    process.exit(1);
  }
  
  const modalContent = modalMatch[0];
  
  // Eliminar el modal de su posición actual
  const contentWithoutModal = content.replace(modalRegex, '');
  
  // Insertar el modal antes del cierre del return statement
  const returnClosingMatch = contentWithoutModal.match(returnClosingRegex);
  if (!returnClosingMatch) {
    console.error('No se pudo encontrar el cierre del return statement después de eliminar el modal.');
    process.exit(1);
  }
  
  const returnClosingIndex = contentWithoutModal.indexOf(returnClosingMatch[0]);
  
  const modifiedContent = 
    contentWithoutModal.substring(0, returnClosingIndex) + 
    modalContent + 
    contentWithoutModal.substring(returnClosingIndex);
  
  // Guardar los cambios
  fs.writeFileSync(menuDiaPagePath, modifiedContent, 'utf8');
  console.log('Archivo modificado correctamente. Se ha corregido la posición del modal de depuración.');
} else {
  console.error('No se encontró el modal de depuración o el cierre del return statement en el archivo.');
}
