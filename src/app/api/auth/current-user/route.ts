import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });

        // Obtener sesión actual de Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            return NextResponse.json(
                { error: true, message: 'No autorizado' },
                { status: 401 }
            );
        }

        // El objeto session.user ya contiene la información necesaria
        // No necesitamos hacer query adicional al schema 'auth'
        const user = {
            id: session.user.id,
            email: session.user.email,
            phone: session.user.phone,
            role: session.user.user_metadata?.role || 'restaurant_owner',
            first_name: session.user.user_metadata?.first_name,
            last_name: session.user.user_metadata?.last_name,
            email_verified: session.user.email_confirmed_at !== null,
            status: 'active'
        };

        return NextResponse.json({
            success: true,
            user: user
        });

    } catch (error) {
        console.error('❌ Error en current-user:', error);
        return NextResponse.json(
            { error: true, message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
