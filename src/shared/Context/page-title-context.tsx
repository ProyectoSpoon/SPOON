'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface PageTitleContextType {
  title: string;
  subtitle: string;
  setPageTitle: (title: string, subtitle?: string) => void;
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(undefined);

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState('Dashboard');
  const [subtitle, setSubtitle] = useState('Sistema de gestión SPOON');

  const setPageTitle = (newTitle: string, newSubtitle?: string) => {
    setTitle(newTitle);
    setSubtitle(newSubtitle || 'Sistema de gestión SPOON');
  };

  return (
    <PageTitleContext.Provider value={{ title, subtitle, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle() {
  const context = useContext(PageTitleContext);
  if (context === undefined) {
    throw new Error('usePageTitle must be used within a PageTitleProvider');
  }
  return context;
}

// Hook personalizado para establecer el título automáticamente
export function useSetPageTitle(title: string, subtitle?: string) {
  const { setPageTitle } = usePageTitle();
  
  useEffect(() => {
    setPageTitle(title, subtitle);
    
    // Cleanup: restaurar título por defecto cuando el componente se desmonte
    return () => {
      setPageTitle('Dashboard', 'Sistema de gestión SPOON');
    };
  }, [title, subtitle, setPageTitle]);
}
