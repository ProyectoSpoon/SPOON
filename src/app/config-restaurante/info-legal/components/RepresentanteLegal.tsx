// src/app/config-restaurante/info-legal/components/RepresentanteLegal.tsx
interface RepresentanteLegalDatos {
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  email: string;
  telefono: string;
  cargo: string;
}

interface RepresentanteLegalProps {
  datos: RepresentanteLegalDatos;
  actualizarDatos: (datos: Partial<RepresentanteLegalDatos>) => void;
  estaEnviando: boolean;
}

export default function RepresentanteLegal({
  datos,
  actualizarDatos,
  estaEnviando
}: RepresentanteLegalProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombres *
          </label>
          <input
            type="text"
            value={datos.nombres}
            onChange={(e) => actualizarDatos({ nombres: e.target.value })}
            disabled={estaEnviando}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none
              disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Nombres completos"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellidos *
          </label>
          <input
            type="text"
            value={datos.apellidos}
            onChange={(e) => actualizarDatos({ apellidos: e.target.value })}
            disabled={estaEnviando}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none
              disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Apellidos completos"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Documento *
          </label>
          <select
            value={datos.tipoDocumento}
            onChange={(e) => actualizarDatos({ tipoDocumento: e.target.value })}
            disabled={estaEnviando}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none
              disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Seleccione tipo</option>
            <option value="cc">Cédula de Ciudadanía</option>
            <option value="ce">Cédula de Extranjería</option>
            <option value="pasaporte">Pasaporte</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Documento *
          </label>
          <input
            type="text"
            value={datos.numeroDocumento}
            onChange={(e) => actualizarDatos({ numeroDocumento: e.target.value })}
            disabled={estaEnviando}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none
              disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Número de identificación"
          />
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
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <input
            type="tel"
            value={datos.telefono}
            onChange={(e) => actualizarDatos({ telefono: e.target.value })}
            disabled={estaEnviando}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none
              disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Número de contacto"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cargo en la Empresa *
          </label>
          <input
            type="text"
            value={datos.cargo}
            onChange={(e) => actualizarDatos({ cargo: e.target.value })}
            disabled={estaEnviando}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none
              disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Ej: Gerente, Propietario, Representante Legal"
          />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          El representante legal es la persona autorizada para actuar en nombre de la empresa 
          y será el responsable legal ante las autoridades.
        </p>
      </div>
    </div>
  );
}