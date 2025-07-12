const UnauthorizedPage = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Acceso no autorizado</h1>
        <p className="text-gray-700">
          No tienes los permisos necesarios para acceder a esta página.
        </p>
        <a
          href="/"
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Volver al inicio
        </a>
      </div>
    );
  };
  
  export default UnauthorizedPage;
  
