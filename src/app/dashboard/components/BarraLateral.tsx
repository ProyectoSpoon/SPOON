import { ElementType } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Menu,
  Clock,
  Users,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  LineChart,
  Bell,
  BarChart2,
  Utensils,
  Tags,
  FileText,
  Building2,
  Image,
  UserCog,
  History,
  Palette,
  ShoppingCart,
  Receipt,
  Package,
  Clipboard,
  FileStack,
  Calendar,
  Star,
  Award,
  ChefHat
} from 'lucide-react';
import { useState } from 'react';

// ✨ AGREGADO: Import de iconos Spoon Refined
import { ChefHatIcon, SalesAnalyticsIcon, RevenueIcon, OrderBellIcon, DashboardSpoonIcon, SettingsSpoonIcon, AuditSpoonIcon, HelpSpoonIcon } from '@/shared/components/icons';

interface SubElementoMenu {
  etiqueta: string;
  ruta: string;
  descripcion: string;
}

interface ElementoMenuProps {
  icono: ElementType;
  etiqueta: string;
  ruta?: string;
  descripcion: string;
  subElementos?: SubElementoMenu[];
}

const elementosMenu: ElementoMenuProps[] = [
{
  icono: DashboardSpoonIcon, // ✨ CAMBIADO: era Home
  etiqueta: 'Dashboard',
  ruta: '/dashboard',
  descripcion: 'Vista general del negocio'
},
  {
    icono: RevenueIcon, // ✨ CAMBIADO: era Receipt
    etiqueta: 'Registro de Ventas',
    ruta: '/dashboard/registro-ventas',
    descripcion: 'Registro de ventas diarias',  },
  {
    icono: OrderBellIcon, // ✨ CAMBIADO: era ChefHat
    etiqueta: 'Gestión de Órdenes',
    ruta: '/dashboard/gestion-ordenes',
    descripcion: 'Administrar comandas y estados de órdenes'
  },
  {
  icono: ChefHatIcon, // ✨ CAMBIADO: era Utensils
  etiqueta: 'Mi Menú Digital',
  descripcion: 'Gestión completa del menú - Producto gratuito principal',  // 🔄 Nueva descripción
  subElementos: [
    {
      etiqueta: 'Menú del Día',
      ruta: '/dashboard/carta/menu-dia',
      descripcion: 'Gestión diaria del menú'
    },
    {
      etiqueta: 'Combinaciones',  // 🔄 Renombrar
      ruta: '/dashboard/carta/combinaciones',
      descripcion: 'Crear y gestionar combinaciones'
    },
    {
      etiqueta: 'Platos Especiales',
      ruta: '/dashboard/carta/especiales',
      descripcion: 'Gestión de platos especiales'
    },
    {
      etiqueta: 'Platos Favoritos',
      ruta: '/dashboard/carta/favoritos',
      descripcion: 'Tus platos más populares'
    },
    {
      etiqueta: 'Programación Semanal',
      ruta: '/dashboard/carta/programacion-semanal',
      descripcion: 'Planifica tu menú semanal'
    }
  ]
},

{
  icono: SalesAnalyticsIcon, // ✨ CAMBIADO: era BarChart2
  etiqueta: 'Analytics & Insights',  // 🔄 Nuevo nombre
  descripcion: 'Inteligencia para optimizar tu negocio',  // 🔄 Nueva descripción
  subElementos: [
    {
      etiqueta: 'Análisis de Ventas',
      ruta: '/dashboard/estadisticas/analisis-ventas',
      descripcion: 'Análisis detallado de ventas'
    },
    {
      etiqueta: 'Rendimiento del Menú',  // 🔄 Quitar "de"
      ruta: '/dashboard/estadisticas/rendimiento-menu',
      descripcion: 'Qué platos funcionan mejor'  // 🔄 Descripción más clara
    },
    {
      etiqueta: 'Tendencias',
      ruta: '/dashboard/estadisticas/tendencias',
      descripcion: 'Patrones y proyecciones'  // 🔄 Nueva descripción
    },
    {
      etiqueta: 'Dashboard Estadísticas',  // 🔄 Nuevo item
      ruta: '/dashboard/estadisticas',
      descripcion: 'Vista general de métricas'
    }
  ]
},
{
  icono: SettingsSpoonIcon, // ✨ CAMBIADO: era Settings
  etiqueta: 'Configuración',
  descripcion: 'Configuración del restaurante',
  subElementos: [
    {
      etiqueta: 'Mi Restaurante',
      ruta: '/dashboard/configuracion',
      descripcion: 'Información general del restaurante'
    },
    {
      etiqueta: 'Horarios Comerciales',
      ruta: '/dashboard/configuracion/horario-comercial',
      descripcion: 'Gestión de horarios de atención'
    },
    {
      etiqueta: 'Usuarios y Roles',
      ruta: '/dashboard/configuracion/usuarios',
      descripcion: 'Gestión de usuarios del sistema'
    },
  ]
},
{
  icono: AuditSpoonIcon, // ✨ CAMBIADO: era FileText
  etiqueta: 'Auditoría',
  ruta: '/dashboard/auditoria',
  descripcion: 'Registro de actividades del sistema'
},
  {
    icono: HelpSpoonIcon, // ✨ CAMBIADO: era HelpCircle
    etiqueta: 'Ayuda',
    ruta: '/dashboard/ayuda',
    descripcion: 'Centro de ayuda'
  }
];

