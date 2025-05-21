// src/shared/hooks/use-theme.ts
import { useContext } from 'react';
import { ThemeContext } from '../Context/theme-context';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// src/shared/hooks/index.ts
export * from './use-theme';
export * from './use-media-query';