'use client';

type ToastVariant = 'default' | 'destructive' | 'success';

interface ToastOptions {
  title: string;
  description: string;
  variant?: ToastVariant;
  duration?: number;
}

/**
 * Hook para mostrar mensajes toast en la aplicación
 * Esta es una implementación simple para satisfacer las necesidades inmediatas
 */
export function useToast() {
  const toast = (options: ToastOptions) => {
    const { title, description, variant = 'default', duration = 5000 } = options;
    
    // Crear el elemento toast
    const toastElement = document.createElement('div');
    
    // Aplicar estilos según la variante
    let bgColor = '#f4821f'; // default (naranja de Spoon)
    let textColor = 'white';
    
    if (variant === 'destructive') {
      bgColor = '#e11d48'; // rojo
    } else if (variant === 'success') {
      bgColor = '#22c55e'; // verde
    }
    
    // Aplicar estilos al toast
    Object.assign(toastElement.style, {
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      padding: '1rem',
      borderRadius: '0.5rem',
      backgroundColor: bgColor,
      color: textColor,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      zIndex: '9999',
      maxWidth: '24rem',
      animation: 'fade-in 0.3s ease-in-out',
    });
    
    // Crear contenido del toast
    toastElement.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 0.25rem;">${title}</div>
      <div>${description}</div>
    `;
    
    // Añadir al DOM
    document.body.appendChild(toastElement);
    
    // Eliminar después de la duración
    setTimeout(() => {
      toastElement.style.animation = 'fade-out 0.3s ease-in-out';
      
      // Eliminar el elemento después de la animación
      setTimeout(() => {
        document.body.removeChild(toastElement);
      }, 300);
    }, duration);
  };
  
  return { toast };
}

// Agregar las animaciones al documento
if (typeof document !== 'undefined') {
  // Solo ejecutar en el cliente
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(1rem); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fade-out {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(1rem); }
    }
  `;
  document.head.appendChild(style);
}
