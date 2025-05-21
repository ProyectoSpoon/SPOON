import { Card } from '@/shared/components/ui/Card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { DatosGrafico } from '../types/types';

interface GraficoVentasProps {
  datos: DatosGrafico[];
  formatearMoneda: (valor: number) => string;
}

export const GraficoVentas = ({ datos, formatearMoneda }: GraficoVentasProps) => (
  <Card className="p-6 bg-white">
    <h3 className="text-lg font-semibold mb-4">Tendencia de Ventas</h3>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis 
            tickFormatter={(value) => `$${value/1000}k`}
          />
          <Tooltip 
            formatter={(value: number) => [
              formatearMoneda(value),
              "Ventas"
            ]}
          />
          <Line
            type="monotone"
            dataKey="ventas"
            stroke="#F4821F"
            strokeWidth={2}
            dot={{ fill: "#F4821F" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </Card>
);