'use client';

import { ResumenVentas } from './components';
import { motion } from 'framer-motion';

export default function VisionGeneralPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="flex items-center">
        <div className="flex-grow">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F4821F] to-[#CC6A10] bg-clip-text text-transparent">
            Visión General
          </h1>
          <p className="text-gray-500 mt-2">
            Resumen y análisis de tu negocio en tiempo real
          </p>
        </div>
        <div className="hidden md:block">
          <img 
            src="/images/analytics-chart.svg" 
            alt="Analytics" 
            className="h-16 w-16 opacity-80" 
          />
        </div>
      </div>
      <ResumenVentas />
    </motion.div>
  );
}
