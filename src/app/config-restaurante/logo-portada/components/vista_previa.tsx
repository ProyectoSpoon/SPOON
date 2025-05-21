// src/app/pages/logo-portada/components/vista_previa.tsx
'use client';

import React from 'react';
import {
  Box,
  VStack,
  HStack,  // Añadida esta importación
  Text,
  Image,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Icon,
  Skeleton,
  Badge,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiSmartphone } from 'react-icons/fi';

interface PropsVistaPrevia {
  logo: string | null;
  portada: string | null;
}

const VistaPrevia: React.FC<PropsVistaPrevia> = ({ logo, portada }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <VStack align="start" spacing={2}>
            <Heading size="md">Vista Previa</Heading>
            <Text color="gray.600" fontSize="sm">
              Así se verá en la aplicación
            </Text>
          </VStack>
        </CardHeader>

        <CardBody>
          <VStack spacing={6}>
            {/* Vista móvil */}
            <Box 
              border="1px" 
              borderColor="gray.200" 
              borderRadius="2xl" 
              overflow="hidden"
              w="100%"
              maxW="320px"
              bg="white"
            >
              <VStack spacing={0}>
                {/* Header con icono de móvil */}
                <Box 
                  w="100%" 
                  p={4} 
                  borderBottom="1px" 
                  borderColor="gray.100"
                  bg="gray.50"
                >
                  <HStack spacing={2}>
                    <Icon as={FiSmartphone} />
                    <Text fontSize="sm" fontWeight="medium">Vista Móvil</Text>
                  </HStack>
                </Box>

                {/* Imagen de portada */}
                <Box position="relative" w="100%" h="160px">
                  {portada ? (
                    <Image
                      src={portada}
                      alt="Portada del restaurante"
                      objectFit="cover"
                      w="100%"
                      h="100%"
                    />
                  ) : (
                    <Skeleton h="100%" w="100%" />
                  )}
                  
                  {/* Logo superpuesto */}
                  {logo && (
                    <Box
                      position="absolute"
                      bottom="-30px"
                      left="20px"
                      bg="white"
                      borderRadius="full"
                      p={2}
                      boxShadow="lg"
                    >
                      <Image
                        src={logo}
                        alt="Logo del restaurante"
                        w="60px"
                        h="60px"
                        borderRadius="full"
                        objectFit="cover"
                      />
                    </Box>
                  )}
                </Box>

                {/* Contenido de ejemplo */}
                <Box w="100%" p={6} pt={10}>
                  <VStack align="start" spacing={4}>
                    <Heading size="md">Tu Restaurante</Heading>
                    <Badge colorScheme="green">Abierto ahora</Badge>
                    <Text fontSize="sm" color="gray.600">
                      Aquí aparecerá la descripción de tu restaurante...
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </Box>

            {/* Indicadores de estado */}
            <HStack spacing={4} w="100%" justify="center">
              <Badge 
                colorScheme={logo ? "green" : "gray"}
                variant="subtle"
                px={3}
                py={1}
              >
                Logo: {logo ? "✓" : "Pendiente"}
              </Badge>
              <Badge 
                colorScheme={portada ? "green" : "gray"}
                variant="subtle"
                px={3}
                py={1}
              >
                Portada: {portada ? "✓" : "Pendiente"}
              </Badge>
            </HStack>

            {/* Mensaje informativo */}
            <Box 
              p={4} 
              bg="blue.50" 
              borderRadius="md" 
              w="100%"
            >
              <Text fontSize="sm" color="blue.600">
                Las imágenes se ajustarán automáticamente para mantener la mejor calidad posible en todos los dispositivos.
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default VistaPrevia;