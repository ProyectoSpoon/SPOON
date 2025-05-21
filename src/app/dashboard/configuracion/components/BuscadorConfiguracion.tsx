'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Definir opciones de configuración para búsqueda
const opcionesConfiguracion = [
  { id: 'info-basica', nombre: 'Información básica', ruta: '/dashboard/restaurante/info', categoria: 'general' },
  { id: 'horarios', nombre: 'Horarios comerciales', ruta: '/dashboard/horario-comercial', categoria: 'general' },
  { id: 'branding', nombre: 'Imagen y branding', ruta: '/dashboard/configuracion/branding', categoria: 'general' },
  { id: 'pagos', nombre: 'Métodos de pago', ruta: '/dashboard/configuracion/pagos', categoria: 'negocio' },
  { id: 'impuestos', nombre: 'Impuestos y facturación', ruta: '/dashboard/configuracion/facturacion', categoria: 'negocio' },
  { id: 'zonas', nombre: 'Zonas de entrega', ruta: '/dashboard/configuracion/zonas', categoria: 'negocio' },
  { id: 'usuarios', nombre: 'Gestión de usuarios', ruta: '/dashboard/usuarios', categoria: 'usuarios' },
  { id: 'roles', nombre: 'Roles y permisos', ruta: '/dashboard/usuarios/roles', categoria: 'usuarios' },
  { id: 'notificaciones', nombre: 'Notificaciones', ruta: '/dashboard/configuracion/notificaciones', categoria: 'sistema' },
  { id: 'preferencias', nombre: 'Preferencias del sistema', ruta: '/dashboard/configuracion/preferencias', categoria: 'sistema' },
  { id: 'integraciones', nombre: 'Integraciones', ruta: '/dashboard/configuracion/integraciones', categoria: 'sistema' },
  { id: 'categorias', nombre: 'Configuración de categorías', ruta: '/dashboard/configuracion/categorias', categoria: 'sistema' },
];

export default function BuscadorConfiguracion() {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<typeof opcionesConfiguracion>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const router = useRouter();

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusqueda(valor);
    
    if (valor.length > 1) {
      const filtrados = opcionesConfiguracion.filter(opcion => 
        opcion.nombre.toLowerCase().includes(valor.toLowerCase())
      );
      setResultados(filtrados);
      setMostrarResultados(true);
    } else {
      setResultados([]);
      setMostrarResultados(false);
    }
  };

  const handleSeleccionarResultado = (ruta: string) => {
    router.push(ruta);
    setMostrarResultados(false);
    setBusqueda('');
  };

  return (
    <div className="relative">
      <div className="flex items-center border rounded-lg overflow-hidden bg-white">
        <div className="px-3 text-neutral-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={busqueda}
          onChange={handleBusqueda}
          placeholder="Buscar configuración..."
          className="py-2 px-2 w-full focus:outline-none text-sm"
        />
      </div>

      {mostrarResultados && resultados.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border overflow-hidden z-10">
          <ul>
            {resultados.map((resultado) => (
              <li key={resultado.id}>
                <button 
                  onClick={() => handleSeleccionarResultado(resultado.ruta)}
                  className="block w-full text-left px-4 py-2 hover:bg-neutral-50 text-sm"
                >
                  <span className="font-medium">{resultado.nombre}</span>
                  <span className="text-xs text-neutral-500 ml-2">
                    {resultado.categoria}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {mostrarResultados && resultados.length === 0 && busqueda.length > 1 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border p-4 text-center text-sm text-neutral-500">
          No se encontraron configuraciones que coincidan con "{busqueda}"
        </div>
      )}
    </div>
  );
}
