import { createClient } from '@supabase/supabase-js';

// Configuración del cliente Supabase
const supabaseUrl = 'https://lwwmmufsdtbetgieoefo.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Cliente público (anon)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    }
});

// Cliente con privilegios de service_role (puede acceder a auth.users)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
    db: {
        schema: 'auth' // Acceso al esquema auth
    }
});

// Helper para queries raw SQL a través de Supabase REST
export async function supabaseQuery<T = any>(query: string, params?: any[]): Promise<{ data: T[] | null; error: any }> {
    try {
        // Usar rpc o query directo según disponibilidad
        const { data, error } = await supabase.rpc('exec_sql', {
            query_text: query,
            query_params: params || []
        });

        return { data, error };
    } catch (error) {
        console.error('Supabase query error:', error);
        return { data: null, error };
    }
}
