'use client'

import { motion } from 'framer-motion';
import { ScrollReveal, AnimatedText } from '@/shared/components/ui/Animated';
import { useParallax } from '@/shared/Hooks/Animations';

export const MenuSection = () => {
  const { y: parallaxY } = useParallax({ offset: 100 });

  return (
    <section className="py-32 relative overflow-hidden bg-neutral-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          {/* Contenido */}
          <ScrollReveal className="lg:w-1/2 space-y-8">
            <div className="space-y-6">
              <motion.div className="relative inline-block overflow-hidden">
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#F4821F]/20 to-transparent blur-xl"
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <AnimatedText
                  variant="slideIn"
                  className="relative text-5xl lg:text-6xl font-bold text-spoon-primary tracking-tight"
                >
                  Siempre a la carta.
                </AnimatedText>
              </motion.div>

              <AnimatedText
                variant="slideUp"
                delay={0.2}
                className="text-3xl font-bold text-neutral-900 tracking-tight"
              >
                Elige antes de ir, disfruta al llegar.
              </AnimatedText>

              <AnimatedText
                variant="fadeIn"
                delay={0.4}
                className="text-lg text-neutral-600 leading-relaxed max-w-xl"
              >
                Con Spoon, tienes el menú en tus manos antes de visitar el restaurante. 
                Descubre tus platos favoritos, selecciona lo que más te apetece y haz de 
                cada salida una experiencia deliciosa y sin sorpresas.
              </AnimatedText>
            </div>

            {/* Botón CTA */}
            <motion.button
              className="mt-8 inline-flex items-center gap-2 bg-white text-spoon-primary 
                         px-8 py-4 rounded-xl border border-neutral-200
                         hover:border-spoon-primary/20 hover:bg-spoon-primary/5
                         transition-all duration-300 font-medium
                         shadow-sm hover:shadow-md"
              whileHover={{ scale: 1.02 }}
            >
              Conoce más
              <svg 
                className="w-5 h-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.button>
          </ScrollReveal>
          
          {/* Imagen */}
          <motion.div 
            className="lg:w-1/2 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Efecto de brillo detrás de la imagen */}
            <motion.div
              className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[#F4821F]/10 to-transparent blur-2xl"
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Contenedor de la imagen */}
            <motion.div
              className="relative rounded-2xl overflow-hidden 
                         border border-neutral-200/50 shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src="/images/menu-experience.jpg"
                alt="Experiencia gastronómica"
                className="w-full h-[600px] object-cover"
              />

              {/* Overlay en hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t 
                           from-black/30 via-black/5 to-transparent"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Decoración esquina */}
              <div className="absolute top-6 right-6 w-20 h-20 
                            border-t-2 border-r-2 border-white/20 
                            rounded-tr-xl" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};



























