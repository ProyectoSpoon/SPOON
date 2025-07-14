'use client';

import { useCallback } from 'react';

interface ParticlesBackgroundProps {
  className?: string;
  particleColor?: string;
  particleCount?: number;
}

export const ParticlesBackground = ({ 
  className = "",
  particleColor = "#ffffff",
  particleCount = 50 
}: ParticlesBackgroundProps) => {
  // Componente simplificado sin dependencias externas
  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{
        background: `radial-gradient(circle at 20% 50%, ${particleColor}10 0%, transparent 50%), 
                     radial-gradient(circle at 80% 20%, ${particleColor}10 0%, transparent 50%), 
                     radial-gradient(circle at 40% 80%, ${particleColor}10 0%, transparent 50%)`
      }}
    >
      {/* Simulación de partículas con CSS */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: Math.min(particleCount, 20) }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-pulse"
            style={{
              backgroundColor: particleColor,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ParticlesBackground;



























