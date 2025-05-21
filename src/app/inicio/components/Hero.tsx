// Hero.tsx con ajustes visuales
'use client'

import { motion } from 'framer-motion';
import { ParticlesBackground } from '@/shared/components/ui/Animated';
import FormularioRegistro from './FormularioRegistro';

export const Hero = () => {
  return (
    <section className="relative min-h-screen bg-neutral-900">
      {/* Imagen de fondo con ajuste de opacidad */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.5)' // Ajustado para mejor contraste
        }}
      />
        
      {/* Overlay más sutil */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Partículas se mantienen igual */}
      <div className="absolute inset-0 z-20">
        <ParticlesBackground variant="sparse" />
      </div>
      
      {/* Contenido */}
      <div className="container mx-auto px-6 py-20 relative z-30">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Contenido izquierdo */}
          <div className="lg:w-1/2 mb-10 lg:mb-0 space-y-8">
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight mb-4">
                SPOON
              </h1>
            </motion.div>
            
            <motion.h2 
              className="text-3xl lg:text-4xl font-bold text-white/90 tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Tu menú, tu restaurante, tu estilo
            </motion.h2>

            <motion.p 
              className="text-xl text-white/80 leading-relaxed max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Con SPOON, muestra tu menú de manera única y atractiva para que los 
              comensales exploren y elijan sus platillos favoritos antes de visitarte. 
              Transforma la experiencia gastronómica con tecnología al servicio de tu restaurante.
            </motion.p>

            <motion.button
              className="mt-8 bg-[#F4821F] text-white px-10 py-4 rounded-xl 
                         hover:bg-[#CC6A10] transition-colors duration-300
                         font-medium text-lg shadow-lg hover:shadow-xl
                         transform hover:-translate-y-0.5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Empieza ahora
            </motion.button>
          </div>
          
          {/* Formulario de registro */}
          <motion.div 
            className="w-full max-w-md lg:w-auto"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold mb-8 text-neutral-800">
                Registra tu restaurante
              </h2>
              <FormularioRegistro />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};