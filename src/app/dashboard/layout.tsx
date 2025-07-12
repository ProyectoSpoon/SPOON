'use client';

import BarraLateral from './components/BarraLateral';
import { NotificationProvider } from '@/shared/Context/notification-context';
import { NotificationCenter } from '@/shared/components/ui/NotificationCenter';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <div className="h-screen flex overflow-hidden bg-gray-50">
        {/* Barra lateral */}
        <BarraLateral />
        
        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header con notificaciones */}
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
              <p className="text-sm text-gray-600">Sistema de gestión SPOON</p>
            </div>
            
            {/* Centro de notificaciones */}
            <div className="flex items-center gap-4">
              <NotificationCenter />
              
              {/* Usuario (opcional) */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-main rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
                <span className="text-sm text-gray-700">Usuario</span>
              </div>
            </div>
          </header>
          
          {/* Contenido de la página */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
