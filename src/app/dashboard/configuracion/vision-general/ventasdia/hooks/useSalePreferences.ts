import { useState, useEffect } from 'react';
;
import { db } from '@/firebase/config';

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
    const doc = await getDoc(doc(db, 'userPreferences', userId));
    setPreferences(doc.exists() ? doc.data() as SalePreference : {
      favoriteAddons: [],
      quickKeys: {},
      defaultQuantity: 1,
      showPrices: true,
      compactMode: false,
      lastUsedAddons: []
    });
    setLoading(false);
  };

  const updatePreferences = async (updates: Partial<SalePreference>) => {
    const newPrefs = { ...preferences, ...updates };
    await setDoc(doc(db, 'userPreferences', userId), newPrefs);
    setPreferences(newPrefs);
  };

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  return { preferences, loading, updatePreferences };
}