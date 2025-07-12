// /app/horarios-restaurante/page.tsx

import React from 'react';
import VistaHorariosRestaurante from '@/app/dashboard/horario-comercial/vistas/VistaHorariosRestaurante';

export const metadata = {
  title: 'Gestión de Horarios | Spoon',
  description: 'Administra los horarios de apertura y cierre de tu restaurante',
};

export default function PaginaHorariosRestaurante() {
  return (
    <main>
      <VistaHorariosRestaurante />
    </main>
  );
}
