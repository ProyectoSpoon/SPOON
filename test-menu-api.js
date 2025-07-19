/**
 * Script de prueba para la API de publicación de menú
 * Ejecutar con: node test-menu-api.js
 */

const https = require('https');
const http = require('http');

// Datos de prueba simulando los productos del frontend
const testData = {
  productos: [
    {
      id: "test-1",
      nombre: "Pollo Asado",
      descripcion: "Pollo asado con especias",
      categoriaId: "proteina-id",
      precio: 15000
    },
    {
      id: "test-2", 
      nombre: "Arroz Blanco",
      descripcion: "Arroz blanco tradicional",
      categoriaId: "principio-id",
      precio: 5000
    },
    {
      id: "test-3",
      nombre: "Ensalada Verde",
      descripcion: "Ensalada fresca mixta",
      categoriaId: "acompanamiento-id", 
      precio: 8000
    },
    {
      id: "test-4",
      nombre: "Jugo de Naranja",
      descripcion: "Jugo natural de naranja",
      categoriaId: "bebida-id",
      precio: 4000
    }
  ]
};

console.log('🧪 PROBANDO API DE PUBLICACIÓN DE MENÚ');
console.log('=====================================');
console.log('📦 Datos de prueba:', JSON.stringify(testData, null, 2));
console.log('');

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/menu-dia/publicar',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🔄 Enviando petición POST a /api/menu-dia/publicar...');

const req = http.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  console.log('');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📄 RESPUESTA COMPLETA:');
    console.log('======================');
    
    try {
      const jsonResponse = JSON.parse(data);
      console.log(JSON.stringify(jsonResponse, null, 2));
    } catch (error) {
      console.log('❌ Respuesta no es JSON válido:');
      console.log(data);
    }
    
    console.log('');
    console.log('✅ Prueba completada');
  });
});

req.on('error', (error) => {
  console.error('❌ Error en la petición:', error);
});

// Enviar los datos
req.write(postData);
req.end();
