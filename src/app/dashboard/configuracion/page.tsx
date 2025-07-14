// src/app/dashboard/configuracion/page.tsx
'use client';

import { useState } from 'react';
import { Settings, Clock, Info, Users, Bell, Calendar } from 'lucide-react';
// Importación dinámica para evitar problemas de TypeScript
import dynamic from 'next/dynamic';
const HorariosComerciales = dynamic(() => import('./components/HorariosComerciales'), {
  loading: () => <p>Cargando...</p>,
  ssr: false
});
const InformacionGeneral = dynamic(() => import('./components/InformacionGeneral'), {
  loading: () => <p>Cargando...</p>,
  ssr: false
});
const RolesUsuarios = dynamic(() => import('./components/RolesUsuarios'), {
  loading: () => <p>Cargando...</p>,
  ssr: false
});

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('empresa');

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Settings className="h-6 w-6 mr-2 text-spoon-primary" />
        <h1 className="text-2xl font-bold text-[var(--spoon-neutral-800)]">
          Configuración del Sistema
        </h1>
      </div>

      {/* Pestañas de configuración */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('empresa')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'empresa'
              ? 'border-spoon-primary text-spoon-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Info className="h-4 w-4" />
          <span>Información General</span>
        </button>
        
        <button
          onClick={() => setActiveTab('horarios')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'horarios'
              ? 'border-spoon-primary text-spoon-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Horarios Comerciales</span>
        </button>
        
        <button
          onClick={() => setActiveTab('eventos')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'eventos'
              ? 'border-spoon-primary text-spoon-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Eventos Especiales y Festivos</span>
        </button>
        
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'usuarios'
              ? 'border-spoon-primary text-spoon-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Roles y Usuarios</span>
        </button>
        
        <button
          onClick={() => setActiveTab('notificaciones')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'notificaciones'
              ? 'border-spoon-primary text-spoon-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Notificaciones</span>
        </button>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === 'empresa' && <InformacionGeneral />}
        {activeTab === 'horarios' && <HorariosComerciales />}
        {activeTab === 'eventos' && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-spoon-primary" />
                Eventos Especiales y Festivos
              </h3>
              <p className="text-gray-600 mt-2">
                Gestiona días festivos, eventos especiales y fechas importantes para tu restaurante
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Días Festivos */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-500" />
                  Días Festivos Oficiales
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="text-sm text-gray-700">Año Nuevo</span>
                    <span className="text-xs text-gray-500">1 Enero</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="text-sm text-gray-700">Día de los Reyes Magos</span>
                    <span className="text-xs text-gray-500">6 Enero</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="text-sm text-gray-700">Día de San José</span>
                    <span className="text-xs text-gray-500">19 Marzo</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="text-sm text-gray-700">Jueves Santo</span>
                    <span className="text-xs text-gray-500">Variable</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="text-sm text-gray-700">Viernes Santo</span>
                    <span className="text-xs text-gray-500">Variable</span>
                  </div>
                </div>
                <button className="mt-3 text-sm text-spoon-primary hover:text-spoon-primary-dark font-medium">
                  Ver todos los festivos →
                </button>
              </div>

              {/* Eventos Especiales */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Eventos Especiales
                  </h4>
                  <button className="text-sm text-spoon-primary hover:text-spoon-primary-dark font-medium">
                    + Agregar
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <div>
                      <span className="text-sm text-gray-700 block">Día de San Valentín</span>
                      <span className="text-xs text-gray-500">Menú especial romántico</span>
                    </div>
                    <span className="text-xs text-gray-500">14 Feb</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <div>
                      <span className="text-sm text-gray-700 block">Día de la Madre</span>
                      <span className="text-xs text-gray-500">Promoción especial</span>
                    </div>
                    <span className="text-xs text-gray-500">12 Mayo</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <div>
                      <span className="text-sm text-gray-700 block">Aniversario Restaurante</span>
                      <span className="text-xs text-gray-500">Celebración anual</span>
                    </div>
                    <span className="text-xs text-gray-500">15 Sep</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Próximos Eventos */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                Próximos Eventos (Próximos 30 días)
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">Día de la Independencia</span>
                      <span className="text-xs text-gray-500 block">Horarios especiales</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">20 Jul</span>
                    <span className="text-xs text-gray-500 block">En 9 días</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">Festival Gastronómico</span>
                      <span className="text-xs text-gray-500 block">Evento promocional</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">25 Jul</span>
                    <span className="text-xs text-gray-500 block">En 14 días</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración de Horarios Especiales */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                Configuración de Horarios Especiales
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Horarios en Festivos</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
                    <option>Cerrado</option>
                    <option>Horario reducido (12:00 - 18:00)</option>
                    <option>Horario normal</option>
                    <option>Horario extendido</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Notificaciones</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
                    <option>7 días antes</option>
                    <option>3 días antes</option>
                    <option>1 día antes</option>
                    <option>El mismo día</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-spoon-primary text-white rounded-md text-sm hover:bg-spoon-primary-dark">
                  Guardar Configuración
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50">
                  Restaurar Defaults
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'usuarios' && <RolesUsuarios />}
        {activeTab === 'notificaciones' && (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">Configuración de Notificaciones</h3>
            <p className="text-gray-400 mt-2">Esta sección está en desarrollo</p>
            <div className="mt-4 text-sm text-gray-400">
              <p>• Notificaciones de pedidos</p>
              <p>• Alertas de inventario</p>
              <p>• Recordatorios de eventos</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Nota informativa sobre gestión de menús */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-blue-500 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Gestión de Menús</h4>
            <p className="text-sm text-blue-600 mt-1">
              Para gestionar categorías y productos del menú, ve a la sección 
              <span className="font-medium"> Dashboard → Carta</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}























