// src/app/api/auth/current-user/restaurant/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 === DEBUG RESTAURANT API ===');
    
    // Obtener token del header Authorization
    const authHeader = request.headers.get('authorization');
    console.log('📋 Auth header recibido:', authHeader ? `${authHeader.substring(0, 20)}...` : 'NULL');
    
    let token = authHeader?.replace('Bearer ', '');
    console.log('🔑 Token extraído:', token ? `${token.substring(0, 20)}...` : 'NULL');
    
    if (!token) {
      console.log('❌ No hay token en el request');
      return NextResponse.json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    // Verificar JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET;
    console.log('🔐 JWT_SECRET configurado:', jwtSecret ? 'SÍ' : 'NO');
    
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET no configurado');
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    // Verificar y decodificar JWT
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret) as any;
      console.log('✅ Token decodificado exitosamente');
      console.log('👤 Datos del token:', {
        userId: decoded.userId,
        email: decoded.email,
        exp: new Date(decoded.exp * 1000).toISOString()
      });
    } catch (jwtError: any) {
      console.error('❌ Error verificando JWT:', jwtError.message);
      console.log('🔍 Token que falló:', token.substring(0, 50) + '...');
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    
    if (!userId) {
      console.log('❌ No hay userId en el token decodificado');
      return NextResponse.json(
        { error: 'Usuario no identificado en el token' },
        { status: 401 }
      );
    }

    console.log('🔍 Buscando restaurante para usuario:', userId);

    // Obtener restaurant_id del usuario (como owner)
    const restaurantResult = await pool.query(
      `SELECT id as restaurant_id, name, status 
       FROM restaurant.restaurants 
       WHERE owner_id = $1 AND status = 'active'`,
      [userId]
    );

    console.log('🏪 Resultados owner:', restaurantResult.rows.length);

    // Si no es owner, verificar si es empleado/usuario del restaurante
    if (restaurantResult.rows.length === 0) {
      console.log('👤 Usuario no es owner, verificando si es empleado...');
      
      const employeeResult = await pool.query(
        `SELECT ru.restaurant_id, r.name, r.status 
         FROM restaurant.restaurant_users ru
         JOIN restaurant.restaurants r ON ru.restaurant_id = r.id
         WHERE ru.user_id = $1 AND r.status = 'active'
         ORDER BY ru.created_at DESC
         LIMIT 1`,
        [userId]
      );
      
      console.log('👥 Resultados employee:', employeeResult.rows.length);
      
      if (employeeResult.rows.length === 0) {
        console.log('❌ Usuario no tiene restaurante asignado');
        return NextResponse.json(
          { error: 'Usuario no tiene restaurante asignado' },
          { status: 404 }
        );
      }
      
      const restaurant = employeeResult.rows[0];
      console.log('✅ Usuario es empleado del restaurante:', restaurant.name);
      
      return NextResponse.json({
        restaurantId: restaurant.restaurant_id,
        restaurantName: restaurant.name,
        userRole: 'employee'
      });
    }

    const restaurant = restaurantResult.rows[0];
    console.log('✅ Usuario es owner del restaurante:', restaurant.name);

    return NextResponse.json({
      restaurantId: restaurant.restaurant_id,
      restaurantName: restaurant.name,
      userRole: 'owner'
    });

  } catch (error) {
    console.error('❌ Error obteniendo restaurante del usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}