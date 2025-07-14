'use client';

import { useState, useEffect } from 'react';
import { ProductoMenuDia } from './ProductoMenuDia';
import { toast } from 'sonner';

interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  categoriaId?: string;
  categoria_id?: string;
  categoria?: string;
  categoria_nombre?: string;
  imagen?: string;
  cantidad?: number;
  precio?: number;
}

interface MenuDia {
  id: string;
  fecha: string;
  nombre: string;
  estado?: string;
  productos: Producto[];
  fecha_creacion: string;
  fecha_actualizacion: string;
}

interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
}

export function MenuDiaSection() {
  const [menuDia, setMenuDia] = useState<MenuDia | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [todosLosProductos, setTodosLosProductos] = useState<Producto[]>([]);
  const [productosPorCategoria, setProductosPorCategoria] = useState<{[key: string]: Producto[]}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar el menú del día desde la API
  useEffect(() => {
    const cargarMenuDia = async () => {
      try {
        console.log('🔄 Cargando menú del día...');
        const response = await fetch('/api/menu-dia');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 Datos recibidos:', data);
        
        setMenuDia(data.menuDia);
        setCategorias(data.categorias || []);
        setTodosLosProductos(data.todosLosProductos || []);
        setProductosPorCategoria(data.productosPorCategoria || {});
        
      } catch (err) {
        console.error('❌ Error al cargar el menú del día:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el menú del día');
      } finally {
        setLoading(false);
      }
    };

    cargarMenuDia();
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

  // Agrupar productos por categoría usando el nombre de la categoría
  const getProductosPorCategoria = (nombreCategoria: string) => {
    if (!menuDia) return [];
    return menuDia.productos.filter(producto => 
      producto.categoria?.toLowerCase() === nombreCategoria.toLowerCase()
    );
  };

  // Obtener productos disponibles por categoría (no en el menú)
  const getProductosDisponiblesPorCategoria = (nombreCategoria: string) => {
    const productosEnMenu = menuDia?.productos.map(p => p.id) || [];
    const productosCategoria = productosPorCategoria[nombreCategoria.toLowerCase()] || [];
    return productosCategoria.filter(producto => !productosEnMenu.includes(producto.id));
  };

  // Obtener el emoji según la categoría
  const getEmojiCategoria = (nombreCategoria: string) => {
    switch (nombreCategoria.toLowerCase()) {
      case 'entradas': return '🍲';
      case 'principios': return '🍚';
      case 'proteinas': return '🍖';
      case 'acompañamientos': return '🥗';
      case 'bebidas': return '🥤';
      default: return '🍽️';
    }
  };

  // Función para agregar un producto al menú
  const handleAgregarProducto = async (producto: Producto) => {
    if (!menuDia) return;

    const productoConCantidad = {
      ...producto,
      cantidad: 1,
      categoriaId: producto.categoria_id || producto.categoriaId
    };

    const nuevosProductos = [...menuDia.productos, productoConCantidad];
    
    const nuevoMenuDia = {
      ...menuDia,
      productos: nuevosProductos,
      fecha_actualizacion: new Date().toISOString()
    };
    
    setMenuDia(nuevoMenuDia);
    toast.success(`${producto.nombre} agregado al menú`);
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
        {categorias.map((categoria) => {
          const productosEnCategoria = getProductosPorCategoria(categoria.nombre);
          const productosDisponibles = getProductosDisponiblesPorCategoria(categoria.nombre);
          
          return (
            <div key={categoria.id} className="bg-gray-50 p-3 rounded-md">
              <h3 className="font-medium mb-2 flex items-center gap-1">
                {getEmojiCategoria(categoria.nombre)} {categoria.nombre}
              </h3>
              
              {/* Productos en el menú */}
              <div className="space-y-1 mb-2">
                {productosEnCategoria.map(producto => (
                  <ProductoMenuDia
                    key={producto.id}
                    producto={{
                      ...producto,
                      categoriaId: producto.categoria_id || producto.categoriaId || categoria.id
                    }}
                    onRemove={handleRemoveProducto}
                    onCantidadChange={handleCantidadChange}
                  />
                ))}
                {productosEnCategoria.length === 0 && (
                  <div className="text-gray-400 text-sm py-1">
                    No hay productos seleccionados
                  </div>
                )}
              </div>
              
              {/* Productos disponibles para agregar */}
              {productosDisponibles.length > 0 && (
                <div className="border-t pt-2">
                  <p className="text-xs text-gray-500 mb-1">Disponibles:</p>
                  <div className="space-y-1">
                    {productosDisponibles.slice(0, 3).map(producto => (
                      <button
                        key={producto.id}
                        onClick={() => handleAgregarProducto(producto)}
                        className="w-full text-left text-xs p-1 rounded bg-white hover:bg-gray-100 border border-gray-200"
                      >
                        + {producto.nombre}
                      </button>
                    ))}
                    {productosDisponibles.length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{productosDisponibles.length - 3} más...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Información del menú */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center text-sm text-blue-700">
          <span>Productos en menú: {menuDia.productos.length}</span>
          <span>Caché: 5 min</span>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end space-x-2">
        <button 
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          onClick={async () => {
            try {
              const response = await fetch('/api/menu-dia', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  productos: menuDia.productos
                })
              });
              
              if (response.ok) {
                toast.success('Menú guardado correctamente');
              } else {
                toast.error('Error al guardar el menú');
              }
            } catch (error) {
              toast.error('Error al guardar el menú');
            }
          }}
        >
          Mantener Menu
        </button>
        <button 
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          onClick={async () => {
            try {
              const response = await fetch('/api/menu-dia', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  productos: menuDia.productos
                })
              });
              
              if (response.ok) {
                toast.success('Menú publicado correctamente');
              } else {
                toast.error('Error al publicar el menú');
              }
            } catch (error) {
              toast.error('Error al publicar el menú');
            }
          }}
        >
          Publicar Menu
        </button>
      </div>
    </div>
  );
}



























