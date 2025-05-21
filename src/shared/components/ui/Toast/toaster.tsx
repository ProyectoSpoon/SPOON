// src/shared/components/ui/Toast/toaster.tsx
import { Toaster as RadixToaster } from '@radix-ui/react-toast'
import { cn } from '@/shared/lib/utils'
import { useState, useEffect } from 'react'
import { useToast } from './use-toast'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <RadixToaster>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </RadixToaster>
  )
}