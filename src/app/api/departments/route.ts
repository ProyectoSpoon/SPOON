import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        // Inicializar cliente Supabase
        const supabase = createRouteHandlerClient({ cookies });

        // Consultar departamentos activos de la base de datos
        const { data, error } = await supabase
            .schema('public')
            .from('departments')
            .select('id, name, code, country_id, is_active')
            .eq('is_active', true)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching departments:', error);
            return NextResponse.json(
                { error: 'Error al cargar departamentos' },
                { status: 500 }
            );
        }

        return NextResponse.json(data || [], { status: 200 });
    } catch (error) {
        console.error('Error fetching departments:', error);
        return NextResponse.json(
            { error: 'Error al cargar departamentos' },
            { status: 500 }
        );
    }
}
