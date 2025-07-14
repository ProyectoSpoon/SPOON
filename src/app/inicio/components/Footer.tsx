// /app/inicio/components/Footer.tsx
import { motion } from 'framer-motion';
import { GeometricPattern } from '@/shared/components/ui/Animated';

export const Footer = () => {
  return (
    <footer className="py-20 relative overflow-hidden bg-neutral-900">
      {/* Patrón de fondo sutil */}
      <GeometricPattern pattern="dots" opacity={0.03} />
      
      {/* Gradiente sutil animado */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(244, 130, 31, 0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(244, 130, 31, 0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(244, 130, 31, 0.08) 0%, transparent 50%)',
          ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="container mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Logo */}
          <motion.div
            className="inline-block"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-[#F4821F] to-transparent 
                          opacity-20 blur-xl rounded-full"
                animate={{
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <h1 className="relative text-4xl font-bold text-white tracking-tight">
                SPOON
              </h1>
            </div>
          </motion.div>

          {/* Eslogan */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xl text-white/80 tracking-wide">
              <span className="px-2">Explora</span>
              <span className="text-spoon-primary">•</span>
              <span className="px-2">Elige</span>
              <span className="text-spoon-primary">•</span>
              <span className="px-2">Disfruta</span>
            </p>

            <p className="text-neutral-400 max-w-2xl mx-auto">
              Transforma la experiencia gastronómica de tus clientes con tecnología 
              diseñada para restaurantes modernos.
            </p>
          </motion.div>

          {/* Enlaces y navegación */}
          <nav className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Copyright */}
              <p className="text-sm text-neutral-500">
                © {new Date().getFullYear()} SPOON. Todos los derechos reservados.
              </p>

              {/* Links */}
              <div className="flex items-center gap-8">
                {['Términos', 'Privacidad', 'Contacto'].map((item, index) => (
                  <motion.a
                    key={item}
                    href="#"
                    className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item}
                  </motion.a>
                ))}
              </div>

              {/* Redes sociales */}
              <div className="flex items-center gap-4">
                {['twitter', 'instagram', 'linkedin'].map((social) => (
                  <motion.a
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-full flex items-center justify-center
                             bg-white/5 hover:bg-spoon-primary/10 
                             text-neutral-400 hover:text-spoon-primary
                             transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="sr-only">{social}</span>
                    {/* Aquí puedes usar los iconos de tu preferencia */}
                  </motion.a>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </footer>
  );
};



























