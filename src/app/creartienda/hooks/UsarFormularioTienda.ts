import { useState, useEffect } from 'react';

import type {
  DatosFormulario,
  ErroresFormulario,
  ResultadoFormulario,
  MENSAJES_ERROR,
  REGEX
} from '../types/formulario.tipos';


interface EstadoFormulario {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  contrasena: string;
  confirmarContrasena: string;
  tipoPersona: string;
  nombreMarca: string;
  aceptaTerminos: boolean;
  aceptaCondiciones: boolean;
}

export const usarFormulario = (estadoInicial: EstadoFormulario) => {
  const [datos, setDatos] = useState<EstadoFormulario>(estadoInicial);
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [esValido, setEsValido] = useState(false);

  const validarEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarFormulario = () => {
    const nuevosErrores: ErroresFormulario = {};

    if (!datos.nombre) nuevosErrores.nombre = 'El nombre es requerido';
    if (!datos.apellidos) nuevosErrores.apellidos = 'Los apellidos son requeridos';
    if (!datos.correo) nuevosErrores.correo = 'El correo es requerido';
    else if (!validarEmail(datos.correo)) nuevosErrores.correo = 'El correo no es válido';
    if (!datos.telefono) nuevosErrores.telefono = 'El teléfono es requerido';
    if (!datos.contrasena) nuevosErrores.contrasena = 'La contraseña es requerida';
    if (datos.contrasena !== datos.confirmarContrasena) {
      nuevosErrores.confirmarContrasena = 'Las contraseñas no coinciden';
    }
    if (!datos.tipoPersona) nuevosErrores.tipoPersona = 'El tipo de persona es requerido';
    if (!datos.nombreMarca) nuevosErrores.nombreMarca = 'El nombre de la marca es requerido';

    setErrores(nuevosErrores);
    const formularioEsValido = Object.keys(nuevosErrores).length === 0 && 
                              datos.aceptaTerminos && 
                              datos.aceptaCondiciones;
    setEsValido(formularioEsValido);

    return formularioEsValido;
  };

  useEffect(() => {
    validarFormulario();
  }, [datos]);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const nuevoValor = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setDatos(prev => ({
      ...prev,
      [name]: nuevoValor
    }));
  };

  return {
    datos,
    errores,
    esValido,
    manejarCambio,
    setDatos
  };
};