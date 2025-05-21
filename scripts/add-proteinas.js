// Script para agregar nuevos productos de proteínas al archivo JSON
const fs = require('fs');
const path = require('path');

// Ruta al archivo productos.json
const productosPath = path.join(__dirname, '../test-data/productos.json');
console.log(`Leyendo archivo: ${productosPath}`);
let productos = JSON.parse(fs.readFileSync(productosPath, 'utf8'));

// Obtener el último ID de producto
const lastProductId = productos.reduce((maxId, producto) => {
  const idNum = parseInt(producto.id_producto.split('_')[1]);
  return Math.max(maxId, idNum);
}, 0);

console.log(`Último ID de producto: PROD_${lastProductId.toString().padStart(3, '0')}`);

// Nuevos productos de proteínas a agregar
const nuevasProteinas = [
  {
    nombre: "Pollo a la plancha",
    descripcion: "Pechuga de pollo cocinada sin aceite, ideal para dietas",
    descripcion_corta: "Pechuga de pollo a la plancha",
    vegano: false,
    vegetariano: false
  },
  {
    nombre: "Pollo sudado",
    descripcion: "Guiso de pollo con cebolla, tomate y papa",
    descripcion_corta: "Guiso de pollo",
    vegano: false,
    vegetariano: false
  },
  {
    nombre: "Pollo apanado",
    descripcion: "Filete de pollo empanizado y frito",
    descripcion_corta: "Filete de pollo empanizado",
    vegano: false,
    vegetariano: false
  },
  {
    nombre: "Pechuga en salsa de champiñones",
    descripcion: "Pechuga bañada en salsa blanca con champiñones",
    descripcion_corta: "Pechuga en salsa blanca",
    vegano: false,
    vegetariano: false
  },
  {
    nombre: "Carne molida",
    descripcion: "Carne de res molida, salteada con cebolla y tomate",
    descripcion_corta: "Carne molida salteada",
    vegano: false,
    vegetariano: false
  },
  {
    nombre: "Carne asada",
    descripcion: "Corte de res asado o a la plancha",
    descripcion_corta: "Corte de res asado",
    vegano: false,
    vegetariano: false
  },
  {
    nombre: "Bistec a caballo",
    descripcion: "Bistec de res con huevo frito encima",
    descripcion_corta: "Bistec con huevo frito",
    vegano: false,
    vegetariano: false
  },
  {
    nombre: "Costilla de cerdo",
    descripcion: "Costilla cocida o asada con especias",
    descripcion_corta: "Costilla de cerdo con especias",
    vegano: false,
    vegetariano: false
  },
  {
    nombre: "Lomo de cerdo en salsa BBQ",
    descripcion: "Trozos de lomo de cerdo en salsa barbacoa",
    descripcion_corta: "Lomo de cerdo en BBQ",
    vegano: false,
    vegetariano: false
  },
  {
    nombre: "Chorizo",
    descripcion: "Embutido típico, frito o asado",
    descripcion_corta: "Chorizo frito o asado",
    vegano: false,
    vegetariano: false
  },
  {
    nombre: "Pescado apanado",
    descripcion: "Filete de pescado empanizado y frito",
    descripcion_corta: "Filete de pescado empanizado",
    vegano: false,
    vegetariano: false
  },
  {
    nombre: "Mojarra frita",
    descripcion: "Pescado completo frito, muy común en la costa",
    descripcion_corta: "Pescado entero frito",
    vegano: false,
    vegetariano: false
  },
  {
    nombre: "Huevos pericos",
    descripcion: "Huevos revueltos con tomate y cebolla (no es vegano)",
    descripcion_corta: "Huevos revueltos con vegetales",
    vegano: false,
    vegetariano: true
  },
  {
    nombre: "Tofu a la plancha",
    descripcion: "Tofu cortado y dorado, alternativa vegetal",
    descripcion_corta: "Tofu dorado",
    vegano: true,
    vegetariano: true
  }
];

// Agregar los nuevos productos al array de productos
nuevasProteinas.forEach((proteina, index) => {
  const newId = lastProductId + index + 1;
  const newProductId = `PROD_${newId.toString().padStart(3, '0')}`;
  
  productos.push({
    id_producto: newProductId,
    nombre: proteina.nombre,
    descripcion: proteina.descripcion,
    descripcion_corta: proteina.descripcion_corta,
    id_categoria: "CAT_003", // Categoría de proteínas
    id_subcategoria: "SUBCAT_003",
    imagen_url: "/images/placeholder.jpg",
    imagen_miniatura_url: "/images/placeholder.jpg",
    estado_disponible: true,
    stock_actual: 50,
    stock_minimo: 10,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  });
  
  console.log(`Agregado producto: ${newProductId} - ${proteina.nombre}`);
});

// Guardar el archivo actualizado
fs.writeFileSync(productosPath, JSON.stringify(productos, null, 2), 'utf8');
console.log(`Archivo actualizado: ${productosPath}`);
console.log(`Se agregaron ${nuevasProteinas.length} nuevos productos de proteínas.`);

// Crear un archivo HTML para limpiar el caché
const clearCachePath = path.join(__dirname, '../public/add-proteinas.html');
const clearCacheContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Productos de Proteínas Agregados</title>
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
  <h1>Productos de Proteínas Agregados</h1>
  <div class="message">Se han agregado ${nuevasProteinas.length} nuevos productos de proteínas al archivo JSON.</div>
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
console.log(`Archivo para mostrar los nuevos productos creado: ${clearCachePath}`);

console.log('Proceso completado. Abra http://localhost:3000/add-proteinas.html para aplicar los cambios.');
