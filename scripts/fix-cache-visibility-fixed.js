// Script para asegurar que el indicador de caché sea visible cuando hay información agregada al menú

const fs = require('fs');
const path = require('path');

// Ruta al archivo del componente MenuDiaPage
const menuDiaPagePath = path.join(__dirname, '../src/app/dashboard/carta/menu-dia/page.tsx');

// Leer el archivo
console.log(`Leyendo archivo: ${menuDiaPagePath}`);
let content = fs.readFileSync(menuDiaPagePath, 'utf8');

// Buscar la sección donde se muestra el indicador de caché
const cacheIndicatorRegex = /{menuData\.productosMenu\.length > 0 && \(\s*<div[^>]*>[\s\S]*?<\/div>\s*\)}/;

// Verificar si se encontró la sección
if (cacheIndicatorRegex.test(content)) {
  console.log('Sección del indicador de caché encontrada.');
  
  // Modificar la condición para que siempre muestre el indicador de caché
  // cuando hay productos en el menú
  const modifiedContent = content.replace(
    cacheIndicatorRegex,
    `{menuData.productosMenu.length > 0 ? (
          <div className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
            <span className="text-gray-600 mr-1">Caché:</span>
            <span className={\`font-medium \${cacheTimeRemaining <= 5 ? 'text-red-500' : 'text-green-600'}\`}>
              {cacheTimeRemaining} min
            </span>
          </div>
        ) : null}`
  );
  
  // Guardar los cambios
  fs.writeFileSync(menuDiaPagePath, modifiedContent, 'utf8');
  console.log('Archivo modificado correctamente.');
  
  // Modificar también el efecto que actualiza el tiempo de caché
  const cacheTimeEffectRegex = /useEffect\(\(\) => \{\s*\/\/ Inicializar el tiempo de caché[\s\S]*?\}, \[menuData\.productosMenu\.length\]\);/;
  
  let finalContent = modifiedContent; // Inicializar finalContent con modifiedContent
  
  if (cacheTimeEffectRegex.test(finalContent)) {
    console.log('Efecto de tiempo de caché encontrado.');
    
    // Reemplazar el efecto para que siempre actualice el tiempo de caché
    finalContent = finalContent.replace(
      cacheTimeEffectRegex,
      `useEffect(() => {
    // Inicializar el tiempo de caché
    if (hasCache()) {
      setCacheTimeRemaining(getCacheRemainingTime());
    } else {
      setCacheTimeRemaining(60); // 1 hora = 60 minutos
    }
    
    // Solo iniciar el intervalo si hay productos en el menú
    if (menuData.productosMenu.length > 0) {
      console.log('Iniciando intervalo para actualizar tiempo de caché');
      // Actualizar el tiempo cada minuto
      const interval = setInterval(() => {
        setCacheTimeRemaining(prevTime => {
          console.log('Actualizando tiempo de caché:', prevTime);
          if (prevTime <= 1) {
            // Si el tiempo llega a 0, reiniciar los datos
            toast.error('El tiempo de caché ha expirado. Se reiniciarán los datos del menú.');
            // Limpiar el menú
            updateProductosMenu([]);
            return 60; // Reiniciar el contador a 60 minutos
          }
          return prevTime - 1;
        });
      }, 60000); // 60000 ms = 1 minuto
      
      return () => {
        console.log('Limpiando intervalo de tiempo de caché');
        clearInterval(interval);
      };
    }
  }, [menuData.productosMenu.length, hasCache, getCacheRemainingTime]);`
    );
    
    // Guardar los cambios
    fs.writeFileSync(menuDiaPagePath, finalContent, 'utf8');
    console.log('Efecto de tiempo de caché modificado correctamente.');
  } else {
    console.error('No se encontró el efecto de tiempo de caché en el archivo.');
  }
  
  // Modificar también el efecto que muestra la notificación de caché
  const cacheNotificationEffectRegex = /useEffect\(\(\) => \{\s*if \(isLoaded && hasCache\(\) && menuData\.productosMenu\.length > 0\) \{[\s\S]*?\}, \[isLoaded, menuData\.productosMenu\.length\]\);/;
  
  let finalContentWithNotification = finalContent; // Inicializar finalContentWithNotification con finalContent
  
  if (cacheNotificationEffectRegex.test(finalContentWithNotification)) {
    console.log('Efecto de notificación de caché encontrado.');
    
    // Reemplazar el efecto para que siempre muestre la notificación de caché
    finalContentWithNotification = finalContentWithNotification.replace(
      cacheNotificationEffectRegex,
      `useEffect(() => {
    if (isLoaded && hasCache()) {
      console.log('Mostrando notificación de caché');
      toast.success(
        \`Datos cargados desde caché (expira en \${getCacheRemainingTime()} minutos)\`,
        { duration: 4000 }
      );
    }
  }, [isLoaded, hasCache, getCacheRemainingTime]);`
    );
    
    // Guardar los cambios
    fs.writeFileSync(menuDiaPagePath, finalContentWithNotification, 'utf8');
    console.log('Efecto de notificación de caché modificado correctamente.');
  } else {
    console.error('No se encontró el efecto de notificación de caché en el archivo.');
  }
  
  // Agregar código de depuración para verificar el estado del caché
  const debugCode = `
  // Efecto para verificar el estado del caché
  useEffect(() => {
    console.log('Estado del caché:');
    console.log('- isLoaded:', isLoaded);
    console.log('- hasCache():', hasCache());
    console.log('- menuData.productosMenu.length:', menuData.productosMenu.length);
    console.log('- getCacheRemainingTime():', getCacheRemainingTime());
    
    // Verificar localStorage directamente
    try {
      const cached = localStorage.getItem('menu_crear_menu');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        console.log('- Datos en localStorage:', data);
        console.log('- Timestamp:', new Date(timestamp).toLocaleString());
        console.log('- Tiempo restante:', (1000 * 60 * 30 - (Date.now() - timestamp)) / (1000 * 60), 'minutos');
      } else {
        console.log('- No hay datos en localStorage');
      }
    } catch (error) {
      console.error('- Error al verificar localStorage:', error);
    }
  }, [isLoaded, menuData.productosMenu.length]);`;
  
  // Insertar el código de depuración después del último useEffect
  const lastUseEffectIndex = finalContentWithNotification.lastIndexOf('useEffect(');
  const lastUseEffectClosingBrace = finalContentWithNotification.indexOf('}, [', lastUseEffectIndex);
  const insertionPoint = finalContentWithNotification.indexOf(');', lastUseEffectClosingBrace) + 2;
  
  const contentWithDebug = [
    finalContentWithNotification.slice(0, insertionPoint),
    debugCode,
    finalContentWithNotification.slice(insertionPoint)
  ].join('');
  
  // Guardar los cambios con el código de depuración
  fs.writeFileSync(menuDiaPagePath, contentWithDebug, 'utf8');
  console.log('Código de depuración agregado correctamente.');
  
  console.log('\nModificaciones completadas. Por favor, reinicie el servidor de desarrollo para aplicar los cambios.');
} else {
  console.error('No se encontró la sección del indicador de caché en el archivo.');
}
