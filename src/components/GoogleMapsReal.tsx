// src/components/GoogleMapsReal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';

interface GoogleMapsRealProps {
  lat: number;
  lng: number;
  address: string;
  onLocationChange?: (lat: number, lng: number) => void;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleMapsReal: React.FC<GoogleMapsRealProps> = ({ 
  lat, 
  lng, 
  address, 
  onLocationChange 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar Google Maps Script
  useEffect(() => {
    const loadGoogleMaps = () => {
      // Si ya está cargado, no volver a cargar
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        setIsLoading(false);
        return;
      }

      // Crear script tag
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;

      // Callback cuando carga
      window.initMap = () => {
        setIsLoaded(true);
        setIsLoading(false);
      };

      // Error handler
      script.onerror = () => {
        console.error('Error cargando Google Maps');
        setIsLoading(false);
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();

    // Cleanup
    return () => {
      // Limpiar callback global
      if (window.initMap) {
        delete window.initMap;
      }
    };
  }, []);

  // Inicializar mapa cuando Google Maps esté cargado
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    try {
      // Configuración del mapa
      const mapOptions = {
        center: { lat, lng },
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#f5f1e6' }]
          }
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
      };

      // Crear mapa
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);

      // Crear marcador
      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: address || 'Tu Restaurante',
        draggable: true,
        animation: window.google.maps.Animation.DROP
      });

      // Info Window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: bold;">
              🍽️ Tu Restaurante
            </h3>
            <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">
              ${address || 'Ubicación del restaurante'}
            </p>
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}
            </p>
          </div>
        `
      });

      // Mostrar info window
      infoWindow.open(mapInstanceRef.current, markerRef.current);

      // Event listener para drag del marcador
      markerRef.current.addListener('dragend', () => {
        const newPosition = markerRef.current.getPosition();
        const newLat = newPosition.lat();
        const newLng = newPosition.lng();
        
        if (onLocationChange) {
          onLocationChange(newLat, newLng);
        }

        // Actualizar info window
        infoWindow.setContent(`
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: bold;">
              🍽️ Tu Restaurante
            </h3>
            <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">
              ${address || 'Nueva ubicación'}
            </p>
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              📍 ${newLat.toFixed(6)}, ${newLng.toFixed(6)}
            </p>
          </div>
        `);
      });

      // Click en el mapa para mover marcador
      mapInstanceRef.current.addListener('click', (event: any) => {
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();
        
        // Mover marcador
        markerRef.current.setPosition({ lat: newLat, lng: newLng });
        
        if (onLocationChange) {
          onLocationChange(newLat, newLng);
        }

        // Actualizar info window
        infoWindow.setContent(`
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: bold;">
              🍽️ Tu Restaurante
            </h3>
            <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">
              ${address || 'Nueva ubicación'}
            </p>
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              📍 ${newLat.toFixed(6)}, ${newLng.toFixed(6)}
            </p>
          </div>
        `);
        
        infoWindow.open(mapInstanceRef.current, markerRef.current);
      });

    } catch (error) {
      console.error('Error inicializando Google Maps:', error);
    }
  }, [isLoaded, lat, lng, address, onLocationChange]);

  // Actualizar posición cuando cambian las coordenadas
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && isLoaded) {
      const newPosition = { lat, lng };
      
      // Centrar mapa
      mapInstanceRef.current.setCenter(newPosition);
      
      // Mover marcador
      markerRef.current.setPosition(newPosition);
    }
  }, [lat, lng, isLoaded]);

  if (isLoading) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando Google Maps...</p>
          <p className="text-gray-500 text-sm">🗺️ Preparando mapa interactivo</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full w-full bg-red-50 rounded-xl flex items-center justify-center border-2 border-red-200">
        <div className="text-center p-6">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="font-bold text-red-800 mb-2">Error cargando Google Maps</h3>
          <p className="text-red-600 text-sm mb-4">
            Verifica tu API key en las variables de entorno
          </p>
          <div className="bg-red-100 rounded-lg p-3 text-xs text-red-700">
            <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? '✅ Configurada' : '❌ No encontrada'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* Contenedor del mapa */}
      <div
        ref={mapRef}
        className="h-full w-full rounded-xl shadow-lg"
        style={{ minHeight: '400px' }}
      />
      
      {/* Overlay con controles personalizados */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-2 max-w-xs">
        <div className="text-xs text-gray-600">
          <p className="font-semibold text-gray-800">💡 Tip:</p>
          <p>Haz clic en el mapa o arrastra el marcador para cambiar la ubicación</p>
        </div>
      </div>
      
      {/* Info de coordenadas */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-xs">
        📍 {lat.toFixed(4)}, {lng.toFixed(4)}
      </div>
    </div>
  );
};

export default GoogleMapsReal;