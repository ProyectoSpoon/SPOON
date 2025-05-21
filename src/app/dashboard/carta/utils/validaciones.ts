// src/app/dashboard/carta/utils/validaciones.ts
import { VALIDACIONES } from '../constants/validaciones.constants';
import type { Producto, Categoria, Horario } from '../types/menu.types';

export const validarCategoria = (categoria: Partial<Categoria>) => {
  const errores: Record<string, string> = {};

  if (!categoria.nombre) {
    errores.nombre = 'El nombre es obligatorio';
  } else {
    if (categoria.nombre.length < VALIDACIONES.CATEGORIA.NOMBRE.MIN) {
      errores.nombre = `El nombre debe tener al menos ${VALIDACIONES.CATEGORIA.NOMBRE.MIN} caracteres`;
    }
    if (categoria.nombre.length > VALIDACIONES.CATEGORIA.NOMBRE.MAX) {
      errores.nombre = `El nombre no puede superar los ${VALIDACIONES.CATEGORIA.NOMBRE.MAX} caracteres`;
    }
    if (!VALIDACIONES.CATEGORIA.NOMBRE.PATTERN.test(categoria.nombre)) {
      errores.nombre = 'El nombre solo puede contener letras y espacios';
    }
  }

  return errores;
};

export const validarProducto = (producto: Partial<Producto>) => {
  const errores: Record<string, string> = {};

  // Validar nombre
  if (!producto.nombre) {
    errores.nombre = 'El nombre es obligatorio';
  } else {
    if (producto.nombre.length < VALIDACIONES.PRODUCTO.NOMBRE.MIN) {
      errores.nombre = `El nombre debe tener al menos ${VALIDACIONES.PRODUCTO.NOMBRE.MIN} caracteres`;
    }
    if (producto.nombre.length > VALIDACIONES.PRODUCTO.NOMBRE.MAX) {
      errores.nombre = `El nombre no puede superar los ${VALIDACIONES.PRODUCTO.NOMBRE.MAX} caracteres`;
    }
  }

  // Validar descripción
  if (!producto.descripcion) {
    errores.descripcion = 'La descripción es obligatoria';
  } else {
    if (producto.descripcion.length < VALIDACIONES.PRODUCTO.DESCRIPCION.MIN) {
      errores.descripcion = `La descripción debe tener al menos ${VALIDACIONES.PRODUCTO.DESCRIPCION.MIN} caracteres`;
    }
    if (producto.descripcion.length > VALIDACIONES.PRODUCTO.DESCRIPCION.MAX) {
      errores.descripcion = `La descripción no puede superar los ${VALIDACIONES.PRODUCTO.DESCRIPCION.MAX} caracteres`;
    }
  }

  // Validar precio
  if (producto.precio === undefined || producto.precio === null) {
    errores.precio = 'El precio es obligatorio';
  } else {
    if (producto.precio < VALIDACIONES.PRODUCTO.PRECIO.MIN) {
      errores.precio = 'El precio no puede ser negativo';
    }
    if (producto.precio > VALIDACIONES.PRODUCTO.PRECIO.MAX) {
      errores.precio = `El precio no puede superar ${VALIDACIONES.PRODUCTO.PRECIO.MAX}`;
    }
    if (!Number.isInteger(producto.precio * 100)) {
      errores.precio = 'El precio no puede tener más de 2 decimales';
    }
  }

  // Validar alérgenos
  if (producto.alergenos && producto.alergenos.length > VALIDACIONES.PRODUCTO.ALERGENOS.MAX) {
    errores.alergenos = `No puede seleccionar más de ${VALIDACIONES.PRODUCTO.ALERGENOS.MAX} alérgenos`;
  }

  return errores;
};