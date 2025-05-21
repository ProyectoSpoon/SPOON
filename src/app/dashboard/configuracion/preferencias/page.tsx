'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Save } from 'lucide-react';

export default function PreferenciasPage() {
  const [preferencias, setPreferencias] = useState({
    modoCompacto: false,
    colorTema: 'naranja',
    moneda: 'COP',
    impuestoDefecto: 19,
    alertasInventario: true,
    alertasVentas: true,
    formatoFecha: 'DD/MM/YYYY',
    idiomaApp: 'es',
  });

  const handleChange = (key: string, value: any) => {
    setPreferencias({
      ...preferencias,
      [key]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para guardar preferencias en la base de datos
    alert('Preferencias guardadas correctamente');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Preferencias del Sistema</h1>
        <p className="text-neutral-600 mt-1">
          Personaliza el comportamiento y apariencia de la plataforma
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Apariencia */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Apariencia</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Modo compacto</h3>
                  <p className="text-sm text-neutral-500">Reduce espaciado para mostrar más contenido</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={preferencias.modoCompacto}
                    onChange={(e) => handleChange('modoCompacto', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F4821F]"></div>
                </label>
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Color del tema</label>
                <select 
                  value={preferencias.colorTema}
                  onChange={(e) => handleChange('colorTema', e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#F4821F] focus:border-[#F4821F]"
                >
                  <option value="naranja">Naranja (Predeterminado)</option>
                  <option value="azul">Azul</option>
                  <option value="verde">Verde</option>
                  <option value="morado">Morado</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Idioma</label>
                <select 
                  value={preferencias.idiomaApp}
                  onChange={(e) => handleChange('idiomaApp', e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#F4821F] focus:border-[#F4821F]"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Configuración Regional */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Configuración Regional</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block font-medium">Moneda</label>
                <select 
                  value={preferencias.moneda}
                  onChange={(e) => handleChange('moneda', e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#F4821F] focus:border-[#F4821F]"
                >
                  <option value="COP">Peso Colombiano (COP)</option>
                  <option value="USD">Dólar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="MXN">Peso Mexicano (MXN)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Formato de fecha</label>
                <select 
                  value={preferencias.formatoFecha}
                  onChange={(e) => handleChange('formatoFecha', e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#F4821F] focus:border-[#F4821F]"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Impuesto por defecto (%)</label>
                <input
                  type="number"
                  value={preferencias.impuestoDefecto}
                  onChange={(e) => handleChange('impuestoDefecto', parseInt(e.target.value))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#F4821F] focus:border-[#F4821F]"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </Card>

          {/* Notificaciones */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Notificaciones</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Alertas de inventario</h3>
                  <p className="text-sm text-neutral-500">Notificar cuando un producto esté por agotarse</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={preferencias.alertasInventario}
                    onChange={(e) => handleChange('alertasInventario', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F4821F]"></div>
                </label>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Alertas de ventas</h3>
                  <p className="text-sm text-neutral-500">Notificar sobre tendencias importantes de ventas</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={preferencias.alertasVentas}
                    onChange={(e) => handleChange('alertasVentas', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F4821F]"></div>
                </label>
              </div>
            </div>
          </Card>
          
          {/* Almacenamiento de datos */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Almacenamiento de datos</h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-700">Información sobre migración</h3>
                <p className="text-sm text-blue-600 mt-1">
                  El sistema ha sido migrado de Firebase a PostgreSQL para mejor rendimiento y escalabilidad.
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Limpieza automática de datos</h3>
                  <p className="text-sm text-neutral-500">Eliminar datos históricos mayores a 1 año</p>
                </div>
                <button className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-sm rounded hover:bg-neutral-200">
                  Configurar
                </button>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Exportar datos</h3>
                  <p className="text-sm text-neutral-500">Descarga una copia de respaldo de tus datos</p>
                </div>
                <button className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-sm rounded hover:bg-neutral-200">
                  Exportar
                </button>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            type="submit"
            className="flex items-center px-6 py-2 bg-[#F4821F] text-white rounded-lg hover:bg-[#E77918]"
          >
            <Save className="mr-2 h-4 w-4" />
            Guardar preferencias
          </button>
        </div>
      </form>
    </div>
  );
}
