// src/shared/Context/theme-context.tsx

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { spoonTheme } from '../Styles/spoon-theme';

// Definimos el tipo para el contexto
interface ThemeContextType {
  theme: typeof spoonTheme;
  setTheme: (theme: typeof spoonTheme) => void;
}

// Creamos el contexto con un valor inicial null
export const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState(spoonTheme);

  const value = {
    theme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personalizado para usar el tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
