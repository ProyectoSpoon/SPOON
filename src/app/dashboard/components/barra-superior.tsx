import React from 'react'; // Importamos la biblioteca React para definir componentes y utilizar sus funciones, como el estado (useState). Necesario para cualquier archivo que defina un componente React.

// Definición del componente `LogoSpoon`, que representa el logotipo de la aplicación como un SVG.
// Este componente se usa como un icono reutilizable en la barra superior.
const LogoSpoon = () => (
  <svg
    className="h-8 w-auto" // La clase `h-8` establece una altura de 8 unidades para el SVG. `w-auto` permite que el ancho se ajuste automáticamente manteniendo la proporción del SVG.
    viewBox="0 0 24 24" // Define el área de visualización del SVG en un cuadrado de 24x24 píxeles, que es un estándar para iconos pequeños.
    fill="none" // Configura el SVG para que no tenga color de relleno por defecto.
    stroke="currentColor" // Establece el color del trazo como el color actual del texto, permitiendo que cambie dependiendo del contexto en el que se use.
  >
    <path
      strokeLinecap="round" // Hace que los extremos de las líneas en el SVG sean redondeados, mejorando la estética.
      strokeLinejoin="round" // Hace que las uniones entre líneas sean redondeadas, para lograr un estilo de borde suave.
      strokeWidth={2} // Establece el grosor del trazo en 2, para que sea más visible.
      d="M12 4c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 14c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z"
      className="text-red-500" // Cambia el color del trazo a rojo (#ff0000) utilizando clases de Tailwind CSS para darle un color distintivo.
    />
    {/* Si se desea agregar más elementos gráficos en el logo, se podrían incluir más etiquetas <path> aquí. */}
  </svg>
);

// Definición del componente `UsuarioMenu`, que representa el menú de usuario desplegable en la barra superior.
// Se define este componente para encapsular la funcionalidad de mostrar el avatar del usuario y un menú desplegable con opciones.
const UsuarioMenu = () => {
  // `estaMenuAbierto` es una variable de estado que se usa para controlar si el menú desplegable está visible o no.
  const [estaMenuAbierto, setEstaMenuAbierto] = React.useState(false);

  return (
    <div className="relative"> {/* `relative` permite que los elementos dentro puedan posicionarse de forma absoluta en relación a este contenedor. */}
      <button
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100" // `flex` organiza los elementos dentro del botón en una fila.
        onClick={() => setEstaMenuAbierto(!estaMenuAbierto)} // Cambia el estado `estaMenuAbierto` para alternar la visibilidad del menú.
      >
        {/* Avatar del usuario representado como un círculo gris claro */}
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
          {/* Icono SVG de un usuario dentro del avatar */}
          <svg 
            className="h-5 w-5 text-gray-500" // `h-5` y `w-5` definen un tamaño pequeño para el icono de usuario.
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" // Path que representa un icono de usuario.
            />
          </svg>
        </div>
        
        {/* Información del usuario: nombre y rol */}
        <div className="text-sm">
          <p className="font-medium text-gray-700">Usuario Demo</p> {/* `font-medium` aplica un peso de fuente moderado. `text-gray-700` oscurece el texto. */}
          <p className="text-xs text-gray-500">Administrador</p> {/* `text-xs` hace el texto más pequeño. `text-gray-500` es un gris claro. */}
        </div>

        {/* Icono de flecha que rota cuando el menú está abierto */}
        <svg
          className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${
            estaMenuAbierto ? 'rotate-180' : '' // Si `estaMenuAbierto` es true, la flecha rota 180 grados; esto indica que el menú está desplegado.
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7" // Path que dibuja una flecha hacia abajo (o hacia arriba si rota).
          />
        </svg>
      </button>

      {/* Menú desplegable de usuario */}
      {estaMenuAbierto && ( // Muestra el menú solo si `estaMenuAbierto` es true.
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" // Botón de opción del menú.
              onClick={() => console.log('Perfil')} // Acción al hacer clic en "Mi Perfil".
            >
              Mi Perfil
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" // Botón de opción del menú.
              onClick={() => console.log('Configuración')} // Acción al hacer clic en "Configuración".
            >
              Configuración
            </button>
            <hr className="my-1" /> {/* Línea divisora entre opciones */}
            <button
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100" // Opción para cerrar sesión en rojo para destacarse.
              onClick={() => console.log('Cerrar Sesión')} // Acción al hacer clic en "Cerrar Sesión".
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Exportamos el componente `BarraSuperior` para que pueda ser utilizado en otros archivos de la aplicación. 
// `export default` permite importar este componente con cualquier nombre en otros archivos.
export default function BarraSuperior() {
  return (
    <header className="h-[73px] bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      {/* `h-[73px]` define la altura de la barra superior. `bg-white` establece un fondo blanco. `border-b` crea una línea en la parte inferior. */}
      <div className="h-full px-6 flex items-center justify-between">
        {/* Lado izquierdo - Logo de la aplicación */}
        <div className="flex items-center space-x-4">
          <LogoSpoon /> {/* Componente del logo de Spoon */}
          <span className="text-xl font-semibold text-gray-800">
            Spoon
          </span> {/* Texto que muestra el nombre de la aplicación en tamaño grande y color oscuro */}
        </div>

        {/* Lado derecho - Menú de usuario */}
        <UsuarioMenu /> {/* Componente del menú de usuario, que incluye el avatar, nombre, rol y menú desplegable */}
      </div>
    </header>
  );
}


























