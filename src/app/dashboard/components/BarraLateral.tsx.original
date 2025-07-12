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
  Award
} from 'lucide-react';
import { useState } from 'react';

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
    icono: Home,
    etiqueta: 'Visión General',
    ruta: '',
    descripcion: 'Dashboard principal',
    subElementos: [
      {
        etiqueta: 'Resumen de ventas',
        ruta: '/dashboard/vision-general/resumenventas', 
        descripcion: 'Resumen de ventas'
      },
      {
        etiqueta: 'Ventas día',
        ruta: '/dashboard/vision-general/ventasdia',
        descripcion: 'Control de ventas diarias'
      },
      {
        etiqueta: 'Notificaciones',
        ruta: '/dashboard/vision-general/notificaciones',
        descripcion: 'Centro de notificaciones'
      }
    ]
  },
  {
    icono: Receipt,
    etiqueta: 'Registro de Ventas',
    ruta: '/dashboard/registro-ventas',
    descripcion: 'Registro de ventas diarias',
  },
  {
    icono: Menu,
    etiqueta: 'Gestión del Menú',
    ruta: '/dashboard/carta/menu-dia',
    descripcion: 'Gestión del menú',
    subElementos: [
      {
        etiqueta: 'Menú del Día',
        ruta: '/dashboard/carta/menu-dia',
        descripcion: 'Gestión del menú diario'
      },
      {
        etiqueta: 'Platos Favoritos',
        ruta: '/dashboard/carta/favoritos',
        descripcion: 'Gestión de platos favoritos'
      },
      {
        etiqueta: 'Platos Especiales',
        ruta: '/dashboard/carta/especiales',
        descripcion: 'Gestión de platos especiales'
      },
      {
        etiqueta: 'Combinaciones Existentes',
        ruta: '/dashboard/carta/combinaciones',
        descripcion: 'Combinaciones del menú del día'
      },
      {
        etiqueta: 'Programación Semanal',
        ruta: '/dashboard/carta/programacion-semanal',
        descripcion: 'Programación del menú semanal'
      }
    ]
  },

  {
    icono: BarChart2,
    etiqueta: 'Estadísticas',
    ruta: '/dashboard/estadisticas',
    descripcion: 'Estadística',
    subElementos: [
      {
        etiqueta: 'Análisis de Ventas',
        ruta: '/dashboard/estadisticas/analisis-ventas',
        descripcion: 'Análisis detallado de ventas'
      },
      {
        etiqueta: 'Rendimiento de Menú',
        ruta: '/dashboard/estadisticas/rendimiento-menu',
        descripcion: 'Desempeño por categorías y platos'
      },
      {
        etiqueta: 'Platos más vendidos',
        ruta: '/dashboard/estadisticas/platosvendidos',
        descripcion: 'Análisis de platos más vendidos'
      },
      {
        etiqueta: 'Tendencias',
        ruta: '/dashboard/estadisticas/tendencias',
        descripcion: 'Análisis de patrones y tendencias'
      }
    ]
  },
  {
    icono: Settings,
    etiqueta: 'Configuración',
    ruta: '/dashboard/configuracion',
    descripcion: 'Configuración de horarios comerciales'
  },
  {
    icono: HelpCircle,
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
