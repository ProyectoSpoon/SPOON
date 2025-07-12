// src/app/dashboard/carta/constants/validaciones.constants.ts
export const VALIDACIONES = {
    CATEGORIA: {
      NOMBRE: {
        MIN: 3,
        MAX: 50,
        REQUIRED: true,
        PATTERN: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
      }
    },
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
        MAX: 99999.99,
        REQUIRED: true,
        DECIMALES: 2
      },
      ALERGENOS: {
        MAX: 10
      },
      OPCIONES: {
        MAX_OPCIONES: 20,
        MAX_SELECCIONES: 10
      }
    },
    HORARIO: {
      RANGO: {
        MIN_INTERVALO: 30 // minutos
      }
    }
  };
