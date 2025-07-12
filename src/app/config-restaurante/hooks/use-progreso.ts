import { useState, useEffect } from 'react';

export const useProgreso = () => {
  const [progreso, setProgreso] = useState(25);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { progreso, setProgreso };
};
