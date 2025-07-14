import React from 'react';

interface HeaderSectionProps {
  restaurantId: string;
  userId: string;
}

export function HeaderSection({ restaurantId, userId }: HeaderSectionProps) {
  return (
    <div className="flex justify-between items-center bg-gray-50 p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-700">Menu del Día</h1>
        <p className="text-sm text-gray-500">
          Restaurante: {restaurantId} | Usuario: {userId}
        </p>
      </div>
    </div>
  );
}
