// Mock Firebase collections types for development

export const COLLECTIONS = {
  USUARIOS: 'usuarios',
  RESTAURANTES: 'restaurantes',
  PRODUCTOS: 'productos',
  CATEGORIAS: 'categorias',
  SUBCATEGORIAS: 'subcategorias',
  MENUS: 'menus',
  MENU_PRODUCTOS: 'menu_productos',
  COMBINACIONES: 'combinaciones',
  COMBINACION_PRODUCTOS: 'combinacion_productos',
  PROGRAMACIONES: 'programaciones',
  FAVORITOS: 'favoritos',
  ESPECIALES: 'especiales'
};

export const ICategoriaMenu = {
  id: '',
  nombre: '',
  descripcion: '',
  orden: 0,
  activo: true,
  restauranteId: ''
};

export const ISubcategoriaMenu = {
  id: '',
  nombre: '',
  descripcion: '',
  categoriaId: '',
  orden: 0,
  activo: true,
  restauranteId: ''
};

export const IProducto = {
  id: '',
  nombre: '',
  descripcion: '',
  precio: 0,
  categoriaId: '',
  subcategoriaId: '',
  imagen: '',
  activo: true,
  restauranteId: '',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const IMenu = {
  id: '',
  nombre: '',
  descripcion: '',
  fechaInicio: new Date(),
  fechaFin: new Date(),
  activo: true,
  restauranteId: '',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const IMenuProducto = {
  id: '',
  menuId: '',
  productoId: '',
  cantidad: 0,
  restauranteId: '',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const ICombinacion = {
  id: '',
  nombre: '',
  descripcion: '',
  activo: true,
  restauranteId: '',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const ICombinacionProducto = {
  id: '',
  combinacionId: '',
  productoId: '',
  cantidad: 0,
  restauranteId: '',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const IProgramacion = {
  id: '',
  combinacionId: '',
  fecha: new Date(),
  cantidadProgramada: 0,
  restauranteId: '',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const IFavorito = {
  id: '',
  combinacionId: '',
  usuarioId: '',
  restauranteId: '',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const IEspecial = {
  id: '',
  combinacionId: '',
  fechaInicio: new Date(),
  fechaFin: new Date(),
  restauranteId: '',
  createdAt: new Date(),
  updatedAt: new Date()
};
