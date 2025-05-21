// Actualizamos solo el datosConfiguracion con las rutas correctas
export const datosConfiguracion: TarjetaConfiguracion[] = [
  {
    titulo: "Información Legal",
    descripcion: "Documentos y datos fiscales",
    ruta: "/config-restaurante/info-legal",
    icono: "info-legal",
    estado: 'no_iniciado',
    camposRequeridos: [
      { id: 'info-basica', nombre: 'Información Básica', completado: false },
      { id: 'info-contacto', nombre: 'Información de Contacto', completado: false },
      { id: 'info-operativa', nombre: 'Información Operativa', completado: false },
      { id: 'info-legal', nombre: 'Información Legal', completado: false },
      { id: 'documentos-legales', nombre: 'Documentos Legales', completado: false },
      { id: 'revision-final', nombre: 'Revisión Final', completado: false }
    ]
  },
  {
    titulo: "Horario Comercial",
    descripcion: "Configura tus horarios de atención",
    ruta: "/config-restaurante/horario-comercial", // Ruta actualizada
    icono: "horario",
    estado: 'no_iniciado',
    camposRequeridos: [
      { id: 'horario-semanal', nombre: 'Horario Semanal', completado: false },
      { id: 'excepciones', nombre: 'Excepciones y Feriados', completado: false }
    ]
  },
  {
    titulo: "Logo y Portada",
    descripcion: "Personaliza tu imagen",
    ruta: "/config-restaurante/logo-portada", // Ruta actualizada
    icono: "logo-portada",
    estado: 'no_iniciado',
    camposRequeridos: [
      { id: 'logo', nombre: 'Logo del Restaurante', completado: false },
      { id: 'portada', nombre: 'Imagen de Portada', completado: false }
    ]
  },
  
  {
    titulo: "Ubicación",
    descripcion: "Diles donde estas ubicado",
    ruta: "/config-restaurante/ubicacion", // Ruta actualizada
    icono: "ubicacion",
    estado: 'no_iniciado',
    camposRequeridos: [
      { id: 'direccion', nombre: 'Dirección Física', completado: false },
      { id: 'coordenadas', nombre: 'Ubicación en Mapa', completado: false }
    ]
  },
  
];