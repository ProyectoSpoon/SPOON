'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { PropsCampoContrasena } from '../../types/formulario.tipos';


const CampoContrasena = ({
  nombre,
  valor,
  placeholder,
  alCambiar,
  error
}: PropsCampoContrasena) => {
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  return (
    <div>
      <div className="relative">
        <input
          type={mostrarContrasena ? "text" : "password"}
          name={nombre}
          placeholder={placeholder}
          value={valor}
          onChange={alCambiar}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <button
          type="button"
          onClick={() => setMostrarContrasena(!mostrarContrasena)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
        >
          {mostrarContrasena ? (
            <EyeOff className="w-5 h-5 text-gray-400" />
          ) : (
            <Eye className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default CampoContrasena;


























