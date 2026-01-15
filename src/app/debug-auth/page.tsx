'use client';

import { useAuth } from '@/context/postgres-authcontext';
import { usePermissions } from '@/hooks/usePermissions';

export default function DebugAuthPage() {
  const authContext = useAuth();
  const { user } = authContext;
  const permissions = usePermissions();

  const testPermissions = [
    'MENU_READ',
    'MENU_WRITE', 
    'SETTINGS_READ',
    'SETTINGS_WRITE',
    'USERS_READ',
    'USERS_WRITE',
    'ORDERS_READ',
    'ORDERS_WRITE',
    'REPORTS_READ'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">🔍 Debug de Autenticación</h1>
          
          {/* Estado del Usuario */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">👤 Estado del Usuario</h2>
            <div className="space-y-1 text-sm">
              <p><strong>Autenticado:</strong> {user ? '✅ Sí' : '❌ No'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Rol:</strong> {user?.role || 'N/A'}</p>
              <p><strong>Permisos (Contexto):</strong> {user?.permissions?.length || 0}</p>
            </div>
          </div>

          {/* Permisos del Contexto */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h2 className="font-semibold text-green-900 mb-2">🔑 Permisos del Auth Context</h2>
            <div className="text-xs">
              {user?.permissions && user.permissions.length > 0 ? (
                <ul className="grid grid-cols-2 gap-1">
                  {user.permissions.map((perm, idx) => (
                    <li key={idx} className="text-green-700">✅ {perm}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-red-600">❌ No hay permisos en el contexto</p>
              )}
            </div>
          </div>

          {/* Permisos del Hook */}
          <div className="mb-6 p-4 bg-purple-50 rounded-lg">
            <h2 className="font-semibold text-purple-900 mb-2">🎣 Permisos del Hook</h2>
            <div className="text-xs">
              {permissions.permissions.length > 0 ? (
                <ul className="grid grid-cols-2 gap-1">
                  {permissions.permissions.map((perm, idx) => (
                    <li key={idx} className="text-purple-700">✅ {perm}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-red-600">❌ No hay permisos en el hook</p>
              )}
            </div>
          </div>

          {/* Test de Verificación */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-gray-900 mb-2">🧪 Test de Verificación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Auth Context Tests */}
              <div>
                <h3 className="font-medium mb-2">Auth Context (User Info):</h3>
                <div className="space-y-1">
                  <div className="p-2 rounded text-xs bg-blue-100 text-blue-800">
                    📧 Email: {user?.email || 'N/A'}
                  </div>
                  <div className="p-2 rounded text-xs bg-blue-100 text-blue-800">
                    👑 Role: {user?.role || 'N/A'}
                  </div>
                  <div className="p-2 rounded text-xs bg-blue-100 text-blue-800">
                    🔑 Permissions: {user?.permissions?.length || 0}
                  </div>
                </div>
              </div>

              {/* Hook Tests */}
              <div>
                <h3 className="font-medium mb-2">Hook hasPermission:</h3>
                <div className="space-y-1">
                  {testPermissions.map((perm) => (
                    <div key={perm} className={`p-1 rounded text-xs ${
                      permissions.hasPermission(perm) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {permissions.hasPermission(perm) ? '✅' : '❌'} {perm}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Test de Rutas */}
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <h2 className="font-semibold text-yellow-900 mb-2">🚪 Test de Acceso a Rutas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                '/dashboard',
                '/dashboard/carta',
                '/dashboard/configuracion',
                '/dashboard/usuarios',
                '/dashboard/estadisticas'
              ].map((route) => (
                <div key={route} className={`p-2 rounded text-sm ${
                  permissions.canAccessRoute(route) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {permissions.canAccessRoute(route) ? '✅' : '❌'} {route}
                </div>
              ))}
            </div>
          </div>

          {/* Raw Data */}
          <div className="space-y-4">
            <details className="bg-gray-100 p-4 rounded-lg">
              <summary className="font-semibold cursor-pointer">📄 Usuario Raw</summary>
              <pre className="text-xs mt-2 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </details>

            <details className="bg-gray-100 p-4 rounded-lg">
              <summary className="font-semibold cursor-pointer">📄 JWT Token</summary>
              <pre className="text-xs mt-2 overflow-auto">
                {(() => {
                  try {
                    const token = localStorage.getItem('auth_token');
                    if (token) {
                      const payload = token.split('.')[1];
                      return JSON.stringify(JSON.parse(atob(payload)), null, 2);
                    }
                    return 'No token found';
                  } catch {
                    return 'Error parsing token';
                  }
                })()}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}