const ElementoMenu = ({ 
  icono: IconoComponente,
  etiqueta,
  ruta,
  descripcion,
  subElementos 
}: ElementoMenuProps) => {
  const pathname = usePathname();
  const [expandido, setExpandido] = useState(false);
  const tieneSubElementos = subElementos && subElementos.length > 0;
  const estaActivo = pathname === ruta || 
                    (tieneSubElementos && subElementos.some(sub => pathname === sub.ruta));

  const Contenido = () => (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        <IconoComponente className="mr-4 h-5 w-5" />
        <span className="text-sm">{etiqueta}</span>
      </div>
      {tieneSubElementos && (
        <motion.div
          animate={{ rotate: expandido ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.div>
      )}
    </div>
  );

  return (
    <div>
      {ruta && !tieneSubElementos ? (
        <Link
          href={ruta}
          className={`
            w-full flex items-center p-4 mx-4 rounded-lg cursor-pointer
            transition-all duration-300 ease-in-out
            ${estaActivo 
              ? 'bg-primary-light text-primary-dark font-semibold'
              : 'text-neutral-600 hover:bg-neutral-50 font-medium'}
          `}
          title={descripcion}
        >
          <Contenido />
        </Link>
      ) : (
        <motion.div
          onClick={() => setExpandido(!expandido)}
          className={`
            w-full flex items-center p-4 mx-4 rounded-lg cursor-pointer
            transition-all duration-300 ease-in-out
            ${estaActivo 
              ? 'bg-primary-light text-primary-dark font-semibold'
              : 'text-neutral-600 hover:bg-neutral-50 font-medium'}
          `}
        >
          <Contenido />
        </motion.div>
      )}

      <AnimatePresence>
        {tieneSubElementos && expandido && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="ml-14 overflow-hidden"
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              exit={{ y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="mt-1 space-y-1"
            >
              {subElementos.map((subElemento) => (
                <motion.div
                  key={subElemento.ruta}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Link
                    href={subElemento.ruta}
                    className={`
                      block px-4 py-2 rounded-lg text-sm
                      transition-all duration-300 ease-in-out
                      ${pathname === subElemento.ruta
                        ? 'text-primary-dark font-semibold'
                        : 'text-neutral-500 hover:text-neutral-800'}
                    `}
                    title={subElemento.descripcion}
                  >
                    {subElemento.etiqueta}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function BarraLateral() {
    return (
      <div className="w-[280px] bg-white border-r border-neutral-200 h-full relative">
        <div className="h-20 flex items-center justify-center border-b border-neutral-100">
          <h1 className="text-2xl font-bold text-primary-main">
            SPOON
          </h1>
        </div>

        <div className="space-y-1 py-4 overflow-y-auto h-[calc(100vh-5rem)]">
          {elementosMenu.map((elemento, index) => (
            <div key={elemento.ruta || index} className="w-full">
              <ElementoMenu {...elemento} />
            </div>
          ))}
        </div>
      </div>
    );
}