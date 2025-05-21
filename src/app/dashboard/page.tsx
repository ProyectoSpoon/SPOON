'use client';

import { motion } from 'framer-motion';

export default function DashboardPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <h1 className="text-4xl font-bold text-neutral-800">
          Bienvenido al Panel Principal de
          <span className="text-[#F4821F] block mt-2">SPOON</span>
        </h1>
        
        <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
          Gestiona tu restaurante de manera eficiente y mantén el control de todas tus operaciones
        </p>

        <div className="text-sm text-neutral-500">
          Selecciona una opción del menú para comenzar
        </div>
      </motion.div>
    </div>
  );
}