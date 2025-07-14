// /app/inicio/components/Benefits.tsx
'use client'

import { motion } from 'framer-motion';
import { MotionComponentProps } from '@/shared/types/motion.types';
import { Tilt3D, ScrollReveal } from '@/shared/components/ui/Animated';
import { useParallax } from '@/shared/Hooks/Animations';

interface Benefit {
  img: string;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    img: "/images/analytics-chart.png",
    title: "Aumenta tus ventas",
    description: "Llega a más clientes y aumenta tus ingresos con nuestra plataforma digital.",
  },
  {
    img: "/images/store-front.png",
    title: "Mayor visibilidad",
    description: "Destaca tu restaurante y conecta con nuevos clientes potenciales en tu área.",
  },
  {
    img: "/images/dashboard-control.jpg",
    title: "Control total",
    description: "Gestiona tu negocio de manera eficiente desde un solo lugar, simplificando tus operaciones.",
  }
];

export const Benefits = () => {
  const { y } = useParallax({ offset: 50, speed: 0.5 });

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-50/50 to-transparent"
        style={{ y }}
      />
      
      <div className="container mx-auto px-6 relative">
        {/* Título de sección */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            Impulsa tu Restaurante
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Descubre cómo SPOON puede ayudarte a crecer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {benefits.map((benefit, index) => (
            <ScrollReveal 
              key={index}
              variant="stagger"
              delay={index * 0.2}
            >
              <Tilt3D
                variant="subtle"
                glareEnabled
                className="h-full"
              >
                <div className="relative p-8 rounded-2xl bg-white group
                               border border-neutral-100 hover:border-neutral-200
                               transition-all duration-300
                               shadow-sm hover:shadow-md">
                  <div className="relative z-10 space-y-6">
                    <motion.div 
                      className="w-48 h-48 mx-auto relative overflow-hidden rounded-2xl"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Overlay gradiente */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#F4821F]/10 to-transparent
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <img 
                        src={benefit.img}
                        alt={benefit.title}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-center text-neutral-900
                                 group-hover:text-spoon-primary transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    
                    <p className="text-neutral-600 leading-relaxed text-center
                                group-hover:text-neutral-700 transition-colors duration-300">
                      {benefit.description}
                    </p>

                    {/* Indicador de hover */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2
                                  w-12 h-1 rounded-full bg-spoon-primary/20
                                  group-hover:bg-spoon-primary transition-colors duration-300" />
                  </div>
                </div>
              </Tilt3D>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};



























