// src/app/dashboard/usuarios/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded"></div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-40 bg-gray-200 rounded"></div>
            <div className="h-10 w-64 bg-gray-200 rounded"></div>
          </div>

          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b pb-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded mt-2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



























