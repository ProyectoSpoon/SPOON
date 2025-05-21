// Script para corregir el error de sintaxis en el componente MenuDiaPage

const fs = require('fs');
const path = require('path');

// Ruta al archivo del componente MenuDiaPage
const menuDiaPagePath = path.join(__dirname, '../src/app/dashboard/carta/menu-dia/page.tsx');

// Leer el archivo
console.log(`Leyendo archivo: ${menuDiaPagePath}`);
let content = fs.readFileSync(menuDiaPagePath, 'utf8');

// Buscar la línea donde termina el return statement
const returnEndIndex = content.indexOf('  );');

// Buscar la línea donde comienza el modal de depuración
const modalStartIndex = content.indexOf('{/* Modal de depuración */}');

// Verificar si se encontraron las secciones
if (returnEndIndex !== -1 && modalStartIndex !== -1) {
  console.log('Return statement y modal de depuración encontrados.');
  
  // Crear una nueva versión del archivo con el modal dentro del return statement
  const newContent = 
    content.substring(0, returnEndIndex) + 
    '\n      ' + content.substring(modalStartIndex, content.length) + 
    content.substring(returnEndIndex, modalStartIndex);
  
  // Guardar los cambios
  fs.writeFileSync(menuDiaPagePath, newContent, 'utf8');
  console.log('Archivo modificado correctamente. Se ha corregido el error de sintaxis.');
} else {
  console.error('No se encontró el return statement o el modal de depuración en el archivo.');
  
  // Enfoque alternativo: reescribir completamente el archivo
  console.log('Intentando enfoque alternativo...');
  
  // Buscar el final del componente
  const componentEndIndex = content.lastIndexOf('export default function');
  
  if (componentEndIndex !== -1) {
    // Extraer todo el contenido hasta el final del componente
    const componentContent = content.substring(componentEndIndex);
    
    // Buscar el return statement
    const returnStartIndex = componentContent.indexOf('return (');
    
    if (returnStartIndex !== -1) {
      // Extraer el contenido del return statement
      const returnContent = componentContent.substring(returnStartIndex);
      
      // Buscar el modal de depuración
      const modalIndex = returnContent.indexOf('{/* Modal de depuración */}');
      
      if (modalIndex !== -1) {
        // Extraer el modal
        const modalContent = returnContent.substring(modalIndex);
        
        // Buscar el final del return statement (antes del modal)
        const returnEndBeforeModal = returnContent.substring(0, modalIndex).lastIndexOf('</div>');
        
        if (returnEndBeforeModal !== -1) {
          // Crear el nuevo contenido del return statement
          const newReturnContent = 
            returnContent.substring(0, returnEndBeforeModal + 6) + 
            '\n      ' + modalContent;
          
          // Reemplazar el return statement en el componente
          const newComponentContent = 
            componentContent.substring(0, returnStartIndex) + 
            'return (' + newReturnContent;
          
          // Reemplazar el componente en el archivo
          const newContent = 
            content.substring(0, componentEndIndex) + 
            newComponentContent;
          
          // Guardar los cambios
          fs.writeFileSync(menuDiaPagePath, newContent, 'utf8');
          console.log('Archivo modificado correctamente mediante enfoque alternativo.');
        } else {
          console.error('No se pudo encontrar el final del return statement antes del modal.');
        }
      } else {
        console.error('No se pudo encontrar el modal de depuración en el return statement.');
      }
    } else {
      console.error('No se pudo encontrar el return statement en el componente.');
    }
  } else {
    console.error('No se pudo encontrar el componente en el archivo.');
  }
}
