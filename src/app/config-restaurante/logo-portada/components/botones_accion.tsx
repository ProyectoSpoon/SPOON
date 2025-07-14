'use client';

import { motion } from 'framer-motion';

interface PropsBotonesAccion {
  puedeGuardar: boolean;
  onGuardar: () => void;
  onCancelar: () => void;
}

const BotonesAccion = ({ puedeGuardar, onGuardar, onCancelar }: PropsBotonesAccion) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-4 justify-end">
        <button
          onClick={onCancelar}
          className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-md transition-colors"
        >
          Cancelar
        </button>
        
        <div className="relative group">
          <button
            onClick={onGuardar}
            disabled={!puedeGuardar}
            className={`
              px-4 py-2 rounded-md transition-all duration-250
              ${puedeGuardar 
                ? 'bg-spoon-primary hover:bg-spoon-primary-dark text-white hover:scale-105'
                : 'bg-neutral-200 cursor-not-allowed text-neutral-500'
              }
            `}
          >
            Guardar Cambios
          </button>
          
          {!puedeGuardar && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Complete todos los campos requeridos
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BotonesAccion;


























