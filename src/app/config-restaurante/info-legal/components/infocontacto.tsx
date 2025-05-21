// src/app/config-restaurante/pages/datos-restaurante/components/InfoContacto.tsx
import React from 'react';

interface InfoContactoProps {
  datos: {
    telefono: string;
    email: string;
  };
  actualizarDatos: (datos: any) => void;
  estaEnviando: boolean;
}

export default function InfoContacto({ datos, actualizarDatos, estaEnviando }: InfoContactoProps) {
  const validarTelefono = (telefono: string) => /^\d{10}$/.test(telefono);
  const validarEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono de Contacto *
        </label>
        <input
          type="tel"
          value={datos.telefono}
          onChange={(e) => actualizarDatos({ telefono: e.target.value })}
          disabled={estaEnviando}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none 
            disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Ej: 3001234567"
        />
        {datos.telefono && !validarTelefono(datos.telefono) && (
          <p className="mt-1 text-sm text-red-500">
            Ingresa un número de teléfono válido (10 dígitos)
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correo Electrónico *
        </label>
        <input
          type="email"
          value={datos.email}
          onChange={(e) => actualizarDatos({ email: e.target.value })}
          disabled={estaEnviando}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none 
            disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="restaurante@ejemplo.com"
        />
        {datos.email && !validarEmail(datos.email) && (
          <p className="mt-1 text-sm text-red-500">
            Ingresa un correo electrónico válido
          </p>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          Esta información será utilizada para notificaciones importantes y comunicación con el soporte.
        </p>
      </div>
    </div>
  );
}