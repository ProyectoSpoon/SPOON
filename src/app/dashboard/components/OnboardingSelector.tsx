'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, Store, MapPin, Clock, Image as ImageIcon, ChevronRight } from 'lucide-react';

interface OnboardingStep {
    key: string;
    title: string;
    description: string;
    href: string;
    icon: React.ElementType;
    isComplete: boolean;
}

interface OnboardingSelectorProps {
    status: {
        restaurant: boolean;
        location: boolean;
        hours: boolean;
        images: boolean;
    };
}

export default function OnboardingSelector({ status }: OnboardingSelectorProps) {
    const steps: OnboardingStep[] = [
        {
            key: 'restaurant',
            title: 'Información General',
            description: 'Nombre, descripción y contacto de tu restaurante.',
            href: '/config-restaurante/informacion-general',
            icon: Store,
            isComplete: status.restaurant,
        },
        {
            key: 'location',
            title: 'Ubicación',
            description: 'Dirección exacta y coordenadas para el mapa.',
            href: '/config-restaurante/ubicacion',
            icon: MapPin,
            isComplete: status.location,
        },
        {
            key: 'hours',
            title: 'Horarios de Atención',
            description: 'Define tus días y horas de apertura.',
            href: '/config-restaurante/horario-comercial',
            icon: Clock,
            isComplete: status.hours,
        },
        {
            key: 'images',
            title: 'Logo y Portada',
            description: 'La imagen de tu marca en la app.',
            href: '/config-restaurante/logo-portada',
            icon: ImageIcon,
            isComplete: status.images,
        },
    ];

    const completedCount = steps.filter(s => s.isComplete).length;
    const totalSteps = steps.length;
    const progress = (completedCount / totalSteps) * 100;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Configura tu Restaurante
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Completa estos {totalSteps} pasos para activar tu Dashboard y comenzar a vender.
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2 max-w-md mx-auto overflow-hidden">
                        <div
                            className="bg-orange-500 h-4 rounded-full transition-all duration-500 ease-in-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                        {completedCount} de {totalSteps} completados
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {steps.map((step) => (
                        <Link
                            key={step.key}
                            href={step.href}
                            className={`
                group relative bg-white rounded-xl shadow-sm border-2 p-6 transition-all duration-200
                hover:shadow-md hover:border-orange-200
                ${step.isComplete ? 'border-green-100 bg-green-50/10' : 'border-gray-100'}
              `}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${step.isComplete ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                        <step.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-shrink-0 ml-4">
                                    {step.isComplete ? (
                                        <div className="flex items-center gap-2 text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-medium">
                                            <CheckCircle2 size={16} />
                                            <span>Listo</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-400 group-hover:text-orange-500 transition-colors">
                                            <span className="text-xs font-medium">Configurar</span>
                                            <ChevronRight size={16} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {completedCount === totalSteps && (
                    <div className="mt-10 text-center animate-fade-in">
                        <div className="bg-green-100 text-green-800 p-4 rounded-lg inline-flex items-center gap-2 mb-4">
                            <CheckCircle2 size={20} />
                            <span className="font-medium">¡Todo listo! Recarga la página para entrar.</span>
                        </div>
                        <br />
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                        >
                            Entrar al Dashboard
                        </button>
                    </div>
                )}
            </div>

            {/* Botón de Logout de Emergencia */}
            <div className="mt-8 text-center">
                <button
                    onClick={async () => {
                        // Limpiar todo rastro de sesión
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('user_info');
                        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                        document.cookie = 'user-info=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

                        // Recargar a login
                        window.location.href = '/login';
                    }}
                    className="text-gray-500 hover:text-red-600 text-sm font-medium underline transition-colors"
                >
                    Cerrar Sesión y Reiniciar
                </button>
            </div>
        </div>
    );
}
