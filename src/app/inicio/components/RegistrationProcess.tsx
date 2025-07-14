// /app/inicio/components/RegistrationProcess.tsx
import { motion } from 'framer-motion';
import { ScrollReveal, GeometricPattern } from '@/shared/components/ui/Animated';

const steps = [
  {
    number: "1",
    title: "Completa el registro",
    description: "Llena el formulario con los datos de tu restaurante",
  },
  {
    number: "2",
    title: "Sube documentos",
    description: "Proporciona la documentación necesaria",
  },
  {
    number: "3",
    title: "¡Listo!",
    description: "Comienza a gestionar tu restaurante",
  }
];

export const RegistrationProcess = () => {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0">
        <GeometricPattern pattern="dots" opacity={0.02} />
      </div>
      
      <div className="container mx-auto px-6 relative">
        {/* Encabezado */}
        <ScrollReveal>
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Proceso de registro
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Simple, rápido y efectivo
            </p>
          </div>
        </ScrollReveal>

        <div className="relative max-w-5xl mx-auto">
          {/* Línea conectora */}
          <motion.div
            className="absolute left-0 right-0 top-1/2 h-px hidden lg:block"
            style={{
              background: 'linear-gradient(to right, transparent, rgba(244, 130, 31, 0.2), transparent)',
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
              <ScrollReveal
                key={index}
                delay={index * 0.2}
              >
                <motion.div
                  className="relative bg-white p-8 pt-16 rounded-2xl group
                            border border-neutral-100 hover:border-spoon-primary/20
                            transition-all duration-300 shadow-sm hover:shadow-md"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Número del paso - Corregida la posición */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <motion.div
                      className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center
                                border border-neutral-100 group-hover:border-spoon-primary/20
                                shadow-sm group-hover:shadow-md transition-all duration-300"
                    >
                      <span className="text-2xl font-bold text-spoon-primary">
                        {step.number}
                      </span>
                    </motion.div>
                  </div>

                  {/* Contenido */}
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold text-neutral-900 
                                  group-hover:text-spoon-primary transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-neutral-600 leading-relaxed
                                group-hover:text-neutral-700 transition-colors duration-300">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <button className="bg-spoon-primary text-white px-8 py-4 rounded-xl
                            hover:bg-spoon-primary-dark transition-colors duration-300
                            font-medium shadow-sm hover:shadow-md">
            Comienza ahora
          </button>
        </motion.div>
      </div>
    </section>
  );
};



























