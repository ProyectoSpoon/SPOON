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
  entrada: ProductData | null;
  principio: ProductData | null;
  proteina: ProductData;
  bebida: ProductData | null;
  acompanamientos: ProductData[];
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
}

interface PlantillaData {
  id: string;
  nombre: string;
  descripcion: string;
  programacion: Record<string, string[]>; // día -> combinationIds
  fechaCreacion: string;
  esActiva: boolean;
}

// Constantes
const RESTAURANT_ID_PRUEBA = 'rest-test-001';
const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Función para obtener el inicio de la semana (Lunes)
function getWeekStart(fecha: Date): Date {
  const d = new Date(fecha);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que Lunes sea el primer día
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

// Función para obtener menús diarios de la semana desde PostgreSQL
async function getDailyMenusFromDB(restaurantId: string, weekStart: Date): Promise<DailyMenuData[]> {
  const client = await pool.connect();
  try {
    const weekDates = getWeekDates(weekStart);
    const dailyMenus: DailyMenuData[] = [];

    for (const dateInfo of weekDates) {
      // Obtener menú diario si existe
      const menuQuery = `
        SELECT 
          dm.id,
          dm.name,
          dm.description,
          dm.status,
          dm.total_combinations,
          dm.published_at
        FROM menu.daily_menus dm
        WHERE dm.restaurant_id = $1 AND dm.menu_date = $2
      `;
      
      const menuResult = await client.query(menuQuery, [restaurantId, dateInfo.fecha]);
      const menu = menuResult.rows[0] || null;

      let combinaciones: MenuCombinationData[] = [];

      if (menu) {
        // Obtener combinaciones del menú diario
        const combinacionesQuery = `
          SELECT 
            mc.id,
            mc.name,
            mc.description,
            mc.base_price,
            mc.special_price,
            mc.is_available,
            mc.is_featured,
            mc.max_daily_quantity,
            mc.current_quantity,
            mc.sold_quantity,
            
            -- Entrada
            e.id as entrada_id,
            e.name as entrada_name,
            e.description as entrada_description,
            e.current_price as entrada_price,
            e.category_id as entrada_category_id,
            e.image_url as entrada_image_url,
            
            -- Principio
            p.id as principio_id,
            p.name as principio_name,
            p.description as principio_description,
            p.current_price as principio_price,
            p.category_id as principio_category_id,
            p.image_url as principio_image_url,
            
            -- Proteína
            pr.id as proteina_id,
            pr.name as proteina_name,
            pr.description as proteina_description,
            pr.current_price as proteina_price,
            pr.category_id as proteina_category_id,
            pr.image_url as proteina_image_url,
            
            -- Bebida
            b.id as bebida_id,
            b.name as bebida_name,
            b.description as bebida_description,
            b.current_price as bebida_price,
            b.category_id as bebida_category_id,
            b.image_url as bebida_image_url
            
          FROM menu.menu_combinations mc
          LEFT JOIN menu.products e ON mc.entrada_id = e.id
          LEFT JOIN menu.products p ON mc.principio_id = p.id
          LEFT JOIN menu.products pr ON mc.proteina_id = pr.id
          LEFT JOIN menu.products b ON mc.bebida_id = b.id
          WHERE mc.daily_menu_id = $1
          ORDER BY mc.sort_order ASC, mc.created_at ASC
        `;
        
        const combinacionesResult = await client.query(combinacionesQuery, [menu.id]);
        
        for (const row of combinacionesResult.rows) {
          // Obtener acompañamientos
          const acompQuery = `
            SELECT 
              p.id,
              p.name,
              p.description,
              p.current_price,
              p.category_id,
              p.image_url
            FROM menu.combination_sides cs
            JOIN menu.products p ON cs.product_id = p.id
            WHERE cs.combination_id = $1
            ORDER BY cs.sort_order ASC
          `;
          
          const acompResult = await client.query(acompQuery, [row.id]);
          
          const combinacion: MenuCombinationData = {
            id: row.id,
            name: row.name,
            description: row.description,
            entrada: row.entrada_id ? {
              id: row.entrada_id,
              name: row.entrada_name,
              description: row.entrada_description,
              current_price: parseFloat(row.entrada_price),
              category_id: row.entrada_category_id,
              image_url: row.entrada_image_url
            } : null,
            principio: row.principio_id ? {
              id: row.principio_id,
              name: row.principio_name,
              description: row.principio_description,
              current_price: parseFloat(row.principio_price),
              category_id: row.principio_category_id,
              image_url: row.principio_image_url
            } : null,
            proteina: {
              id: row.proteina_id,
              name: row.proteina_name,
              description: row.proteina_description,
              current_price: parseFloat(row.proteina_price),
              category_id: row.proteina_category_id,
              image_url: row.proteina_image_url
            },
            bebida: row.bebida_id ? {
              id: row.bebida_id,
              name: row.bebida_name,
              description: row.bebida_description,
              current_price: parseFloat(row.bebida_price),
              category_id: row.bebida_category_id,
              image_url: row.bebida_image_url
            } : null,
            acompanamientos: acompResult.rows.map(acomp => ({
              id: acomp.id,
              name: acomp.name,
              description: acomp.description,
              current_price: parseFloat(acomp.current_price),
              category_id: acomp.category_id,
              image_url: acomp.image_url
            })),
            base_price: parseFloat(row.base_price),
            special_price: row.special_price ? parseFloat(row.special_price) : null,
            is_available: row.is_available,
            is_featured: row.is_featured,
            max_daily_quantity: row.max_daily_quantity,
            current_quantity: row.current_quantity,
            sold_quantity: row.sold_quantity
          };
          
          combinaciones.push(combinacion);
        }
      }

      dailyMenus.push({
        id: menu?.id || '',
        fecha: dateInfo.fecha,
        dia: dateInfo.dia,
        menu: menu,
        combinaciones: combinaciones
      });
    }

    return dailyMenus;
  } finally {
    client.release();
  }
}

// Función para obtener combinaciones disponibles desde PostgreSQL
async function getCombinacionesDisponibles(restaurantId: string): Promise<MenuCombinationData[]> {
  const client = await pool.connect();
  try {
    // Obtener todas las combinaciones de menús publicados de los últimos 30 días
    const query = `
      SELECT DISTINCT
        mc.id,
        mc.name,
        mc.description,
        mc.base_price,
        mc.special_price,
        mc.is_available,
        mc.is_featured,
        mc.max_daily_quantity,
        mc.current_quantity,
        mc.sold_quantity,
        
        -- Entrada
        e.id as entrada_id,
        e.name as entrada_name,
        e.description as entrada_description,
        e.current_price as entrada_price,
        e.category_id as entrada_category_id,
        e.image_url as entrada_image_url,
        
        -- Principio
        p.id as principio_id,
        p.name as principio_name,
        p.description as principio_description,
        p.current_price as principio_price,
        p.category_id as principio_category_id,
        p.image_url as principio_image_url,
        
        -- Proteína
        pr.id as proteina_id,
        pr.name as proteina_name,
        pr.description as proteina_description,
        pr.current_price as proteina_price,
        pr.category_id as proteina_category_id,
        pr.image_url as proteina_image_url,
        
        -- Bebida
        b.id as bebida_id,
        b.name as bebida_name,
        b.description as bebida_description,
        b.current_price as bebida_price,
        b.category_id as bebida_category_id,
        b.image_url as bebida_image_url
        
      FROM menu.menu_combinations mc
      JOIN menu.daily_menus dm ON mc.daily_menu_id = dm.id
      LEFT JOIN menu.products e ON mc.entrada_id = e.id
      LEFT JOIN menu.products p ON mc.principio_id = p.id
      LEFT JOIN menu.products pr ON mc.proteina_id = pr.id
      LEFT JOIN menu.products b ON mc.bebida_id = b.id
      WHERE dm.restaurant_id = $1 
        AND dm.status = 'published'
        AND dm.menu_date >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY mc.name ASC
    `;
    
    const result = await client.query(query, [restaurantId]);
    const combinaciones: MenuCombinationData[] = [];
    
    for (const row of result.rows) {
      // Obtener acompañamientos para cada combinación
      const acompQuery = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.current_price,
          p.category_id,
          p.image_url
        FROM menu.combination_sides cs
        JOIN menu.products p ON cs.product_id = p.id
        WHERE cs.combination_id = $1
        ORDER BY cs.sort_order ASC
      `;
      
      const acompResult = await client.query(acompQuery, [row.id]);
      
      const combinacion: MenuCombinationData = {
        id: row.id,
        name: row.name,
        description: row.description,
        entrada: row.entrada_id ? {
          id: row.entrada_id,
          name: row.entrada_name,
          description: row.entrada_description,
          current_price: parseFloat(row.entrada_price),
          category_id: row.entrada_category_id,
          image_url: row.entrada_image_url
        } : null,
        principio: row.principio_id ? {
          id: row.principio_id,
          name: row.principio_name,
          description: row.principio_description,
          current_price: parseFloat(row.principio_price),
          category_id: row.principio_category_id,
          image_url: row.principio_image_url
        } : null,
        proteina: {
          id: row.proteina_id,
          name: row.proteina_name,
          description: row.proteina_description,
          current_price: parseFloat(row.proteina_price),
          category_id: row.proteina_category_id,
          image_url: row.proteina_image_url
        },
        bebida: row.bebida_id ? {
          id: row.bebida_id,
          name: row.bebida_name,
          description: row.bebida_description,
          current_price: parseFloat(row.bebida_price),
          category_id: row.bebida_category_id,
          image_url: row.bebida_image_url
        } : null,
        acompanamientos: acompResult.rows.map(acomp => ({
          id: acomp.id,
          name: acomp.name,
          description: acomp.description,
          current_price: parseFloat(acomp.current_price),
          category_id: acomp.category_id,
          image_url: acomp.image_url
        })),
        base_price: parseFloat(row.base_price),
        special_price: row.special_price ? parseFloat(row.special_price) : null,
        is_available: row.is_available,
        is_featured: row.is_featured,
        max_daily_quantity: row.max_daily_quantity,
        current_quantity: row.current_quantity,
        sold_quantity: row.sold_quantity
      };
      
      combinaciones.push(combinacion);
    }
    
    return combinaciones;
  } finally {
    client.release();
  }
}

// Función para obtener plantillas desde PostgreSQL
async function getPlantillas(restaurantId: string): Promise<PlantillaData[]> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        id,
        setting_value as plantilla_data
      FROM config.system_settings
      WHERE restaurant_id = $1 
        AND setting_key LIKE 'plantilla_programacion_%'
        AND setting_type = 'json'
      ORDER BY created_at DESC
    `;
    
    const result = await client.query(query, [restaurantId]);
    
    return result.rows.map(row => {
      const plantillaData = row.plantilla_data;
      return {
        id: row.id,
        nombre: plantillaData.nombre,
        descripcion: plantillaData.descripcion,
        programacion: plantillaData.programacion,
        fechaCreacion: plantillaData.fechaCreacion,
        esActiva: plantillaData.esActiva
      };
    });
  } finally {
    client.release();
  }
}

