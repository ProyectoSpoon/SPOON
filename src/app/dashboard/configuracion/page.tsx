'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/Tabs';
import { Card } from '@/shared/components/ui/Card';
import { 
  Settings, Users, Clock, Store, Receipt, Bell, Shield,
  Globe, CreditCard, Smartphone, Image, Layers
} from 'lucide-react';
import Link from 'next/link';
import BuscadorConfiguracion from './components/BuscadorConfiguracion';
import AsistenteConfiguracion from './components/AsistenteConfiguracion';

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = React.useState("general");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-neutral-600 mt-1">
            Gestiona todos los aspectos de tu restaurante
          </p>
        </div>
        <div className="w-64">
          <BuscadorConfiguracion />
        </div>
      </div>

      <AsistenteConfiguracion />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="negocio">Negocio</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios y Permisos</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
        </TabsList>

        {/* Pestaña General */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ConfigCard 
              title="Información Básica"
              description="Datos generales de tu restaurante"
              icon={<Store />}
              href="/dashboard/restaurante/info"
            />
            <ConfigCard 
              title="Horarios Comerciales"
              description="Configura días y horas de operación"
              icon={<Clock />}
              href="/dashboard/horario-comercial"
            />
            <ConfigCard 
              title="Imagen y Branding"
              description="Logotipos, colores y estilo visual"
              icon={<Image />}
              href="/dashboard/configuracion/branding"
            />
          </div>
        </TabsContent>

        {/* Pestaña Negocio */}
        <TabsContent value="negocio" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ConfigCard 
              title="Métodos de Pago"
              description="Configura las formas de pago aceptadas"
              icon={<CreditCard />}
              href="/dashboard/configuracion/pagos"
            />
            <ConfigCard 
              title="Impuestos y Facturación"
              description="Configuración de impuestos y facturación"
              icon={<Receipt />}
              href="/dashboard/configuracion/facturacion"
            />
            <ConfigCard 
              title="Zonas de Entrega"
              description="Gestiona áreas de servicio y costos"
              icon={<Globe />}
              href="/dashboard/configuracion/zonas"
            />
          </div>
        </TabsContent>

        {/* Pestaña Usuarios */}
        <TabsContent value="usuarios" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ConfigCard 
              title="Gestión de Usuarios"
              description="Administra empleados y cuentas"
              icon={<Users />}
              href="/dashboard/usuarios"
            />
            <ConfigCard 
              title="Roles y Permisos"
              description="Configura niveles de acceso"
              icon={<Shield />}
              href="/dashboard/usuarios/roles"
            />
          </div>
        </TabsContent>

        {/* Pestaña Sistema */}
        <TabsContent value="sistema" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ConfigCard 
              title="Notificaciones"
              description="Configura alertas y mensajes"
              icon={<Bell />}
              href="/dashboard/configuracion/notificaciones"
            />
            <ConfigCard 
              title="Preferencias de Sistema"
              description="Ajustes generales de la plataforma"
              icon={<Settings />}
              href="/dashboard/configuracion/preferencias"
            />
            <ConfigCard 
              title="Integraciones"
              description="Conecta con servicios externos"
              icon={<Smartphone />}
              href="/dashboard/configuracion/integraciones"
            />
            <ConfigCard 
              title="Categorías"
              description="Configura categorías y subcategorías"
              icon={<Layers />}
              href="/dashboard/configuracion/categorias"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Configuraciones Recientes */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-4">Configuraciones Recientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Aquí irían las configuraciones visitadas recientemente */}
          <RecentConfigItem
            title="Horarios Comerciales"
            path="/dashboard/horario-comercial"
            accessedAt="Hace 2 horas"
          />
          <RecentConfigItem
            title="Roles y Permisos"
            path="/dashboard/usuarios/roles"
            accessedAt="Hace 1 día"
          />
        </div>
      </div>
    </div>
  );
}

// Componente de tarjeta de configuración
interface ConfigCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

function ConfigCard({ title, description, icon, href }: ConfigCardProps) {
  return (
    <Link href={href}>
      <Card className="p-6 hover:bg-neutral-50 transition-colors cursor-pointer border-2 border-transparent hover:border-[#F4821F]/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-md bg-[#FFF4E6]">
            <div className="text-[#F4821F]">{icon}</div>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800">{title}</h3>
            <p className="text-sm text-neutral-600 mt-1">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Componente de configuración reciente
interface RecentConfigItemProps {
  title: string;
  path: string;
  accessedAt: string;
}

function RecentConfigItem({ title, path, accessedAt }: RecentConfigItemProps) {
  return (
    <Link href={path}>
      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neutral-100 rounded">
            <Settings className="w-4 h-4 text-neutral-500" />
          </div>
          <span className="font-medium text-neutral-700">{title}</span>
        </div>
        <div className="text-xs text-neutral-500">{accessedAt}</div>
      </div>
    </Link>
  );
}
