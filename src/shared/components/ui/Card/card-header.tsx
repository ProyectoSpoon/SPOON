// src/shared/components/ui/Card/card-header.tsx
export function CardHeader({
    className,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) {
    return (
      <div
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
      />
    )
  }