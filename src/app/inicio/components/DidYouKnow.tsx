// /app/inicio/components/DidYouKnow.tsx
import { motion } from 'framer-motion';
import { ScrollReveal, GeometricPattern } from '@/shared/components/ui/Animated';

export const DidYouKnow = () => {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Patrones geométricos sutiles */}
      <div className="absolute inset-0">
        <GeometricPattern pattern="dots" opacity={0.02} />
      </div>
      
      {/* Círculos decorativos con gradientes suaves */}
      <motion.div
        className="absolute right-0 top-0 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(244, 130, 31, 0.03) 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="container mx-auto px-6 relative">
        <ScrollReveal 
          className="max-w-4xl mx-auto"
        >
          <div className="text-center space-y-12">
            {/* Título con efecto */}
            <motion.div 
              className="inline-block relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-[#F4821F]/5 to-transparent blur-xl"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="relative space-y-4">
                <h2 className="text-4xl font-bold text-neutral-900">
                  ¿Sabías que...?
                </h2>
              </div>
            </motion.div>

            {/* Contenido principal */}
            <div className="relative">
              {/* Borde decorativo */}
              <div className="absolute -inset-6 rounded-3xl border border-neutral-100" />
              
              {/* Tarjeta principal */}
              <div className="relative bg-white rounded-2xl p-12 shadow-sm">
                <motion.p 
                  className="text-2xl text-neutral-700 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  Explorar menús en <span className="text-spoon-primary font-semibold">Spoon</span> no solo 
                  facilita tu decisión al momento de salir a comer.
                </motion.p>

                <motion.p 
                  className="mt-6 text-2xl text-neutral-700 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  También <span className="font-semibold">impulsa a miles de propietarios</span> de 
                  restaurantes a compartir su oferta gastronómica, ayudándolos a destacar y 
                  conectar con más comensales.
                </motion.p>

                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-neutral-100">
                  {[
                    { number: "2,500+", label: "Restaurantes" },
                    { number: "45K+", label: "Usuarios activos" },
                    { number: "4.9", label: "Calificación" }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                    >
                      <div className="text-3xl font-bold text-spoon-primary mb-2">
                        {stat.number}
                      </div>
                      <div className="text-sm text-neutral-600 font-medium">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};



























