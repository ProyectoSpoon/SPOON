import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Definir rutas protegidas y sus permisos
  // Nota: Mantenemos la estructura pero simplificada por ahora para validar sesión primero
  const PUBLIC_ROUTES = [
    '/login',
    '/inicio',
    '/registro',
    '/recuperar-contrasena',
    '/api/auth/login', // Login endpoint debe ser público
    '/debug-auth'
  ];

  const isPublicRoute = PUBLIC_ROUTES.some(route => req.nextUrl.pathname.startsWith(route));

  // Si no hay sesión y la ruta no es pública, redirigir a login
  if (!session && !isPublicRoute) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // Si hay sesión y el usuario intenta ir a login, redirigir a dashboard
  // [MODIFICADO] Permitimos entrar al login para que el usuario pueda cerrar sesión o cambiar de cuenta si lo necesita
  /*
  if (session && req.nextUrl.pathname === '/login') {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }
  */

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|public).*)'],
};