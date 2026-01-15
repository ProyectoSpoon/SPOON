// src/app/config-restaurante/ubicacion/components/MapaInteractivo.tsx
'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { GoogleMap, Marker, useGoogleMap } from '@react-google-maps/api';

interface MapaInteractivoProps {
    lat: number;
    lng: number;
    onLocationChange: (lat: number, lng: number, address?: string) => void;
    searchQuery?: string;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.75rem',
};

const defaultCenter = {
    lat: 4.6097102,
    lng: -74.081749, // Bogotá
};

const options = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    styles: [
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
        },
    ],
};

// Component helper to re-center map when props change
const MapUpdater = ({ lat, lng }: { lat: number; lng: number }) => {
    const map = useGoogleMap();
    useEffect(() => {
        if (map && lat && lng) {
            map.panTo({ lat, lng });
        }
    }, [map, lat, lng]);
    return null;
};

export default function MapaInteractivo({ lat, lng, onLocationChange, searchQuery }: MapaInteractivoProps) {
    const center = useMemo(() => ({ lat, lng }), [lat, lng]);
    const [markerPosition, setMarkerPosition] = useState(center);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    const onLoad = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    // Reverse Geocoding Helper
    const reverseGeocode = useCallback((lat: number, lng: number) => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                // Pass address back to parent
                onLocationChange(lat, lng, results[0].formatted_address);
            } else {
                onLocationChange(lat, lng);
            }
        });
    }, [onLocationChange]);

    // Handle address geocoding (Search)
    useEffect(() => {
        if (searchQuery && map) {
            const geocoder = new google.maps.Geocoder();
            const timeoutId = setTimeout(() => {
                geocoder.geocode({ address: searchQuery }, (results, status) => {
                    if (status === 'OK' && results && results[0]) {
                        const { lat, lng } = results[0].geometry.location;
                        const newLat = lat();
                        const newLng = lng();

                        if (Math.abs(newLat - markerPosition.lat) > 0.0001 ||
                            Math.abs(newLng - markerPosition.lng) > 0.0001) {
                            setMarkerPosition({ lat: newLat, lng: newLng });
                            // Don't reverse geocode here to avoid loops with the input
                            onLocationChange(newLat, newLng);
                            map.panTo({ lat: newLat, lng: newLng });
                            map.setZoom(17);
                        }
                    }
                });
            }, 800);

            return () => clearTimeout(timeoutId);
        }
    }, [searchQuery, map, onLocationChange, markerPosition]);

    // Sync internal state if prop changes
    useEffect(() => {
        setMarkerPosition({ lat, lng });
    }, [lat, lng]);

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newLat = e.latLng.lat();
            const newLng = e.latLng.lng();
            setMarkerPosition({ lat: newLat, lng: newLng });
            reverseGeocode(newLat, newLng);
        }
    }, [reverseGeocode]);

    const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newLat = e.latLng.lat();
            const newLng = e.latLng.lng();
            setMarkerPosition({ lat: newLat, lng: newLng });
            reverseGeocode(newLat, newLng);
        }
    }, [reverseGeocode]);

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setMarkerPosition({ lat: latitude, lng: longitude });
                    if (map) {
                        map.panTo({ lat: latitude, lng: longitude });
                        map.setZoom(17);
                    }
                    reverseGeocode(latitude, longitude);
                    setIsLocating(false);
                },
                (error) => {
                    console.error("Error getting location", error);
                    setIsLocating(false);
                }
            );
        }
    };

    return (
        <div className="relative w-full h-full">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={15}
                options={options}
                onClick={onMapClick}
                onLoad={onLoad}
                onUnmount={onUnmount}
            >
                <Marker
                    position={markerPosition}
                    draggable={true}
                    onDragEnd={onMarkerDragEnd}
                    animation={google.maps.Animation.DROP}
                />
                <MapUpdater lat={center.lat} lng={center.lng} />
            </GoogleMap>

            <button
                onClick={handleCurrentLocation}
                className="absolute bottom-6 right-6 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10 text-gray-700"
                title="Mi ubicación actual"
                disabled={isLocating}
            >
                {isLocating ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                )}
            </button>
        </div>
    );
}
