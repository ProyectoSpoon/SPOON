'use client';

import { motion } from 'framer-motion';
import { Button, HStack, Tooltip } from '@chakra-ui/react';

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
      <HStack spacing={4} justify="flex-end">
        <Button
          variant="outline"
          onClick={onCancelar}
          className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
        >
          Cancelar
        </Button>
        
        <Tooltip label={!puedeGuardar ? "Complete todos los campos requeridos" : ""}>
          <Button
            onClick={onGuardar}
            disabled={!puedeGuardar}
            className={`
              px-4 py-2 rounded-md transition-all duration-250
              ${puedeGuardar 
                ? 'bg-primary-main hover:bg-primary-dark text-white'
                : 'bg-neutral-200 cursor-not-allowed text-neutral-500'
              }
            `}
            _hover={puedeGuardar ? { transform: 'scale(1.05)' } : {}}
          >
            Guardar Cambios
          </Button>
        </Tooltip>
      </HStack>
    </motion.div>
  );
};

export default BotonesAccion;