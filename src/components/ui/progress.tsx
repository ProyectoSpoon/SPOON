import * as React from "react"

interface ProgressProps {
  value: number;
  className?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-100 ${className}`}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-[#FF9933] transition-all"
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </div>
    )
  }
)

Progress.displayName = "Progress"