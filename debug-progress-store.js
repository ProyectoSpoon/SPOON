// debug-progress-store.js
// Script para debuggear el estado del store de progreso

console.log('🔍 DEBUGGING PROGRESS STORE');
console.log('===========================');

// Simular el estado del store para debugging
const estadoEjemplo = {
  '/config-restaurante/informacion-general': {
    nombre: { completado: true },
    contacto: { completado: true },
    descripcion: { completado: false },
    tipoComida: { completado: false }
  },
  '/config-restaurante/ubicacion': {
    direccion: { completado: false },
    coordenadas: { completado: false },
    zona: { completado: false }
  },
  '/config-restaurante/horario-comercial': {
    horarios: { completado: false },
    diasAtencion: { completado: false }
  },
  '/config-restaurante/logo-portada': {
    logo: { completado: false },
    portada: { completado: false }
  }
};

// Función para calcular progreso de una sección
function calcularProgresoSeccion(seccion) {
  if (!seccion) {
    return { completados: 0, total: 0, porcentaje: 0 };
  }
  
  const campos = Object.values(seccion);
  const completados = campos.filter(campo => campo.completado).length;
  const total = campos.length;
  const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0;
  
  return { completados, total, porcentaje };
}

// Función para calcular progreso general
function calcularProgresoGeneral(estado) {
  let totalCompletados = 0;
  let totalCampos = 0;
  
  Object.values(estado).forEach(seccion => {
    const campos = Object.values(seccion);
    totalCampos += campos.length;
    totalCompletados += campos.filter(campo => campo.completado).length;
  });
  
  const porcentaje = totalCampos > 0 ? Math.round((totalCompletados / totalCampos) * 100) : 0;
  
  return { 
    completados: totalCompletados, 
    total: totalCampos, 
    porcentaje 
  };
}

// Calcular progreso por secciones
console.log('\n📊 PROGRESO POR SECCIONES:');
const secciones = [
  { nombre: 'Información General', ruta: '/config-restaurante/informacion-general' },
  { nombre: 'Ubicación', ruta: '/config-restaurante/ubicacion' },
  { nombre: 'Horarios', ruta: '/config-restaurante/horario-comercial' },
  { nombre: 'Logo/Portada', ruta: '/config-restaurante/logo-portada' }
];

secciones.forEach(({ nombre, ruta }) => {
  const progreso = calcularProgresoSeccion(estadoEjemplo[ruta]);
  console.log(`${nombre}:`);
  console.log(`  - Completados: ${progreso.completados}/${progreso.total}`);
  console.log(`  - Porcentaje: ${progreso.porcentaje}%`);
  console.log(`  - ¿Completa con === 100?: ${progreso.porcentaje === 100}`);
  console.log(`  - ¿Completa con > 0?: ${progreso.porcentaje > 0}`);
  console.log(`  - ¿Completa con >= 50?: ${progreso.porcentaje >= 50}`);
  console.log('');
});

// Calcular progreso general
console.log('📈 PROGRESO GENERAL:');
const progresoGeneral = calcularProgresoGeneral(estadoEjemplo);
console.log(`Total: ${progresoGeneral.completados}/${progresoGeneral.total} (${progresoGeneral.porcentaje}%)`);

console.log('\n💡 RECOMENDACIONES:');
console.log('1. Para "completa": usar porcentaje > 0 (al menos un campo completado)');
console.log('2. Para "muy completa": usar porcentaje >= 75');
console.log('3. Para "perfecta": usar porcentaje === 100');
console.log('\n✅ Usar porcentaje > 0 para mostrar barras verdes');
