// Script para eliminar los datos hardcodeados del componente MenuDiaPage
// y solo utilizar los datos que se ingresan por pantalla o se cargan desde los archivos JSON

const fs = require('fs');
const path = require('path');

// Ruta al archivo del componente MenuDiaPage
const menuDiaPagePath = path.join(__dirname, '../src/app/dashboard/carta/menu-dia/page.tsx');

// Leer el archivo
console.log(`Leyendo archivo: ${menuDiaPagePath}`);
let content = fs.readFileSync(menuDiaPagePath, 'utf8');

// Buscar la sección donde se definen los productos hardcodeados
const hardcodedProductsRegex = /const PRODUCTOS_HARDCODED: Record<string, VersionedProduct\[\]> = \{[\s\S]*?\};/;

// Verificar si se encontró la sección
if (hardcodedProductsRegex.test(content)) {
  console.log('Sección de productos hardcodeados encontrada.');
  
  // Reemplazar la sección de productos hardcodeados con una versión que solo utiliza datos de JSON
  const modifiedContent = content.replace(
    hardcodedProductsRegex,
    `// Los productos se cargarán dinámicamente desde los archivos JSON
const PRODUCTOS_HARDCODED: Record<string, VersionedProduct[]> = {};`
  );
  
  // Guardar los cambios
  fs.writeFileSync(menuDiaPagePath, modifiedContent, 'utf8');
  console.log('Archivo modificado correctamente. Se han eliminado los productos hardcodeados.');
  
  // Ahora, modificar la función que carga los productos para que solo utilice datos de JSON
  const loadProductsRegex = /const productosCategoria = productosJSON\.length > 0[\s\S]*?\(categoriaId \? PRODUCTOS_HARDCODED\[categoriaId\] \|\| \[\] : \[\]\);/;
  
  if (loadProductsRegex.test(modifiedContent)) {
    console.log('Sección de carga de productos encontrada.');
    
    // Reemplazar la sección de carga de productos
    const finalContent = modifiedContent.replace(
      loadProductsRegex,
      `const productosCategoria = productosJSON;`
    );
    
    // Guardar los cambios
    fs.writeFileSync(menuDiaPagePath, finalContent, 'utf8');
    console.log('Archivo modificado correctamente. Se ha actualizado la carga de productos para usar solo datos de JSON.');
  } else {
    console.error('No se encontró la sección de carga de productos en el archivo.');
  }
  
  // Modificar también el componente ListaProductosRediseno para que no use datos hardcodeados
  const listaProductosPath = path.join(__dirname, '../src/app/dashboard/carta/components/productos/ListaProductosRediseno.tsx');
  
  if (fs.existsSync(listaProductosPath)) {
    console.log(`\nLeyendo archivo: ${listaProductosPath}`);
    let listaContent = fs.readFileSync(listaProductosPath, 'utf8');
    
    // Buscar la sección donde se definen los productos hardcodeados
    const hardcodedListaRegex = /const PRODUCTOS_HARDCODED: Record<string, VersionedProduct\[\]> = \{[\s\S]*?\};/;
    
    if (hardcodedListaRegex.test(listaContent)) {
      console.log('Sección de productos hardcodeados encontrada en ListaProductosRediseno.');
      
      // Reemplazar la sección de productos hardcodeados
      const modifiedListaContent = listaContent.replace(
        hardcodedListaRegex,
        `// Los productos se cargarán dinámicamente desde los archivos JSON
const PRODUCTOS_HARDCODED: Record<string, VersionedProduct[]> = {};`
      );
      
      // Guardar los cambios
      fs.writeFileSync(listaProductosPath, modifiedListaContent, 'utf8');
      console.log('Archivo ListaProductosRediseno modificado correctamente. Se han eliminado los productos hardcodeados.');
      
      // Ahora, modificar la función que carga los productos para que solo utilice datos de JSON
      const loadListaProductsRegex = /setProductosJSON\(PRODUCTOS_HARDCODED\[categoriaId\] \|\| \[\]\);/g;
      
      if (loadListaProductsRegex.test(modifiedListaContent)) {
        console.log('Sección de carga de productos encontrada en ListaProductosRediseno.');
        
        // Reemplazar la sección de carga de productos
        const finalListaContent = modifiedListaContent.replace(
          loadListaProductsRegex,
          `console.log('No se pudieron cargar productos desde JSON, intentando de nuevo...');
          // Intentar cargar productos nuevamente
          jsonDataService.getProductos()
            .then(productos => {
              if (productos && productos.length > 0) {
                const productosFiltrados = productos.filter(
                  (p: any) => p.id_categoria === categoriaId || p.categoriaId === categoriaId
                );
                setProductosJSON(productosFiltrados);
              } else {
                setProductosJSON([]);
              }
            })
            .catch(error => {
              console.error('Error al cargar productos:', error);
              setProductosJSON([]);
            });`
        );
        
        // Guardar los cambios
        fs.writeFileSync(listaProductosPath, finalListaContent, 'utf8');
        console.log('Archivo ListaProductosRediseno modificado correctamente. Se ha actualizado la carga de productos para usar solo datos de JSON.');
      } else {
        console.error('No se encontró la sección de carga de productos en el archivo ListaProductosRediseno.');
      }
    } else {
      console.error('No se encontró la sección de productos hardcodeados en el archivo ListaProductosRediseno.');
    }
  } else {
    console.error(`No se encontró el archivo ListaProductosRediseno en la ruta: ${listaProductosPath}`);
  }
  
  console.log('\nModificaciones completadas. Por favor, reinicie el servidor de desarrollo para aplicar los cambios.');
} else {
  console.error('No se encontró la sección de productos hardcodeados en el archivo MenuDiaPage.');
}
