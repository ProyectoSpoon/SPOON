'use client';

import { useState, useEffect } from 'react';
import { InventarioHeader } from './components/InventarioHeader';
import { TarjetaPlato } from './components/TarjetaPlato';
import { ModalVenta } from './components/ModalVenta';
import { useVentasDia } from './hooks/useVentasDia';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';
import { CacheTimer } from '@/shared/components/ui/CacheTimer/cacheTimer';
import { Loader2, Search, ChevronDown, Filter, LayoutGrid, LayoutList, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Plato, Adicional } from './types/ventasdia.types';

export default function VentasDiaPage() {
  // Estados
  const [modalVentaOpen, setModalVentaOpen] = useState(false);
  const [platoSeleccionado, setPlatoSeleccionado] = useState<Plato | null>(null);
  const [vistaGrid, setVistaGrid] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const [userId, setUserId] = useState('user-1'); // En un entorno real, esto vendría de un contexto de autenticación

  // Hook principal
  const { 
    platos, 
    productosAdicionales,
    loading, 
    error, 
    registrarVenta,
    categorias
  } = useVentasDia();

  // Manejadores
  const handleRegistrarVenta = (platoId: string) => {
    const plato = platos.find(p => p.id === platoId);
    if (plato) {
      setPlatoSeleccionado(plato);
      setModalVentaOpen(true);
    }
  };

  const handleConfirmarVenta = async (
    platoId: string, 
    cantidad: number, 
    adicionales: Adicional[]
  ) => {
    const resultado = await registrarVenta(platoId, cantidad, adicionales);
    if (resultado) {
      setModalVentaOpen(false);
      setPlatoSeleccionado(null);
    }
    return resultado;
  };
  
  // Filtrar platos según la búsqueda y categoría
  const platosFiltrados = platos.filter(plato => {
    const matchesSearch = searchTerm === '' || 
      plato.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plato.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = filtroCategoria === null || 
      plato.categoriaId === filtroCategoria;
    
    return matchesSearch && matchesCategoria;
  });

  // Generar efecto de animación cuando cambian los filtros
  useEffect(() => {
    setAnimateCards(true);
    const timer = setTimeout(() => setAnimateCards(false), 100);
    return () => clearTimeout(timer);
  }, [searchTerm, filtroCategoria, vistaGrid]);

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#F4821F] mx-auto mb-4" />
          <p className="text-neutral-600 animate-pulse">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-neutral-50"
    >
      {/* Header */}
      <InventarioHeader />
      
      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Timer del caché */}
        <div className="mb-6">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#F4821F]" />
                <span className="text-sm font-medium text-neutral-600">
                  Tiempo restante del menú actual:
                </span>
              </div>
              <CacheTimer />
            </div>
          </motion.div>
        </div>

        {/* Buscador y Filtros */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Buscador */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar platos por nombre o descripción..."
                className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F4821F] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Selector de categoría */}
            <div className="flex space-x-3">
              <div className="relative min-w-[200px]">
                <select
                  className="appearance-none w-full p-2.5 pl-4 pr-10 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4821F]"
                  value={filtroCategoria || ''}
                  onChange={(e) => setFiltroCategoria(e.target.value === '' ? null : e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {categorias?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              {/* Botones de vista */}
              <div className="flex space-x-2 border border-gray-200 rounded-lg overflow-hidden bg-white">
                <button
                  className={`p-2.5 ${vistaGrid ? 'bg-[#FFF9F2] text-[#F4821F]' : 'text-gray-500 hover:bg-gray-100'}`}
                  onClick={() => setVistaGrid(true)}
                  title="Vista de cuadrícula"
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  className={`p-2.5 ${!vistaGrid ? 'bg-[#FFF9F2] text-[#F4821F]' : 'text-gray-500 hover:bg-gray-100'}`}
                  onClick={() => setVistaGrid(false)}
                  title="Vista de lista"
                >
                  <LayoutList className="h-5 w-5" />
                </button>
              </div>
              
              {/* Botón de filtros avanzados */}
              <button
                onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border 
                  ${mostrarFiltrosAvanzados 
                    ? 'bg-[#FFF9F2] text-[#F4821F] border-[#F4821F]' 
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
              >
                <Filter className="h-5 w-5" />
                <span className="hidden sm:inline">Filtros</span>
              </button>
            </div>
          </div>
          
          {/* Filtros avanzados expandibles */}
          <AnimatePresence>
            {mostrarFiltrosAvanzados && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-white p-4 rounded-lg border border-gray-200 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Rango de precios */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rango de precios</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Mín"
                          className="flex-1 p-2 rounded border focus:outline-none focus:ring-1 focus:ring-[#F4821F]"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          placeholder="Máx"
                          className="flex-1 p-2 rounded border focus:outline-none focus:ring-1 focus:ring-[#F4821F]"
                        />
                      </div>
                    </div>
                    
                    {/* Disponibilidad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidad</label>
                      <select className="w-full p-2 rounded border focus:outline-none focus:ring-1 focus:ring-[#F4821F]">
                        <option value="todos">Todos los platos</option>
                        <option value="disponibles">Solo disponibles</option>
                        <option value="agotados">Mostrar agotados</option>
                      </select>
                    </div>
                    
                    {/* Ordenar por */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                      <select className="w-full p-2 rounded border focus:outline-none focus:ring-1 focus:ring-[#F4821F]">
                        <option value="nombre_asc">Nombre (A-Z)</option>
                        <option value="nombre_desc">Nombre (Z-A)</option>
                        <option value="precio_asc">Precio (menor a mayor)</option>
                        <option value="precio_desc">Precio (mayor a menor)</option>
                        <option value="popularidad">Popularidad</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <button className="px-4 py-2 bg-[#F4821F] text-white rounded hover:bg-[#E67E1C] transition-colors">
                      Aplicar filtros
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Contador de resultados */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {platosFiltrados.length === 0 ? (
              "No se encontraron platos"
            ) : (
              `Mostrando ${platosFiltrados.length} ${platosFiltrados.length === 1 ? 'plato' : 'platos'}`
            )}
          </p>
        </div>

        {/* Grid de Platos */}
        {platosFiltrados.length > 0 ? (
          <motion.div 
            variants={container}
            initial="hidden"
            animate={animateCards ? "hidden" : "show"}
            className={vistaGrid 
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
              : "space-y-4"
            }
          >
            {platosFiltrados.map(plato => (
              <TarjetaPlato
                key={plato.id}
                plato={plato}
                onRegistrarVenta={handleRegistrarVenta}
                vistaLista={!vistaGrid}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300"
          >
            <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-xl font-medium text-gray-600 mb-2">No se encontraron resultados</p>
            <p className="text-gray-500 max-w-md mx-auto">
              No se encontraron platos que coincidan con tu búsqueda. Intenta modificar los filtros o utiliza otros términos de búsqueda.
            </p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setFiltroCategoria(null);
                setMostrarFiltrosAvanzados(false);
              }}
              className="mt-4 px-4 py-2 bg-white text-[#F4821F] border border-[#F4821F] rounded-lg hover:bg-[#FFF9F2] transition-colors"
            >
              Limpiar filtros
            </button>
          </motion.div>
        )}
      </div>

      {/* Modal de Venta */}
      {modalVentaOpen && platoSeleccionado && (
        <ModalVenta
          plato={platoSeleccionado}
          productosAdicionales={productosAdicionales}
          onClose={() => {
            setModalVentaOpen(false);
            setPlatoSeleccionado(null);
          }}
          onConfirm={handleConfirmarVenta}
          userId={userId}
        />
      )}
    </motion.div>
  );
}
