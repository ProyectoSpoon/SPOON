// dashboard/carta/menu-dia/components/ModalVerMenuDia.tsx

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/Button';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';
import { convertToVersionedProduct } from '../utils/menu-dia.utils';
import type { Producto } from '../types/menu-dia.types';

interface ModalVerMenuDiaProps {
  show: boolean;
  onClose: () => void;
  onProductoAgregado?: (producto: VersionedProduct) => void;
  restaurantId: string;
}

interface ProductoMenuDB {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoriaId: string;
  categoria: string;
  imagen?: string;
  cantidad: number;
}

interface MenuDiaDB {
  id: string;
  name: string;
  description: string;
  menu_date: string;
  status: string;
  productos: ProductoMenuDB[];
}

export function ModalVerMenuDia({ show, onClose, onProductoAgregado, restaurantId }: ModalVerMenuDiaProps) {
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [menuData, setMenuData] = useState<MenuDiaDB | null>(null);
  const [productosMenu, setProductosMenu] = useState<ProductoMenuDB[]>([]);
  const [todosLosProductos, setTodosLosProductos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');

  // Cargar menú desde PostgreSQL
  const cargarMenuDB = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando menú desde PostgreSQL...');
      
      const response = await fetch('/api/menu-dia');
      if (!response.ok) throw new Error('Error al cargar menú');
      
      const data = await response.json();
      
      if (data.menuDia) {
        setMenuData(data.menuDia);
        setProductosMenu(data.menuDia.productos || []);
        console.log('✅ Menú cargado:', data.menuDia.productos?.length || 0, 'productos');
      }
      
      setTodosLosProductos(data.todosLosProductos || []);
      
    } catch (error) {
      console.error('❌ Error al cargar menú:', error);
      toast.error('Error al cargar el menú del día');
    } finally {
      setLoading(false);
    }
  };

  // Guardar cambios en PostgreSQL
  const guardarCambios = async () => {
    try {
      setGuardando(true);
      console.log('💾 Guardando cambios en PostgreSQL...');
      
      // Preparar productos para guardar
      const productosParaGuardar = productosMenu.map(p => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio,
        categoriaId: p.categoriaId,
        cantidad: p.cantidad
      }));
      
      const response = await fetch('/api/menu-dia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productos: productosParaGuardar })
      });
      
      if (!response.ok) throw new Error('Error al guardar');
      
      toast.success('Menú guardado exitosamente');
      await cargarMenuDB(); // Recargar para confirmar
      
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  // Agregar producto al menú
  const agregarProducto = (producto: any) => {
    const productoExiste = productosMenu.find(p => p.id === producto.id);
    
    if (productoExiste) {
      toast.warning('El producto ya está en el menú');
      return;
    }
    
    const nuevoProducto: ProductoMenuDB = {
      id: producto.id,
      nombre: producto.nombre || producto.name,
      descripcion: producto.descripcion || producto.description || '',
      precio: producto.precio || producto.current_price || 0,
      categoriaId: producto.categoriaId || producto.category_id,
      categoria: producto.categoria_nombre || 'Sin categoría',
      imagen: producto.imagen || producto.image_url,
      cantidad: 1
    };
    
    setProductosMenu(prev => [...prev, nuevoProducto]);
    toast.success(`${nuevoProducto.nombre} agregado al menú`);
    
    // Notificar al componente padre si se proporciona callback
    if (onProductoAgregado) {
      try {
        const versionedProduct = convertToVersionedProduct({
          ...nuevoProducto,
          currentVersion: 1.0,
          stock: {
            currentQuantity: 1,
            minQuantity: 0,
            maxQuantity: 100,
            status: 'in_stock' as const,
            lastUpdated: new Date()
          },
          status: 'active' as const,
          priceHistory: [],
          versions: [],
          metadata: {
            createdAt: new Date(),
            createdBy: 'system',
            lastModified: new Date(),
            lastModifiedBy: 'system'
          }
        } as Producto);
        
        onProductoAgregado(versionedProduct);
      } catch (error) {
        console.warn('Error al convertir producto:', error);
      }
    }
  };

  // Eliminar producto del menú
  const eliminarProducto = (productoId: string) => {
    const producto = productosMenu.find(p => p.id === productoId);
    setProductosMenu(prev => prev.filter(p => p.id !== productoId));
    
    if (producto) {
      toast.success(`${producto.nombre} eliminado del menú`);
    }
  };

  // Actualizar cantidad
  const actualizarCantidad = (productoId: string, cantidad: number) => {
    if (cantidad < 1) cantidad = 1;
    
    setProductosMenu(prev => prev.map(p => 
      p.id === productoId ? { ...p, cantidad } : p
    ));
  };

  // Filtrar productos disponibles
  const productosDisponibles = todosLosProductos.filter(producto => {
    const coincideBusqueda = producto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            producto.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const coincideCategoria = !categoriaFilter || 
                             producto.categoriaId === categoriaFilter ||
                             producto.category_id === categoriaFilter;
    
    const noEstaEnMenu = !productosMenu.find(p => p.id === producto.id);
    
    return coincideBusqueda && coincideCategoria && noEstaEnMenu;
  });

  // Cargar al abrir el modal
  useEffect(() => {
    if (show) {
      cargarMenuDB();
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full h-5/6 flex flex-col mx-4">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Menú del Día</h2>
            <p className="text-sm text-gray-600">
              {menuData ? `${menuData.name} - ${menuData.menu_date}` : 'Gestionando menú diario'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Panel izquierdo - Productos disponibles */}
          <div className="w-1/2 border-r flex flex-col">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-700 mb-3">Productos Disponibles</h3>
              
              {/* Filtros */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <select
                  value={categoriaFilter}
                  onChange={(e) => setCategoriaFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas las categorías</option>
                  <option value="b4e792ba-b00d-4348-b9e3-f34992315c23">Entradas</option>
                  <option value="2d4c3ea8-843e-4312-821e-54d1c4e79dce">Principios</option>
                  <option value="342f0c43-7f98-48fb-b0ba-e4c5d3ee72b3">Proteínas</option>
                  <option value="a272bc20-464c-443f-9283-4b5e7bfb71cf">Acompañamientos</option>
                  <option value="6feba136-57dc-4448-8357-6f5533177cfd">Bebidas</option>
                </select>
              </div>
            </div>
            
            {/* Lista de productos disponibles */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-gray-600">Cargando productos...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {productosDisponibles.map(producto => (
                    <div key={producto.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">
                            {producto.nombre || producto.name}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">
                            {producto.descripcion || producto.description || 'Sin descripción'}
                          </p>
                          <p className="text-sm text-green-600 font-medium">
                            ${(producto.precio || 0).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => agregarProducto(producto)}
                          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {productosDisponibles.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No hay productos disponibles
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho - Productos en el menú */}
          <div className="w-1/2 flex flex-col">
            <div className="p-4 border-b bg-blue-50">
              <h3 className="font-semibold text-gray-700">
                Productos en el Menú ({productosMenu.length})
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {productosMenu.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay productos en el menú</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Agrega productos desde el panel izquierdo
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {productosMenu.map(producto => (
                    <div key={producto.id} className="border border-gray-200 rounded-lg p-3 bg-blue-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{producto.nombre}</h4>
                          <p className="text-sm text-gray-600 truncate">{producto.descripcion}</p>
                          <p className="text-sm text-green-600 font-medium">
                            ${(producto.precio || producto.precio || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">{producto.categoria}</p>
                        </div>
                        
                        <div className="ml-2 flex items-center space-x-2">
                          <div className="flex items-center">
                            <label className="text-xs text-gray-600 mr-1">Cant:</label>
                            <input
                              type="number"
                              min="1"
                              max="99"
                              value={producto.cantidad}
                              onChange={(e) => actualizarCantidad(producto.id, parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                            />
                          </div>
                          
                          <button
                            onClick={() => eliminarProducto(producto.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Eliminar producto"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {menuData && (
              <span>Estado: <span className="font-medium">{menuData.status}</span></span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={guardando}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={guardarCambios}
              disabled={guardando || productosMenu.length === 0}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}