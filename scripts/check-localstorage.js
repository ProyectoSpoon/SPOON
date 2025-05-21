// Script para verificar el localStorage directamente desde Node.js
// Este script utiliza puppeteer para abrir un navegador y verificar el localStorage

const puppeteer = require('puppeteer');

async function checkLocalStorage() {
  console.log('Iniciando verificación de localStorage...');
  
  // Lanzar navegador
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    // Navegar a la página del menú del día
    console.log('Navegando a la página del menú del día...');
    await page.goto('http://localhost:3002/dashboard/carta/menu-dia', { waitUntil: 'networkidle2' });
    
    // Esperar a que la página cargue completamente
    await page.waitForSelector('h1');
    
    // Verificar el localStorage
    console.log('\nVerificando localStorage...');
    const localStorage = await page.evaluate(() => {
      const result = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        result[key] = localStorage.getItem(key);
      }
      return result;
    });
    
    console.log('Claves encontradas en localStorage:', Object.keys(localStorage));
    
    // Verificar específicamente el caché del menú
    if (localStorage['menu_crear_menu']) {
      console.log('\nDatos del caché del menú encontrados:');
      try {
        const cacheData = JSON.parse(localStorage['menu_crear_menu']);
        console.log('- Timestamp:', new Date(cacheData.timestamp).toLocaleString());
        
        const remainingMs = 1000 * 60 * 30 - (Date.now() - cacheData.timestamp); // 30 minutos
        const remainingMinutes = Math.floor(remainingMs / (1000 * 60));
        console.log('- Tiempo restante:', remainingMinutes > 0 ? `${remainingMinutes} minutos` : 'Expirado');
        
        if (cacheData.data && cacheData.data.productosMenu) {
          console.log('- Productos en el menú:', cacheData.data.productosMenu.length);
          if (cacheData.data.productosMenu.length > 0) {
            console.log('- Nombres de productos:', cacheData.data.productosMenu.map(p => p.nombre).join(', '));
          } else {
            console.log('- No hay productos en el menú.');
          }
        } else {
          console.log('- No hay datos de productos en el caché.');
        }
      } catch (error) {
        console.error('Error al analizar los datos del caché:', error);
        console.log('Contenido raw del caché:', localStorage['menu_crear_menu']);
      }
    } else {
      console.log('\nNo se encontró el caché del menú en localStorage.');
    }
    
    // Verificar si hay productos seleccionados en el menú
    console.log('\nVerificando productos seleccionados en la página...');
    const productosSeleccionados = await page.evaluate(() => {
      // Buscar elementos que indiquen productos seleccionados
      const toggles = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
      return toggles.length;
    });
    
    console.log(`Se encontraron ${productosSeleccionados} productos seleccionados en la página.`);
    
    // Verificar si el indicador de caché está visible
    console.log('\nVerificando si el indicador de caché está visible...');
    const cacheIndicator = await page.evaluate(() => {
      // Buscar el indicador de caché
      const indicator = document.querySelector('div.bg-gray-100.rounded-full');
      if (indicator) {
        return indicator.textContent;
      }
      return null;
    });
    
    if (cacheIndicator) {
      console.log('Indicador de caché encontrado:', cacheIndicator);
    } else {
      console.log('No se encontró el indicador de caché en la página.');
    }
    
    // Capturar logs de la consola
    console.log('\nLogs de la consola del navegador:');
    const logs = [];
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
    
    // Recargar la página para capturar los logs
    await page.reload({ waitUntil: 'networkidle2' });
    
    // Esperar un momento para que se generen los logs
    await page.waitForTimeout(2000);
    
    // Mostrar los logs capturados
    logs.forEach(log => console.log(log));
    
  } catch (error) {
    console.error('Error durante la verificación:', error);
  } finally {
    // Cerrar el navegador
    await browser.close();
    console.log('\nVerificación completada.');
  }
}

// Ejecutar la verificación
checkLocalStorage().catch(console.error);
