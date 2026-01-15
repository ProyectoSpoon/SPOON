import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const departmentId = params.id;

    // Inicializar cliente Supabase
    const supabase = createRouteHandlerClient({ cookies });

    // Consultar ciudades del departamento especificado
    const { data, error } = await supabase
      .schema('public')
      .from('cities')
      .select('id, name, department_id')
      .eq('department_id', departmentId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching cities:', error);
      return NextResponse.json(
        { error: 'Error al cargar ciudades' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Error al cargar ciudades' },
      { status: 500 }
    );
  }
}
