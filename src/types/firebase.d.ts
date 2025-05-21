// src/types/firebase.d.ts
declare interface FirebaseResponse {
    user?: any;
    error?: {
      code: string;
      message: string;
    };
  }