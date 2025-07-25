// src/shared/components/ui/Toast/toaster.tsx
import { cn } from '@/shared/lib/utils'
import { useToast } from './use-toast'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(function ({ id, title, description, action }) {
        return (
          <div
            key={id}
            className={cn(
              "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
              "bg-white border-gray-200"
            )}
          >
            <div className="grid gap-1">
              {title && (
                <div className="text-sm font-semibold">
                  {title}
                </div>
              )}
              {description && (
                <div className="text-sm opacity-90">
                  {description}
                </div>
              )}
            </div>
            {action}
          </div>
        )
      })}
    </div>
  )
}



























