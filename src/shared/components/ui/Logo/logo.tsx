// src/shared/components/ui/Logo/logo.tsx
import { LogoProps } from './types';

export const Logo = ({ 
  variant = 'default', 
  size = 'md',
  className = ''
}: LogoProps): JSX.Element => {
  const sizeStyles = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto',
    xl: 'h-16 w-auto'
  };

  const variantStyles = {
    default: 'text-[#F4821F]',
    white: 'text-white',
    black: 'text-black'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <svg 
        className={`${sizeStyles[size]} ${variantStyles[variant]}`}
        viewBox="0 0 400 400" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Círculo naranja */}
        <circle 
          cx="200" 
          cy="200" 
          r="150" 
          fill="currentColor" 
        />
        {/* Cuchara blanca */}
        <path
          d="M200 120
             C 180 120, 160 140, 160 170
             C 160 200, 180 220, 200 220
             L 200 300
             C 160 300, 120 260, 120 210
             C 120 160, 160 120, 200 120"
          fill={variant === 'white' ? '#F4821F' : 'white'}
        />
      </svg>
      <span className={`ml-2 text-2xl font-bold ${variantStyles[variant]}`}>
        Spoon
      </span>
    </div>
  );
};