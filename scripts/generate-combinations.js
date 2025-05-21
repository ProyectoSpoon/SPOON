const fs = require('fs');
const path = require('path');

// Load products from productos.json
const productos = require('../test-data/productos.json');

// Group products by category
const productosPorCategoria = {};
productos.forEach(producto => {
  if (!productosPorCategoria[producto.id_categoria]) {
    productosPorCategoria[producto.id_categoria] = [];
  }
  productosPorCategoria[producto.id_categoria].push(producto);
});

// Get products by category
const entradas = productosPorCategoria['CAT_001'] || [];
const principios = productosPorCategoria['CAT_002'] || [];
const proteinas = productosPorCategoria['CAT_003'] || [];
const acompañamientos = productosPorCategoria['CAT_004'] || [];
const bebidas = productosPorCategoria['CAT_005'] || [];

// Verify that there is at least one product of each category
if (entradas.length === 0 || principios.length === 0 || proteinas.length === 0 || 
    acompañamientos.length === 0 || bebidas.length === 0) {
  console.error('Debe haber al menos un producto de cada categoría para generar combinaciones');
  process.exit(1);
}

const combinaciones = [];
let combinacionId = 1;

// Generate combinations between entrada, principio, and proteína without repetitions
const combinacionesGeneradas = new Set();

for (const entrada of entradas) {
  for (const principio of principios) {
    for (const proteina of proteinas) {
      // Create a unique key for this combination to avoid repetitions
      const combinacionKey = `${entrada.id_producto}-${principio.id_producto}-${proteina.id_producto}`;
      
      // Check if this combination has already been generated
      if (!combinacionesGeneradas.has(combinacionKey)) {
        combinacionesGeneradas.add(combinacionKey);
        
        // Select a bebida in a rotative manner
        const bebidaIndex = (combinacionId - 1) % bebidas.length;
        const bebida = bebidas[bebidaIndex];
        
        // Create a list with all products for this combination
        const todosLosProductos = [
          { id: entrada.id_producto, nombre: entrada.nombre, categoriaId: 'CAT_001' },
          { id: principio.id_producto, nombre: principio.nombre, categoriaId: 'CAT_002' },
          { id: proteina.id_producto, nombre: proteina.nombre, categoriaId: 'CAT_003' },
          ...acompañamientos.map(acomp => ({ 
            id: acomp.id_producto, 
            nombre: acomp.nombre, 
            categoriaId: 'CAT_004' 
          })),
          { id: bebida.id_producto, nombre: bebida.nombre, categoriaId: 'CAT_005' }
        ];
        
        combinaciones.push({
          id: `COMB_${combinacionId++}`,
          nombre: `Combinación ${combinacionId - 1}`,
          productos: todosLosProductos,
          fechaCreacion: new Date().toISOString(),
          esFavorito: false,
          esEspecial: false
        });
      }
    }
  }
}

// Write combinations to file
const outputPath = path.join(__dirname, '../test-data/combinaciones.json');
fs.writeFileSync(outputPath, JSON.stringify(combinaciones, null, 2));

console.log(`Se han generado ${combinaciones.length} combinaciones y guardado en ${outputPath}`);
console.log(`Primera combinación: ${JSON.stringify(combinaciones[0], null, 2)}`);
console.log(`Número de productos en la primera combinación: ${combinaciones[0].productos.length}`);
console.log(`Productos en la primera combinación: ${combinaciones[0].productos.map(p => p.nombre).join(', ')}`);
