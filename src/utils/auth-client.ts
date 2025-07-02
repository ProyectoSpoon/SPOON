// src/utils/auth-client.ts
'use client';

// Mock User interface for build
interface User {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    // Mock implementation for build - always return null
    console.log('Mock getCurrentUser called');
    resolve(null);
  });
};

export const setAuthCookies = (token: string, userInfo: any) => {
  // Mock implementation for build
  console.log('Mock setAuthCookies called:', { token, userInfo });
  if (typeof document !== 'undefined') {
    document.cookie = `Firebase-Auth-Token=${token}; path=/`;
    document.cookie = `userInfo=${JSON.stringify(userInfo)}; path=/`;
  }
};
