// src/app/config-restaurante/ubicacion/components/mapa.tsx
'use client';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useMemo } from 'react';

interface MapaProps {
  center: { lat: number; lng: number };
  onMarkerDrag: (position: { lat: number; lng: number }) => void;
  isLoaded: boolean;
}

export default function Mapa({ center, onMarkerDrag, isLoaded }: MapaProps) {
  const options = useMemo(() => ({
    mapId: 'spoon-map',
    disableDefaultUI: false,
    clickableIcons: false,
  }), []);

  if (!isLoaded) {
    return <div className="h-[600px] bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Cargando mapa...</p>
    </div>;
  }

  return (
    <GoogleMap
      zoom={15}
      center={center}
      mapContainerClassName="h-[600px] w-full"
      options={options}
    >
      <Marker
        position={center}
        draggable={true}
        onDragEnd={(e) => {
          if (e.latLng) {
            onMarkerDrag({
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            });
          }
        }}
      />
    </GoogleMap>
  );
}
