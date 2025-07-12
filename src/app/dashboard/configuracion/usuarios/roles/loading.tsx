// src/app/dashboard/usuarios/loading.tsx
'use client'

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Encabezado Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>

      {/* Tabla Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header Section */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div className="h-7 w-40 bg-muted animate-pulse rounded" />
            <div className="h-10 w-64 bg-muted animate-pulse rounded" />
          </div>
        </div>

        {/* Body Section */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 border-b pb-4">
              <div className="h-4 bg-muted animate-pulse rounded col-span-1" />
              <div className="h-4 bg-muted animate-pulse rounded col-span-1" />
              <div className="h-4 bg-muted animate-pulse rounded col-span-1" />
              <div className="h-4 bg-muted animate-pulse rounded col-span-1" />
            </div>

            {/* Table Rows */}
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 items-center">
                  {/* Usuario column */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  </div>
                  {/* Other columns */}
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-16 bg-muted animate-pulse rounded justify-self-end" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
