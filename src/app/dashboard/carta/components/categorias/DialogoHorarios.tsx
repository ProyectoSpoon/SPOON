// src/app/dashboard/carta/components/categorias/DialogoHorarios.tsx
import { useState } from 'react'; // Añadir esta importación
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';
import { Switch } from '@/shared/components/ui/Switch';
import { useCategoriasStore } from '../../store/categoriasStore';
import { Categoria } from '../../types/menu.types';

/**
 * Props para el componente DialogoHorarios.
 */
export interface DialogoHorariosProps {
  /**
   * Controla si el diálogo está abierto o cerrado.
   */
  open: boolean;
  /**
   * Función para manejar el cambio de estado del diálogo.
   */
  onOpenChange: (open: boolean) => void;
  /**
   * ID de la categoría que se está configurando.
   */
  categoriaId: string | null;
}

/**
 * Configuración de horarios
 */
interface HorarioConfig {
  activo: boolean;
  dias: Record<string, boolean>;
  horaInicio: string;
  horaFin: string;
}

const diasSemana = [
  { id: 'lunes', label: 'Lunes' },
  { id: 'martes', label: 'Martes' },
  { id: 'miercoles', label: 'Miércoles' },
  { id: 'jueves', label: 'Jueves' },
  { id: 'viernes', label: 'Viernes' },
  { id: 'sabado', label: 'Sábado' },
  { id: 'domingo', label: 'Domingo' },
];

/**
 * Diálogo para configurar horarios de una categoría.
 */
export function DialogoHorarios({ open, onOpenChange, categoriaId }: DialogoHorariosProps) {
  // Inicializar el estado fuera de la renderización
  const [config, setConfig] = useState<HorarioConfig>({
    activo: false,
    dias: {
      lunes: false,
      martes: false,
      miercoles: false,
      jueves: false,
      viernes: false,
      sabado: false,
      domingo: false,
    },
    horaInicio: '09:00',
    horaFin: '22:00',
  });

  // Usar useCategoriasStore si es necesario
  const { actualizarCategoria } = useCategoriasStore();

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (categoriaId) {
      try {
        await actualizarCategoria(categoriaId, {
          horarios: {
            activo: config.activo,
            dias: Object.entries(config.dias)
              .filter(([_, activo]) => activo)
              .map(([dia]) => dia),
            horaInicio: config.horaInicio,
            horaFin: config.horaFin,
          }
        });
        onOpenChange(false);
      } catch (error) {
        console.error('Error al guardar horarios:', error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Configurar Horarios</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleGuardar} className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="horarios-activos">Activar horarios</Label>
            <Switch
              id="horarios-activos"
              checked={config.activo}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, activo: checked }))
              }
            />
          </div>

          <div className="space-y-4">
            <Label>Días disponibles</Label>
            <div className="grid grid-cols-2 gap-4">
              {diasSemana.map((dia) => (
                <div key={dia.id} className="flex items-center space-x-2">
                  <Switch
                    id={dia.id}
                    checked={config.dias[dia.id]}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({
                        ...prev,
                        dias: {
                          ...prev.dias,
                          [dia.id]: checked
                        }
                      }))
                    }
                    disabled={!config.activo}
                  />
                  <Label htmlFor={dia.id}>{dia.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hora-inicio">Hora de inicio</Label>
              <Input
                type="time"
                id="hora-inicio"
                value={config.horaInicio}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    horaInicio: e.target.value
                  }))
                }
                disabled={!config.activo}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora-fin">Hora de fin</Label>
              <Input
                type="time"
                id="hora-fin"
                value={config.horaFin}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    horaFin: e.target.value
                  }))
                }
                disabled={!config.activo}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!config.activo}>
              Guardar configuración
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}