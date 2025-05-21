'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { 
  PropsSelectorPais, 
  DatosPais, 
  PAISES_DISPONIBLES 
} from '../../types/formulario.tipos';

interface Pais {
  codigo: string;
  nombre: string;
  prefijo: string;
  bandera: string;
}

const paises: Pais[] = [
  { codigo: 'CO', nombre: 'Colombia', prefijo: '+57', bandera: '🇨🇴' },
  { codigo: 'MX', nombre: 'México', prefijo: '+52', bandera: '🇲🇽' },
  { codigo: 'PE', nombre: 'Perú', prefijo: '+51', bandera: '🇵🇪' },
  { codigo: 'CL', nombre: 'Chile', prefijo: '+56', bandera: '🇨🇱' },
  { codigo: 'AR', nombre: 'Argentina', prefijo: '+54', bandera: '🇦🇷' },
];

const SelectorPais = ({ valorSeleccionado, alCambiar }: PropsSelectorPais) => {
  const [mostrarLista, setMostrarLista] = useState(false);
  const paisSeleccionado = paises.find(p => p.prefijo === valorSeleccionado) || paises[0];

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center px-3 py-2 border rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        onClick={() => setMostrarLista(!mostrarLista)}
      >
        <span className="mr-2">{paisSeleccionado.bandera}</span>
        <span className="mr-1">{paisSeleccionado.prefijo}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {mostrarLista && (
        <div className="absolute z-10 mt-1 w-48 bg-white border rounded-lg shadow-lg">
          {paises.map((pais) => (
            <button
              key={pais.codigo}
              type="button"
              className="flex items-center w-full px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              onClick={() => {
                alCambiar(pais.prefijo);
                setMostrarLista(false);
              }}
            >
              <span className="mr-2">{pais.bandera}</span>
              <span className="mr-2">{pais.nombre}</span>
              <span className="text-gray-500">{pais.prefijo}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectorPais;