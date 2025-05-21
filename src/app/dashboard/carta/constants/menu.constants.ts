// src/app/dashboard/carta/constants/menu.constants.ts
export const CATEGORIAS_DEFAULT = [
    'Entradas',
    'Platos Principales',
    'Postres',
    'Bebidas',
    'Especialidades',
    'Promociones'
  ];
  
  export const DIAS_SEMANA = [
    { id: 'lunes', label: 'Lunes' },
    { id: 'martes', label: 'Martes' },
    { id: 'miercoles', label: 'Miércoles' },
    { id: 'jueves', label: 'Jueves' },
    { id: 'viernes', label: 'Viernes' },
    { id: 'sabado', label: 'Sábado' },
    { id: 'domingo', label: 'Domingo' }
  ];
  
  export const ALERGENOS_COMUNES = [
    'Gluten',
    'Lácteos',
    'Huevos',
    'Pescado',
    'Mariscos',
    'Frutos secos',
    'Soja',
    'Maní'
  ];
  
  export const ESTADOS_PRODUCTO = {
    ACTIVO: 'activo',
    INACTIVO: 'inactivo'
  } as const;
  
  // src/app/dashboard/carta/constants/validaciones.constants.ts
  export const VALIDACIONES = {
    PRODUCTO: {
      NOMBRE: {
        MIN: 3,
        MAX: 100,
        REQUIRED: true
      },
      DESCRIPCION: {
        MIN: 10,
        MAX: 500,
        REQUIRED: true
      },
      PRECIO: {
        MIN: 0,
        REQUIRED: true
      }
    },
    IMAGEN: {
      FORMATOS_PERMITIDOS: ['image/jpeg', 'image/png', 'image/webp'],
      TAMANO_MAXIMO: 5 * 1024 * 1024, // 5MB
      DIMENSIONES: {
        MIN_WIDTH: 400,
        MIN_HEIGHT: 300
      }
    }
  };