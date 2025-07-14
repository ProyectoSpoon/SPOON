import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function NavigationSection() {
  return (
    <div className="flex items-center border-b border-gray-200 bg-white shadow-sm">
      <button className="p-2 rounded-full border border-gray-200 mx-2">
        <ChevronLeft className="h-4 w-4 text-gray-500" />
      </button>

      <div className="flex space-x-4 overflow-x-auto py-2 px-4">
        <button className="px-3 py-1 font-medium text-sm capitalize text-spoon-primary border-b-2 border-spoon-primary">
          Almuerzo
        </button>
      </div>
      
      <button className="p-2 rounded-full border border-gray-200 mx-2">
        <ChevronRight className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
}
