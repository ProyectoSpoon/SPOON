// src/shared/hooks/useToast.ts 
import { toast } from '@/shared/components/ui/Toast/use-toast'

type ToastProps = {
  title?: string
  description: string
  variant?: 'default' | 'destructive'
  type?: 'default' | 'destructive' | 'warning' | 'success'
  duration?: number
  action?: React.ReactElement
}

export const useToast = () => {
  const showToast = ({
    title,
    description,
    variant = 'default',
    type,
    duration = 5000,
    action
  }: ToastProps) => {
    // Si se proporciona type, lo usamos para determinar variant
    const effectiveVariant = type === 'destructive' ? 'destructive' : variant;
    
    return toast({
      title,
      description,
      variant: effectiveVariant,
      duration,
      action
    })
  }

  return { toast: showToast }
}
