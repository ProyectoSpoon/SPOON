// src/firebase/services/index.ts

import { FirebaseCrud } from '../utils/crud.utils';
import { 
  IEmpresa, 
  IRestaurante, 
  IProducto,
  ICombinacion,
  IMenuDiario,
  IVenta,
  COLLECTIONS 
} from '../types/collections.types';

// Servicio para Empresas
export class EmpresaService extends FirebaseCrud<IEmpresa> {
  constructor() {
    super(COLLECTIONS.EMPRESAS);
  }

  async getByNit(nit: string) {
    const empresas = await this.query({
      where: [{ field: 'nit', operator: '==', value: nit }],
      limit: 1
    });
    return empresas[0] || null;
  }

  async getActiveEmpresas() {
    return this.query({
      where: [{ field: 'estado', operator: '==', value: 'activo' }],
      orderBy: [{ field: 'nombre' }]
    });
  }
}

// Servicio para Restaurantes
export class RestauranteService extends FirebaseCrud<IRestaurante> {
  constructor() {
    super(COLLECTIONS.RESTAURANTES);
  }

  async getByEmpresa(empresaId: string) {
    return this.query({
      where: [{ field: 'empresaId', operator: '==', value: empresaId }],
      orderBy: [{ field: 'nombre' }]
    });
  }

  async getActiveRestaurantes(empresaId: string) {
    return this.query({
      where: [
        { field: 'empresaId', operator: '==', value: empresaId },
        { field: 'estado', operator: '==', value: 'activo' }
      ],
      orderBy: [{ field: 'nombre' }]
    });
  }
}

// Servicio para Productos
export class ProductoService extends FirebaseCrud<IProducto> {
  constructor() {
    super(COLLECTIONS.PRODUCTOS);
  }

  async getByCategoria(restauranteId: string, categoriaId: string) {
    return this.query({
      where: [
        { field: 'restauranteId', operator: '==', value: restauranteId },
        { field: 'categoriaId', operator: '==', value: categoriaId },
        { field: 'estado', operator: '==', value: 'disponible' }
      ],
      orderBy: [{ field: 'nombre' }]
    });
  }

  async updateStock(id: string, cantidad: number) {
    const producto = await this.getById(id);
    if (!producto) throw new Error('Producto no encontrado');

    const nuevoStock = producto.stock.actual + cantidad;
    if (nuevoStock < 0) throw new Error('Stock insuficiente');

    await this.update(id, {
      stock: {
        ...producto.stock,
        actual: nuevoStock
      }
    });
  }

  async checkStockDisponible(id: string, cantidad: number): Promise<boolean> {
    const producto = await this.getById(id);
    if (!producto) return false;
    return producto.stock.actual >= cantidad;
  }
}

// Servicio para Combinaciones
export class CombinacionService extends FirebaseCrud<ICombinacion> {
  constructor() {
    super(COLLECTIONS.COMBINACIONES);
  }

  async getDisponibles(restauranteId: string) {
    return this.query({
      where: [
        { field: 'restauranteId', operator: '==', value: restauranteId },
        { field: 'disponible', operator: '==', value: true }
      ],
      orderBy: [
        { field: 'destacado', direction: 'desc' },
        { field: 'nombre' }
      ]
    });
  }

  async checkDisponibilidadComponentes(combinacionId: string): Promise<boolean> {
    const combinacion = await this.getById(combinacionId);
    if (!combinacion) return false;

    const productoService = new ProductoService();
    
    // Verificar disponibilidad de cada componente
    const checks = await Promise.all([
      productoService.checkStockDisponible(combinacion.componentes.entradaId, 1),
      productoService.checkStockDisponible(combinacion.componentes.principioId, 1),
      productoService.checkStockDisponible(combinacion.componentes.proteinaId, 1),
      productoService.checkStockDisponible(combinacion.componentes.bebidaId, 1),
      ...combinacion.componentes.acompanamientoIds.map(id => 
        productoService.checkStockDisponible(id, 1)
      )
    ]);

    return checks.every(check => check === true);
  }
}

// Servicio para Menú Diario
export class MenuDiarioService extends FirebaseCrud<IMenuDiario> {
  constructor() {
    super(COLLECTIONS.MENU_DIARIO);
  }

  async getMenuDelDia(restauranteId: string, fecha: Date) {
    const menus = await this.query({
      where: [
        { field: 'restauranteId', operator: '==', value: restauranteId },
        { field: 'fecha', operator: '==', value: fecha },
        { field: 'estado', operator: '==', value: 'publicado' }
      ],
      limit: 1
    });
    return menus[0] || null;
  }

  async actualizarVendidos(menuId: string, combinacionId: string, cantidad: number) {
    const menu = await this.getById(menuId);
    if (!menu) throw new Error('Menú no encontrado');

    const combinacionIndex = menu.combinaciones.findIndex(c => c.combinacionId === combinacionId);
    if (combinacionIndex === -1) throw new Error('Combinación no encontrada en el menú');

    const combinaciones = [...menu.combinaciones];
    combinaciones[combinacionIndex] = {
      ...combinaciones[combinacionIndex],
      vendidos: combinaciones[combinacionIndex].vendidos + cantidad
    };

    await this.update(menuId, { combinaciones });
  }
}

// Servicio para Ventas
export class VentaService extends FirebaseCrud<IVenta> {
  constructor() {
    super(COLLECTIONS.VENTAS);
  }

  async getVentasDelDia(restauranteId: string, fecha: Date) {
    const inicio = new Date(fecha);
    inicio.setHours(0, 0, 0, 0);
    
    const fin = new Date(fecha);
    fin.setHours(23, 59, 59, 999);

    return this.query({
      where: [
        { field: 'restauranteId', operator: '==', value: restauranteId },
        { field: 'createdAt', operator: '>=', value: inicio },
        { field: 'createdAt', operator: '<=', value: fin },
        { field: 'estado', operator: '==', value: 'pagado' }
      ],
      orderBy: [{ field: 'createdAt', direction: 'desc' }]
    });
  }

  async procesarVenta(venta: Omit<IVenta, 'id'>) {
    // Verificar stock de todos los items
    const productoService = new ProductoService();
    const combinacionService = new CombinacionService();

    for (const item of venta.items) {
      if (item.tipo === 'producto') {
        const disponible = await productoService.checkStockDisponible(item.itemId, item.cantidad);
        if (!disponible) throw new Error(`Stock insuficiente para el producto ${item.itemId}`);
      } else {
        const disponible = await combinacionService.checkDisponibilidadComponentes(item.itemId);
        if (!disponible) throw new Error(`Componentes insuficientes para la combinación ${item.itemId}`);
      }
    }

    // Crear la venta
    const nuevaVenta = await this.create(venta);

    // Actualizar stock y vendidos
    for (const item of venta.items) {
      if (item.tipo === 'producto') {
        await productoService.updateStock(item.itemId, -item.cantidad);
      } else {
        // Actualizar vendidos en el menú del día
        const menuDiarioService = new MenuDiarioService();
        const menuDelDia = await menuDiarioService.getMenuDelDia(venta.restauranteId, new Date());
        if (menuDelDia) {
          await menuDiarioService.actualizarVendidos(menuDelDia.id, item.itemId, item.cantidad);
        }
      }
    }

    return nuevaVenta;
  }
}

// Exportar instancias de los servicios
export const empresaService = new EmpresaService();
export const restauranteService = new RestauranteService();
export const productoService = new ProductoService();
export const combinacionService = new CombinacionService();
export const menuDiarioService = new MenuDiarioService();
export const ventaService = new VentaService();