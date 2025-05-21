'use client';

import { useState, useEffect } from 'react';
import { ProductoMenuDia } from './ProductoMenuDia';
import { toast } from 'sonner';

interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  categoriaId: string;
  imagen?: string;
  cantidad?: number;
}

interface MenuDia {
  id: string;
  fecha: string;
  nombre: string;
  estado: string;
  productos: Producto[];
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export function MenuDiaSection() {
  const [menuDia, setMenuDia] = useState<MenuDia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar el menú del día desde localStorage
  useEffect(() => {
    try {
      const menuDiaData = localStorage.getItem('menu_dia');
      if (menuDiaData) {
        setMenuDia(JSON.parse(menuDiaData));
      } else {
        setError('No se encontró el menú del día');
      }
    } catch (err) {
      console.error('Error al cargar el menú del día:', err);
      setError('Error al cargar el menú del día');
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para eliminar un producto del menú
  const handleRemoveProducto = (id: string) => {
    if (!menuDia) return;

    const nuevosProductos = menuDia.productos.filter(producto => producto.id !== id);
    
    const nuevoMenuDia = {
      ...menuDia,
      productos: nuevosProductos,
      fecha_actualizacion: new Date().toISOString()
    };
    
    setMenuDia(nuevoMenuDia);
    
    // Guardar en localStorage
    localStorage.setItem('menu_dia', JSON.stringify(nuevoMenuDia));
    
    toast.success('Producto eliminado del menú');
  };

  // Función para actualizar la cantidad de un producto
  const handleCantidadChange = (id: string, nuevaCantidad: number) => {
    if (!menuDia) return;

    const nuevosProductos = menuDia.productos.map(producto => 
      producto.id === id 
        ? { ...producto, cantidad: nuevaCantidad }
        : producto
    );
    
    const nuevoMenuDia = {
      ...menuDia,
      productos: nuevosProductos,
      fecha_actualizacion: new Date().toISOString()
    };
    
    setMenuDia(nuevoMenuDia);
    
    // Guardar en localStorage
    localStorage.setItem('menu_dia', JSON.stringify(nuevoMenuDia));
    
    // No mostrar toast para no interrumpir la experiencia del usuario
  };

  // Agrupar productos por categoría
  const getProductosPorCategoria = (categoriaId: string) => {
    if (!menuDia) return [];
    return menuDia.productos.filter(producto => producto.categoriaId === categoriaId);
  };

  // Obtener el título según la categoría
  const getTituloCategoria = (categoriaId: string) => {
    switch (categoriaId) {
      case 'CAT_001': return '🍲 Entradas';
      case 'CAT_002': return '🍚 Principio';
      case 'CAT_003': return '🍖 Proteína';
      case 'CAT_004': return '🥗 Acompañamientos';
      case 'CAT_005': return '🥤 Bebida';
      default: return 'Otros';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando menú del día...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (!menuDia) {
    return <div className="text-center py-4">No hay menú del día disponible</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-xl font-semibold mb-4">Menu del Día</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Entradas */}
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="font-medium mb-2">{getTituloCategoria('CAT_001')}</h3>
          <div className="space-y-1">
            {getProductosPorCategoria('CAT_001').map(producto => (
              <ProductoMenuDia
                key={producto.id}
                producto={producto}
                onRemove={handleRemoveProducto}
                onCantidadChange={handleCantidadChange}
              />
            ))}
            {getProductosPorCategoria('CAT_001').length === 0 && (
              <div className="text-gray-400 text-sm py-1">No hay entradas</div>
            )}
          </div>
        </div>
        
        {/* Principio */}
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="font-medium mb-2">{getTituloCategoria('CAT_002')}</h3>
          <div className="space-y-1">
            {getProductosPorCategoria('CAT_002').map(producto => (
              <ProductoMenuDia
                key={producto.id}
                producto={producto}
                onRemove={handleRemoveProducto}
                onCantidadChange={handleCantidadChange}
              />
            ))}
            {getProductosPorCategoria('CAT_002').length === 0 && (
              <div className="text-gray-400 text-sm py-1">No hay principios</div>
            )}
          </div>
        </div>
        
        {/* Proteína */}
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="font-medium mb-2">{getTituloCategoria('CAT_003')}</h3>
          <div className="space-y-1">
            {getProductosPorCategoria('CAT_003').map(producto => (
              <ProductoMenuDia
                key={producto.id}
                producto={producto}
                onRemove={handleRemoveProducto}
                onCantidadChange={handleCantidadChange}
              />
            ))}
            {getProductosPorCategoria('CAT_003').length === 0 && (
              <div className="text-gray-400 text-sm py-1">No hay proteínas</div>
            )}
          </div>
        </div>
        
        {/* Acompañamientos */}
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="font-medium mb-2">{getTituloCategoria('CAT_004')}</h3>
          <div className="space-y-1">
            {getProductosPorCategoria('CAT_004').map(producto => (
              <ProductoMenuDia
                key={producto.id}
                producto={producto}
                onRemove={handleRemoveProducto}
                onCantidadChange={handleCantidadChange}
              />
            ))}
            {getProductosPorCategoria('CAT_004').length === 0 && (
              <div className="text-gray-400 text-sm py-1">No hay acompañamientos</div>
            )}
          </div>
        </div>
        
        {/* Bebida */}
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="font-medium mb-2">{getTituloCategoria('CAT_005')}</h3>
          <div className="space-y-1">
            {getProductosPorCategoria('CAT_005').map(producto => (
              <ProductoMenuDia
                key={producto.id}
                producto={producto}
                onRemove={handleRemoveProducto}
                onCantidadChange={handleCantidadChange}
              />
            ))}
            {getProductosPorCategoria('CAT_005').length === 0 && (
              <div className="text-gray-400 text-sm py-1">No hay bebidas</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end space-x-2">
        <button 
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          onClick={() => {
            toast.success('Menú guardado correctamente');
          }}
        >
          Mantener Menu
        </button>
        <button 
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          onClick={() => {
            toast.success('Menú publicado correctamente');
          }}
        >
          Publicar Menu
        </button>
      </div>
    </div>
  );
}
