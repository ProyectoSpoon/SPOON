// src/firebase/services/location.service.ts

import { db } from '../config';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// Actualizado para coincidir con las reglas
const RESTAURANT_COLLECTION = 'restaurantes';

interface Location {
  lat: number;
  lng: number;
}

interface LocationData {
  direccion: string;
  coordenadas: Location;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class LocationService {
  private static validateColombia(coordenadas: Location): boolean {
    const COLOMBIA_BOUNDS = {
      north: 13.3888,
      south: -4.2316,
      east: -66.8541,
      west: -81.7178
    };

    return (
      coordenadas.lat >= COLOMBIA_BOUNDS.south &&
      coordenadas.lat <= COLOMBIA_BOUNDS.north &&
      coordenadas.lng >= COLOMBIA_BOUNDS.west &&
      coordenadas.lng <= COLOMBIA_BOUNDS.east
    );
  }

  static async saveLocation(
    restaurantId: string,
    data: { direccion: string; coordenadas: Location }
  ): Promise<void> {
    try {
      if (!this.validateColombia(data.coordenadas)) {
        throw new Error('La ubicación debe estar dentro de Colombia');
      }

      const locationData: LocationData = {
        ...data,
        restaurantId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const restaurantRef = doc(db, RESTAURANT_COLLECTION, restaurantId);
      
      // Actualizamos solo los campos de ubicación y agregamos el empresaId
      await updateDoc(restaurantRef, {
        'ubicacion.direccion': data.direccion,
        'ubicacion.coordenadas': data.coordenadas,
        'ubicacion.updatedAt': new Date(),
        'ubicacion.createdAt': data.createdAt || new Date()
      });
    } catch (error) {
      console.error('Error guardando ubicación:', error);
      throw error;
    }
  }

  static async getLocation(restaurantId: string): Promise<LocationData | null> {
    try {
      const restaurantRef = doc(db, RESTAURANT_COLLECTION, restaurantId);
      const docSnap = await getDoc(restaurantRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      
      if (!data.ubicacion) {
        return null;
      }

      return {
        direccion: data.ubicacion.direccion,
        coordenadas: data.ubicacion.coordenadas,
        restaurantId,
        createdAt: data.ubicacion.createdAt?.toDate(),
        updatedAt: data.ubicacion.updatedAt?.toDate()
      };
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      throw error;
    }
  }

  static async updateLocation(
    restaurantId: string, 
    coordenadas: Location
  ): Promise<void> {
    try {
      if (!this.validateColombia(coordenadas)) {
        throw new Error('La ubicación debe estar dentro de Colombia');
      }

      const restaurantRef = doc(db, RESTAURANT_COLLECTION, restaurantId);
      
      await updateDoc(restaurantRef, {
        'ubicacion.coordenadas': coordenadas,
        'ubicacion.updatedAt': new Date()
      });
    } catch (error) {
      console.error('Error actualizando ubicación:', error);
      throw error;
    }
  }
}