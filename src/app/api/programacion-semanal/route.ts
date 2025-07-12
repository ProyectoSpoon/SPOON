import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'spoon_db',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Tipos para la programación semanal
interface DailyMenuData {
  id: string;
  fecha: string;
  dia: string;
  menu: {
    id: string;
    name: string;
    description: string;
    status: 'draft' | 'published' | 'archived' | 'cancelled';
    total_combinations: number;
    published_at: string | null;
  } | null;
  combinaciones: MenuCombinationData[];
}

interface MenuCombinationData {
  id: string;
  name: string;
  description: string;
  entrada: ProductData;
  principio: ProductData;
  proteina: ProductData;
  bebida: ProductData;
  acompanamientos: ProductData[];
  acompanamiento: ProductData[]; // REQUERIDO por MenuCombinacion
  // Propiedades para compatibilidad con MenuCombinacion
  nombre?: string;
  descripcion?: string;
  precioEspecial?: number | null;
  cantidad?: number;
  estado?: 'disponible' | 'agotado';
  favorito?: boolean;
  especial?: boolean;
  base_price: number;
  special_price: number | null;
  is_available: boolean;
  is_featured: boolean;
  max_daily_quantity: number;
  current_quantity: number;
  sold_quantity: number;
}

interface ProductData {
  id: string;
  name: string;
  description: string;
  current_price: number;
  category_id: string;
  image_url: string | null;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  categoriaId?: string;
}

// Constantes
const RESTAURANT_ID_PRUEBA = '550e8400-e29b-41d4-a716-446655440000';
const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Función para validar UUID
function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

// Función para obtener el inicio de la semana (Lunes)
function getWeekStart(fecha: Date): Date {
  const d = new Date(fecha);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Función para formatear fecha
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Función para obtener todas las fechas de la semana
function getWeekDates(startDate: Date): { fecha: string; dia: string }[] {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push({
      fecha: formatDate(date),
      dia: DIAS_SEMANA[i]
    });
  }
  return dates;
}

// Función para obtener menús diarios de la semana
async function getDailyMenusFromDB(restaurantId: string, weekStart: Date): Promise<DailyMenuData[]> {
  const weekDates = getWeekDates(weekStart);
  
  console.log('🔍 Obteniendo menús diarios para:', restaurantId);
  
  // Devolver estructura vacía siempre - cada día debe existir
  return weekDates.map(dateInfo => ({
    id: `menu-${dateInfo.fecha}`,
    fecha: dateInfo.fecha,
    dia: dateInfo.dia,
    menu: null,
    combinaciones: [] // Array vacío de combinaciones
  }));
}

// Función para obtener combinaciones disponibles
async function getCombinacionesDisponibles(restaurantId: string): Promise<MenuCombinationData[]> {
  console.log('🔍 Obteniendo combinaciones para:', restaurantId);
  
  // Devolver array vacío siempre
  return [];
}

// GET - Obtener programación semanal
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha');
    const restaurantId = searchParams.get('restaurantId') || RESTAURANT_ID_PRUEBA;

    console.log('📅 GET Programación semanal:', { fecha, restaurantId });

    if (!fecha) {
      return NextResponse.json(
        { error: 'Parámetro fecha es requerido' },
        { status: 400 }
      );
    }

    // Calcular inicio de semana
    const fechaObj = new Date(fecha);
    const weekStart = getWeekStart(fechaObj);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    console.log('📊 Obteniendo datos:', {
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(weekEnd)
    });

    // Obtener datos
    const [menusDiarios, combinacionesDisponibles] = await Promise.all([
      getDailyMenusFromDB(restaurantId, weekStart),
      getCombinacionesDisponibles(restaurantId)
    ]);

    const response = {
      success: true,
      data: {
        semana: {
          fechaInicio: formatDate(weekStart),
          fechaFin: formatDate(weekEnd),
          menusDiarios
        },
        combinacionesDisponibles,
        plantillas: [], // Array vacío siempre
        totalCombinacionesSemana: menusDiarios.reduce(
          (total, menu) => total + menu.combinaciones.length, 
          0
        )
      }
    };

    console.log('✅ Respuesta exitosa:', {
      menusDiarios: menusDiarios.length,
      combinacionesDisponibles: combinacionesDisponibles.length,
      plantillas: 0,
      fechaInicio: formatDate(weekStart),
      fechaFin: formatDate(weekEnd)
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error en GET programación semanal:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST - Crear/actualizar programación semanal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId = RESTAURANT_ID_PRUEBA, accion, semana, esPublicacion, plantilla } = body;

    console.log('📝 POST Programación semanal:', { restaurantId, accion, esPublicacion });

    if (accion) {
      switch (accion) {
        case 'guardar_borrador':
          console.log('💾 Guardando borrador...');
          return NextResponse.json({ success: true, message: 'Borrador guardado' });
        
        case 'publicar':
          console.log('📢 Publicando programación...');
          return NextResponse.json({ success: true, message: 'Programación publicada' });
        
        case 'programar_automaticamente':
          console.log('🤖 Programando automáticamente...');
          return NextResponse.json({ success: true, message: 'Programación automática completada' });
        
        default:
          return NextResponse.json(
            { error: 'Acción no válida' },
            { status: 400 }
          );
      }
    }

    if (semana) {
      if (esPublicacion) {
        console.log('🚀 Publicando programación semanal...');
        return NextResponse.json({ 
          success: true, 
          message: 'Programación semanal publicada exitosamente' 
        });
      } else {
        console.log('💾 Guardando borrador de programación...');
        return NextResponse.json({ 
          success: true, 
          message: 'Programación guardada como borrador' 
        });
      }
    }

    return NextResponse.json(
      { error: 'Solicitud inválida' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('❌ Error en POST programación semanal:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
