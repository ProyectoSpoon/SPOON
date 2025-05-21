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
const DEVELOPMENT_MODE = true;

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

  // Código original para producción (no se usa en modo desarrollo)
  const idToken = request.cookies.get('Firebase-Auth-Token')?.value;
  const user = request.cookies.get('userInfo')?.value;
  
  if (!idToken || !user) {
    console.log('❌ No hay token o información de usuario.');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const requiredPermissions = PROTECTED_ROUTES[pathname];
  console.log('🔒 Permisos requeridos para la ruta:', requiredPermissions);

  try {
    const userInfo = JSON.parse(user);
    console.log('👤 Info del usuario:', userInfo);

    if (requiredPermissions) {
      if (!userInfo.permissions) {
        console.log('❌ Usuario sin permisos definidos');
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      const normalizePermission = (permission: string) => {
        if (typeof permission === 'string') {
          return permission.toLowerCase().replace('_', ':');
        }
        return permission;
      };

      const userPermissions = Array.isArray(userInfo.permissions) 
        ? userInfo.permissions.map((p: string) => normalizePermission(p))
        : [];

      const requiredPermissionStrings = requiredPermissions.map(
        (p) => normalizePermission(p.toString())
      );

      console.log('Permisos normalizados del usuario:', userPermissions);
      console.log('Permisos normalizados requeridos:', requiredPermissionStrings);

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
    console.log('❌ Error al procesar permisos:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|public).*)',
  ],
};
