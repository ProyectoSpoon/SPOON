'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Label } from '@/shared/components/ui/Label';

interface InformacionGeneralData {
  nombreRestaurante: string;
  direccion: string;
  telefono: string;
  email: string;
  descripcion: string;
  logoUrl: string;
  sitioWeb: string;
}

const initialData: InformacionGeneralData = {
  nombreRestaurante: '',
  direccion: '',
  telefono: '',
  email: '',
  descripcion: '',
  logoUrl: '',
  sitioWeb: ''
};

export default function InformacionGeneral() {
  const [data, setData] = useState<InformacionGeneralData>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/configuracion/informacion-general');
        
        if (!response.ok) {
          throw new Error('Error al cargar la información general');
        }
        
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar la información general');
      } finally {
        setIsLoading(false);
      }
    };
    
    cargarDatos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/configuracion/informacion-general', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Error al guardar la información general');
      }
      
      toast.success('Información general guardada correctamente');
    } catch (error) {
      console.error('Error al guardar datos:', error);
      toast.error('Error al guardar la información general');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#F4821F]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Información General del Restaurante</h2>
        <Button 
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-[#F4821F] hover:bg-[#E67812] text-white"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nombreRestaurante">Nombre del Restaurante</Label>
            <Input
              id="nombreRestaurante"
              name="nombreRestaurante"
              value={data.nombreRestaurante}
              onChange={handleChange}
              placeholder="Nombre del restaurante"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL del Logo</Label>
            <Input
              id="logoUrl"
              name="logoUrl"
              value={data.logoUrl}
              onChange={handleChange}
              placeholder="https://ejemplo.com/logo.png"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              name="direccion"
              value={data.direccion}
              onChange={handleChange}
              placeholder="Dirección del restaurante"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              name="telefono"
              value={data.telefono}
              onChange={handleChange}
              placeholder="Teléfono de contacto"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={data.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sitioWeb">Sitio Web</Label>
            <Input
              id="sitioWeb"
              name="sitioWeb"
              value={data.sitioWeb}
              onChange={handleChange}
              placeholder="https://ejemplo.com"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            name="descripcion"
            value={data.descripcion}
            onChange={handleChange}
            placeholder="Breve descripción del restaurante"
            rows={4}
          />
        </div>
        
        {/* Vista previa del logo */}
        {data.logoUrl && (
          <div className="mt-4">
            <Label>Vista previa del logo</Label>
            <div className="mt-2 border rounded-md p-4 flex justify-center">
              <img 
                src={data.logoUrl} 
                alt="Logo del restaurante" 
                className="max-h-32 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                  toast.error('Error al cargar la imagen del logo');
                }}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
