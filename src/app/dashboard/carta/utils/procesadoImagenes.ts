// src/app/dashboard/carta/utils/procesadoImagenes.ts
interface OpcionesProcesado {
    maxWidth: number;
    maxHeight: number;
    quality: number;
  }
  
  export const procesarImagen = async (
    file: File,
    opciones: OpcionesProcesado
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
  
        // Calcular nuevas dimensiones manteniendo aspecto
        if (width > opciones.maxWidth) {
          height *= opciones.maxWidth / width;
          width = opciones.maxWidth;
        }
        if (height > opciones.maxHeight) {
          width *= opciones.maxHeight / height;
          height = opciones.maxHeight;
        }
  
        canvas.width = width;
        canvas.height = height;
  
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'));
          return;
        }
  
        ctx.drawImage(img, 0, 0, width, height);
  
        canvas.toBlob(
          (blob) => {
            if (blob) {
                resolve(blob);
            } else {
              reject(new Error('Error al procesar la imagen'));
            }
          },
          'image/jpeg',
          opciones.quality / 100
        );
      };
  
      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };
  
      img.src = URL.createObjectURL(file);
    });
  };   