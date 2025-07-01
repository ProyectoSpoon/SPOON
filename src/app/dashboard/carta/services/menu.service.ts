// Servicio simulado para manejo de menús
// Reemplaza las funciones de Firebase con simulaciones

export interface MenuData {
  id: string;
  nombre: string;
  descripcion?: string;
  productos: string[];
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

class MenuService {
  private menus: MenuData[] = [];

  // Simular obtener menús
  async obtenerMenus(restaurantId: string): Promise<MenuData[]> {
    console.log('Obteniendo menús (simulación):', restaurantId);
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Datos de ejemplo
    const menusEjemplo: MenuData[] = [
      {
        id: 'menu_1',
        nombre: 'Menú Ejecutivo',
        descripcion: 'Menú completo para almuerzo ejecutivo',
        productos: ['prod_1', 'prod_2', 'prod_3'],
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      },
      {
        id: 'menu_2',
        nombre: 'Menú Vegetariano',
        descripcion: 'Opciones vegetarianas saludables',
        productos: ['prod_4', 'prod_5'],
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      }
    ];
    
    this.menus = menusEjemplo;
    return menusEjemplo;
  }

  // Simular crear menú
  async crearMenu(menuData: Omit<MenuData, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<MenuData> {
    console.log('Creando menú (simulación):', menuData);
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const nuevoMenu: MenuData = {
      ...menuData,
      id: `menu_${Date.now()}`,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };
    
    this.menus.push(nuevoMenu);
    return nuevoMenu;
  }

  // Simular actualizar menú
  async actualizarMenu(id: string, updates: Partial<MenuData>): Promise<MenuData> {
    console.log('Actualizando menú (simulación):', { id, updates });
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const menuIndex = this.menus.findIndex(m => m.id === id);
    if (menuIndex === -1) {
      throw new Error('Menú no encontrado');
    }
    
    const menuActualizado = {
      ...this.menus[menuIndex],
      ...updates,
      fechaActualizacion: new Date()
    };
    
    this.menus[menuIndex] = menuActualizado;
    return menuActualizado;
  }

  // Simular eliminar menú
  async eliminarMenu(id: string): Promise<void> {
    console.log('Eliminando menú (simulación):', id);
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const menuIndex = this.menus.findIndex(m => m.id === id);
    if (menuIndex === -1) {
      throw new Error('Menú no encontrado');
    }
    
    this.menus.splice(menuIndex, 1);
  }

  // Simular obtener menú por ID
  async obtenerMenuPorId(id: string): Promise<MenuData | null> {
    console.log('Obteniendo menú por ID (simulación):', id);
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const menu = this.menus.find(m => m.id === id);
    return menu || null;
  }

  // Simular activar/desactivar menú
  async toggleMenuActivo(id: string): Promise<MenuData> {
    console.log('Cambiando estado de menú (simulación):', id);
    
    const menu = await this.obtenerMenuPorId(id);
    if (!menu) {
      throw new Error('Menú no encontrado');
    }
    
    return this.actualizarMenu(id, { activo: !menu.activo });
  }

  // Simular agregar producto a menú
  async agregarProductoAMenu(menuId: string, productoId: string): Promise<MenuData> {
    console.log('Agregando producto a menú (simulación):', { menuId, productoId });
    
    const menu = await this.obtenerMenuPorId(menuId);
    if (!menu) {
      throw new Error('Menú no encontrado');
    }
    
    if (menu.productos.includes(productoId)) {
      throw new Error('El producto ya está en el menú');
    }
    
    const productosActualizados = [...menu.productos, productoId];
    return this.actualizarMenu(menuId, { productos: productosActualizados });
  }

  // Simular remover producto de menú
  async removerProductoDeMenu(menuId: string, productoId: string): Promise<MenuData> {
    console.log('Removiendo producto de menú (simulación):', { menuId, productoId });
    
    const menu = await this.obtenerMenuPorId(menuId);
    if (!menu) {
      throw new Error('Menú no encontrado');
    }
    
    const productosActualizados = menu.productos.filter(id => id !== productoId);
    return this.actualizarMenu(menuId, { productos: productosActualizados });
  }
}

// Exportar instancia singleton
export const menuService = new MenuService();
export default menuService;
