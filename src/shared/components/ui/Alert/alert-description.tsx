import * as React from "react";
import { cn } from "@/lib/utils";

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm", className)}
      {...props}
    />
  )
);
AlertDescription.displayName = "AlertDescription";

export { AlertDescription };



























