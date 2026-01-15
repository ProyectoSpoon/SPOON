import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // Configuración de Supabase
    const supabase = createRouteHandlerClient({ cookies });

    // Validación de Usuario
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json(
            { error: 'Unauthorized', message: 'No active session found' },
            { status: 401 }
        );
    }

    // Logging de Advertencia
    console.log('⚠️ [API] Endpoint /api/menu-dia servido con datos temporales');

    // Respuesta Estructurada Mock
    return NextResponse.json({
        restaurantId: 'current',
        menuDia: { productos: [] },
        todosLosProductos: [],
        isMock: true
    });
}
