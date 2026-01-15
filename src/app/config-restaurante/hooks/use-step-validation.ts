import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useConfigStore } from '../store/config-store';
import { useAuth } from '@/context/postgres-authcontext';
import { useToast } from '@/shared/Hooks/use-toast';

interface StepValidationConfig {
    currentStep: 'informacion-general' | 'ubicacion' | 'horario-comercial' | 'logo-portada';
    redirectTo?: string;
}

/**
 * Hook para validar que el usuario haya completado los pasos previos
 * antes de acceder al paso actual.
 * 
 * Redirige automáticamente al selector si falta completar pasos anteriores.
 */
export const useStepValidation = ({
    currentStep,
    redirectTo = '/config-restaurante'
}: StepValidationConfig) => {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { esSeccionCompleta } = useConfigStore();
    const { toast } = useToast();

    useEffect(() => {
        // No validar mientras se carga la autenticación
        if (authLoading) return;

        // Si no hay usuario, dejamos que la página maneje la auth
        if (!user) return;

        // Información General siempre es accesible (es el primer paso)
        if (currentStep === 'informacion-general') return;

        // Si no hay restaurante creado, solo permitir Información General
        if (!user.restaurantId) {
            console.log('⚠️ No hay restaurante. Redirigiendo al primer paso...');
            toast({
                title: 'Completa primero la información general',
                description: 'Necesitas crear tu restaurante antes de continuar',
                variant: 'default'
            });
            router.push('/config-restaurante/informacion-general');
            return;
        }

        // Definir prerrequisitos para cada paso
        const prerequisites: Record<string, string[]> = {
            'ubicacion': ['/config-restaurante/informacion-general'],
            'horario-comercial': [
                '/config-restaurante/informacion-general',
                '/config-restaurante/ubicacion'
            ],
            'logo-portada': [
                '/config-restaurante/informacion-general',
                '/config-restaurante/ubicacion',
                '/config-restaurante/horario-comercial'
            ]
        };

        // Verificar si hay pasos previos incompletos
        const requiredSteps = prerequisites[currentStep] || [];
        const incompleteStep = requiredSteps.find(step => !esSeccionCompleta(step));

        if (incompleteStep) {
            const stepNames: Record<string, string> = {
                '/config-restaurante/informacion-general': 'Información General',
                '/config-restaurante/ubicacion': 'Ubicación',
                '/config-restaurante/horario-comercial': 'Horarios'
            };

            console.log(`⚠️ Paso incompleto detectado: ${incompleteStep}`);

            toast({
                title: 'Completa los pasos anteriores',
                description: `Primero debes completar: ${stepNames[incompleteStep] || 'el paso anterior'}`,
                variant: 'default'
            });

            // Redirigir al selector para que el usuario elija
            router.push(redirectTo);
        }
    }, [authLoading, user, user?.restaurantId, currentStep, router, redirectTo, esSeccionCompleta, toast]);

    return {
        isValidating: authLoading
    };
};
