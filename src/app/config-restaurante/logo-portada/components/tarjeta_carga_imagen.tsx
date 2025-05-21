// src/app/pages/logo-portada/components/tarjeta_carga_imagen.tsx
'use client';

import React, { useRef, useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Input,
  Image,
  Icon,
  IconButton,
} from '@chakra-ui/react';
import { FiUpload, FiX } from 'react-icons/fi';

interface PropsTarjetaCargaImagen {
  titulo: string;
  descripcion?: string;
  tipo: 'logo' | 'portada';
  onFileChange: (archivo: File) => void;
  archivo?: {
    archivo: File | null;
    previewUrl: string | null;
    estado: string;
    error?: string;
  };
}

const TarjetaCargaImagen: React.FC<PropsTarjetaCargaImagen> = ({
  titulo,
  descripcion = 'Arrastra una imagen o haz clic para seleccionar',
  tipo,
  archivo,
  onFileChange
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileChange(file);
  };

  return (
    <Box
      borderWidth={2}
      borderStyle="dashed"
      borderColor={isDragging ? "blue.400" : "gray.200"}
      borderRadius="xl"
      p={6}
      bg={isDragging ? "blue.50" : "white"}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <VStack spacing={4} align="stretch">
        <Text fontWeight="bold" fontSize="lg">{titulo}</Text>
        
        {archivo?.previewUrl ? (
          // Vista previa de la imagen
          <Box position="relative">
            <Image
              src={archivo.previewUrl}
              alt={titulo}
              objectFit="cover"
              borderRadius="md"
              maxH="200px"
              w="100%"
            />
            <IconButton
              aria-label="Eliminar imagen"
              icon={<FiX />}
              position="absolute"
              top={2}
              right={2}
              size="sm"
              colorScheme="red"
              onClick={() => onFileChange(null as any)}
            />
          </Box>
        ) : (
          // Área de carga
          <VStack
            py={10}
            spacing={4}
            cursor="pointer"
            onClick={() => inputRef.current?.click()}
          >
            <Icon as={FiUpload} w={12} h={12} color="gray.400" />
            <Text color="gray.500" textAlign="center">
              {descripcion}
            </Text>
            <Text fontSize="sm" color="gray.400">
              {tipo === 'logo' 
                ? 'Tamaño recomendado: 400x400px' 
                : 'Tamaño recomendado: 1200x400px'}
            </Text>
          </VStack>
        )}

        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileChange(file);
          }}
          hidden
        />
      </VStack>
    </Box>
  );
};

export default TarjetaCargaImagen;