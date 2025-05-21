'use client'
import React from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Flex,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';

// Props que acepta el componente
interface PropIndicadorProgreso {
  pasos: Array<{
    titulo: string;
    descripcion: string;
  }>;
  pasoActual: number;
}

const IndicadorProgreso: React.FC<PropIndicadorProgreso> = ({ 
  pasos, 
  pasoActual 
}) => {
  // Colores para los diferentes estados
  const colorCompletado = useColorModeValue('spoon.500', 'spoon.400');
  const colorActivo = useColorModeValue('blue.500', 'blue.400');
  const colorPendiente = useColorModeValue('gray.200', 'gray.600');
  const colorTexto = useColorModeValue('gray.600', 'gray.400');

  // Animación para los pasos
  const variantesAnimacion = {
    inactivo: { scale: 1 },
    activo: { scale: 1.1 },
    completado: { scale: 1, backgroundColor: colorCompletado }
  };

  return (
    <Box py={8}>
      <Flex justify="space-between" align="center" position="relative">
        {/* Línea de progreso */}
        <Box
          position="absolute"
          height="2px"
          width="100%"
          bg={colorPendiente}
          zIndex={0}
        >
          <Box
            height="100%"
            width={`${(pasoActual / (pasos.length - 1)) * 100}%`}
            bg={colorCompletado}
            transition="width 0.5s ease-in-out"
          />
        </Box>

        {/* Pasos */}
        {pasos.map((paso, index) => {
          const estaCompleto = index < pasoActual;
          const estaActivo = index === pasoActual;

          return (
            <Tooltip
              key={paso.titulo}
              label={paso.descripcion}
              hasArrow
              placement="top"
            >
              <Box position="relative" zIndex={1}>
                <motion.div
                  variants={variantesAnimacion}
                  animate={
                    estaActivo ? 'activo' : 
                    estaCompleto ? 'completado' : 
                    'inactivo'
                  }
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Flex
                    w="40px"
                    h="40px"
                    borderRadius="full"
                    bg={
                      estaCompleto ? colorCompletado :
                      estaActivo ? 'white' :
                      colorPendiente
                    }
                    border="2px solid"
                    borderColor={
                      estaCompleto ? colorCompletado :
                      estaActivo ? colorActivo :
                      colorPendiente
                    }
                    justify="center"
                    align="center"
                    fontSize="sm"
                    fontWeight="bold"
                    color={
                      estaCompleto ? 'white' :
                      estaActivo ? colorActivo :
                      colorTexto
                    }
                  >
                    {estaCompleto ? '✓' : index + 1}
                  </Flex>
                </motion.div>

                {/* Título del paso */}
                <Text
                  mt={2}
                  textAlign="center"
                  fontSize="sm"
                  fontWeight={estaActivo ? 'bold' : 'medium'}
                  color={estaActivo ? colorActivo : colorTexto}
                  maxW="120px"
                  mx="auto"
                >
                  {paso.titulo}
                </Text>
              </Box>
            </Tooltip>
          )
        })}
      </Flex>
    </Box>
  );
};

export default IndicadorProgreso;