'use client';

import { useState } from 'react';
import { Settings, Clock, Info, Users, Utensils, Bell } from 'lucide-react';
// Importación dinámica para evitar problemas de TypeScript
import dynamic from 'next/dynamic';
const HorariosComerciales = dynamic(() => import('./components/HorariosComerciales'), {
  loading: () => <p>Cargando...</p>,
  ssr: false
});
const TiposCategoriasMenu = dynamic(() => import('./components/TiposCategoriasMenu'), {
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
  const [activeTab, setActiveTab] = useState('horarios');

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Settings className="h-6 w-6 mr-2 text-[#F4821F]" />
        <h1 className="text-2xl font-bold text-[var(--spoon-neutral-800)]">
          Configuración del Sistema
        </h1>
      </div>

      {/* Pestañas de configuración */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('horarios')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'horarios'
              ? 'border-[#F4821F] text-[#F4821F]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Horarios Comerciales</span>
        </button>
        
        <button
          onClick={() => setActiveTab('notificaciones')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'notificaciones'
              ? 'border-[#F4821F] text-[#F4821F]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Notificaciones</span>
        </button>
        
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'menu'
              ? 'border-[#F4821F] text-[#F4821F]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Utensils className="h-4 w-4" />
          <span>Menú</span>
        </button>
        
        <button
          onClick={() => setActiveTab('empresa')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'empresa'
              ? 'border-[#F4821F] text-[#F4821F]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Info className="h-4 w-4" />
          <span>Empresa</span>
        </button>
        
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'usuarios'
              ? 'border-[#F4821F] text-[#F4821F]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Usuarios</span>
        </button>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === 'horarios' && <HorariosComerciales />}
        {activeTab === 'notificaciones' && (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">Configuración de Notificaciones</h3>
            <p className="text-gray-400 mt-2">Esta sección está en desarrollo</p>
          </div>
        )}
        {activeTab === 'menu' && <TiposCategoriasMenu />}
        {activeTab === 'empresa' && <InformacionGeneral />}
        {activeTab === 'usuarios' && <RolesUsuarios />}
      </div>
    </div>
  );
}
