import { useEffect, useCallback } from 'react';

type ShortcutMap = {
  [key: string]: () => void;
};

export const SALE_SHORTCUTS: ShortcutMap = {
  'f2': () => document.getElementById('search-products')?.focus(),
  'f3': () => document.getElementById('discount-input')?.focus(),
  'f4': () => document.getElementById('payment-amount')?.focus(),
  'ctrl+enter': () => document.getElementById('complete-sale')?.click(),
  'escape': () => document.getElementById('cancel-sale')?.click()
};

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = `${event.ctrlKey ? 'ctrl+' : ''}${event.key.toLowerCase()}`;
    if (shortcuts[key]) {
      event.preventDefault();
      shortcuts[key]();
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}