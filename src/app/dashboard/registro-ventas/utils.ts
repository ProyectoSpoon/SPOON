// 🔧 UTILIDADES PARA REGISTRO DE VENTAS - SPOON
// Archivo: utils.ts

export interface CarritoItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  notas?: string;
}

// 📊 FUNCIÓN CALCULAR TOTAL
export const calcularTotal = (carrito: CarritoItem[]): number => {
  if (!carrito || !Array.isArray(carrito)) {
    return 0;
  }
  
  return carrito.reduce((total, item) => {
    const precio = parseFloat(item.precio?.toString()) || 0;
    const cantidad = parseInt(item.cantidad?.toString()) || 0;
    return total + (precio * cantidad);
  }, 0);
};

// 🛒 FUNCIÓN CALCULAR SUBTOTAL POR ITEM
export const calcularSubtotal = (item: CarritoItem): number => {
  const precio = parseFloat(item.precio?.toString()) || 0;
  const cantidad = parseInt(item.cantidad?.toString()) || 0;
  return precio * cantidad;
};

// 💰 FUNCIÓN FORMATEAR PRECIO
export const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio);
};

// 📝 FUNCIÓN VALIDAR CARRITO
export const validarCarrito = (carrito: CarritoItem[]) => {
  if (!carrito || carrito.length === 0) {
    return { esValido: false, mensaje: "El carrito está vacío" };
  }
  
  for (const item of carrito) {
    if (!item.precio || item.precio <= 0) {
      return { esValido: false, mensaje: `Precio inválido para ${item.nombre}` };
    }
    if (!item.cantidad || item.cantidad <= 0) {
      return { esValido: false, mensaje: `Cantidad inválida para ${item.nombre}` };
    }
  }
  
  return { esValido: true, mensaje: "Carrito válido" };
};

// ➕ FUNCIÓN AGREGAR AL CARRITO
export const agregarAlCarrito = (carrito: CarritoItem[], producto: any): CarritoItem[] => {
  const itemExistente = carrito.find(item => item.id === producto.id);
  
  if (itemExistente) {
    return carrito.map(item => {
      if (item.id === producto.id) {
        return { ...item, cantidad: item.cantidad + 1 };
      }
      return item;
    });
  } else {
    return [...carrito, { 
      id: producto.id,
      nombre: producto.nombre || producto.name,
      precio: parseFloat(producto.precio || producto.price),
      cantidad: 1,
      notas: producto.notas || ''
    }];
  }
};

// 🔄 FUNCIÓN ACTUALIZAR CANTIDAD
export const actualizarCantidadCarrito = (carrito: CarritoItem[], productId: string, nuevaCantidad: number): CarritoItem[] => {
  return carrito.map(item => {
    if (item.id === productId) {
      return { ...item, cantidad: Math.max(0, nuevaCantidad) };
    }
    return item;
  }).filter(item => item.cantidad > 0);
};

// 🗑️ FUNCIÓN REMOVER DEL CARRITO
export const removerDelCarrito = (carrito: CarritoItem[], productId: string): CarritoItem[] => {
  return carrito.filter(item => item.id !== productId);
};
