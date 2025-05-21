// src/app/config-restaurante/info-legal/components/InfoRestaurante.tsx
interface InfoRestaurante {
  nombreNegocio: string;
  razonSocial: string;
  nit: string;
  regimenTributario: string;
  actividadEconomica: string;
}

interface InfoRestauranteProps {
  datos: InfoRestaurante;
  actualizarDatos: (datos: Partial<InfoRestaurante>) => void;
  estaEnviando: boolean;
}

export default function InfoRestaurante({
  datos,
  actualizarDatos,
  estaEnviando
}: InfoRestauranteProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Negocio *
          </label>
          <input
            type="text"
            value={datos.nombreNegocio}
            onChange={(e) => actualizarDatos({ nombreNegocio: e.target.value })}
            disabled={estaEnviando}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none
              disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Nombre comercial"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Razón Social *
          </label>
          <input
            type="text"
            value={datos.razonSocial}
            onChange={(e) => actualizarDatos({ razonSocial: e.target.value })}
            disabled={estaEnviando}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none
              disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Razón social completa"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            NIT/RUT *
          </label>
          <input
            type="text"
            value={datos.nit}
            onChange={(e) => actualizarDatos({ nit: e.target.value })}
            disabled={estaEnviando}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none
              disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Número de identificación tributaria"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Régimen Tributario *
          </label>
          <select
            value={datos.regimenTributario}
            onChange={(e) => actualizarDatos({ regimenTributario: e.target.value })}
            disabled={estaEnviando}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none
              disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Seleccione un régimen</option>
            <option value="simplificado">Régimen Simplificado</option>
            <option value="comun">Régimen Común</option>
            <option value="especial">Régimen Especial</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Actividad Económica *
          </label>
          <input
            type="text"
            value={datos.actividadEconomica}
            onChange={(e) => actualizarDatos({ actividadEconomica: e.target.value })}
            disabled={estaEnviando}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none
              disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Código CIIU"
          />
          <p className="mt-1 text-sm text-gray-500">
            Ingrese el código CIIU de su actividad principal
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          Esta información debe coincidir exactamente con sus documentos legales registrados ante la DIAN.
        </p>
      </div>
    </div>
  );
}