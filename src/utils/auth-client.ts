// src/utils/auth-client.ts
'use client';

;
import { auth } from '@/firebase/config';

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

export const setAuthCookies = (token: string, userInfo: any) => {
  document.cookie = `Firebase-Auth-Token=${token}; path=/`;
  document.cookie = `userInfo=${JSON.stringify(userInfo)}; path=/`;
};