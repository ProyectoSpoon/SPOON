import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Permission } from '@/types/auth';

type ProtectedRoutes = {
  [key: string]: Permission[];
};

const PROTECTED_ROUTES: ProtectedRoutes = {
  '/dashboard': [Permission.MENU_READ],
  '/config-restaurante': [Permission.SETTINGS_READ],
  '/completar-perfil': [Permission.SETTINGS_READ],
  '/dashboard/users': [Permission.USERS_READ],
  '/dashboard/settings': [Permission.SETTINGS_READ],
  '/dashboard/reports': [Permission.REPORTS_READ],
  '/dashboard/carta': [Permission.MENU_READ, Permission.MENU_WRITE],
  '/dashboard/ordenes': [Permission.ORDERS_READ, Permission.ORDERS_WRITE],
  '/dashboard/configuracion': [Permission.SETTINGS_READ, Permission.SETTINGS_WRITE],
  '/dashboard/estadisticas': [Permission.REPORTS_READ],
  '/dashboard/usuarios': [Permission.USERS_READ, Permission.USERS_WRITE],
  '/dashboard/vision-general': [Permission.REPORTS_READ],
  '/dashboard/horario-comercial': [Permission.SETTINGS_WRITE]
} as const;

const PUBLIC_ROUTES = [
  '/login', 
  '/inicio', 
  '/registro', 
  '/recuperar-contrasena',
  '/verificar-email',
  '/verificar-2fa',
  '/images',
  '/config-restaurante',
  '/unauthorized',
  '/dev-login.html'
] as const;

// Modo desarrollo: Permitir acceso a todas las rutas sin autenticación
const DEVELOPMENT_MODE = false; // Cambiado a false para usar autenticación real

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('📄 Ruta solicitada:', pathname);
  
  // Si es una ruta pública, permitir acceso
  if (PUBLIC_ROUTES.includes(pathname as any)) {
    console.log('✔️ Ruta pública, acceso permitido.');
    return NextResponse.next();
  }

  // En modo desarrollo, permitir acceso sin token
  if (DEVELOPMENT_MODE) {
    console.log('✅ Modo desarrollo: Acceso permitido con token de desarrollo.');
    return NextResponse.next();
  }

  // Autenticación JWT real
  const authToken = request.cookies.get('auth-token')?.value;
  const userInfo = request.cookies.get('user-info')?.value;
  
  if (!authToken) {
    console.log('❌ No hay token de autenticación.');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // En el middleware, solo verificamos que el token existe
    // La verificación completa se hace en las APIs
    console.log('✅ Token de autenticación encontrado');
    
    // Decodificar el payload sin verificar (solo para obtener información básica)
    let decoded: any = {};
    try {
      const payload = authToken.split('.')[1];
      if (payload) {
        decoded = JSON.parse(atob(payload));
        console.log('✅ Token decodificado para usuario:', decoded.email);
      }
    } catch (decodeError) {
      console.log('⚠️ No se pudo decodificar el token, pero se permite el acceso');
    }

    const requiredPermissions = PROTECTED_ROUTES[pathname];
    console.log('🔒 Permisos requeridos para la ruta:', requiredPermissions);

    if (requiredPermissions) {
      let user;
      
      // Intentar obtener información del usuario desde cookie
      if (userInfo) {
        try {
          user = JSON.parse(userInfo);
        } catch (parseError) {
          console.log('❌ Error al parsear información del usuario');
          return NextResponse.redirect(new URL('/login', request.url));
        }
      }

      // Si no hay información del usuario en cookie, usar la del token
      if (!user) {
        user = {
          permissions: decoded.permissions || []
        };
      }

      if (!user.permissions || !Array.isArray(user.permissions)) {
        console.log('❌ Usuario sin permisos definidos');
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      const normalizePermission = (permission: string) => {
        if (typeof permission === 'string') {
          return permission.toLowerCase().replace('_', ':');
        }
        return permission;
      };

      const userPermissions = user.permissions.map((p: string) => normalizePermission(p));
      const requiredPermissionStrings = requiredPermissions.map(
        (p) => normalizePermission(p.toString())
      );

      console.log('Permisos del usuario:', userPermissions);
      console.log('Permisos requeridos:', requiredPermissionStrings);

      const hasAllPermissions = requiredPermissionStrings.every(
        permission => userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        console.log('❌ Permisos insuficientes');
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    console.log('✅ Acceso permitido.');
    return NextResponse.next();

  } catch (error) {
    console.log('❌ Error al verificar token JWT:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|public).*)',
  ],
};
