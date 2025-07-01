import { useState, useEffect } from 'react';

interface SalePreference {
  favoriteAddons: string[];
  quickKeys: { [key: string]: string };
  defaultQuantity: number;
  showPrices: boolean;
  compactMode: boolean;
  lastUsedAddons: string[];
}

export function useSalePreferences(userId: string) {
  const [preferences, setPreferences] = useState<SalePreference>();
  const [loading, setLoading] = useState(true);

  const loadPreferences = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/preferences`);
      
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      } else {
        // Set default preferences if none exist
        setPreferences({
          favoriteAddons: [],
          quickKeys: {},
          defaultQuantity: 1,
          showPrices: true,
          compactMode: false,
          lastUsedAddons: []
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setPreferences({
        favoriteAddons: [],
        quickKeys: {},
        defaultQuantity: 1,
        showPrices: true,
        compactMode: false,
        lastUsedAddons: []
      });
    }
    setLoading(false);
  };

  const updatePreferences = async (updates: Partial<SalePreference>) => {
    try {
      const newPrefs = { ...preferences, ...updates };
      
      const response = await fetch(`/api/users/${userId}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPrefs),
      });

      if (response.ok) {
        setPreferences(newPrefs as any);
      } else {
        throw new Error('Error updating preferences');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  return { preferences, loading, updatePreferences };
}
