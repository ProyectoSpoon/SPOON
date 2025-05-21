// Mock Firebase config for development
export const db = {
  collection: () => ({
    doc: () => ({
      get: async () => ({
        exists: false,
        data: () => null
      }),
      set: async () => {},
      update: async () => {}
    }),
    where: () => ({
      get: async () => ({
        empty: true,
        docs: []
      })
    }),
    add: async () => ({
      id: 'mock-id'
    })
  })
};

export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback) => {
    callback(null);
    return () => {};
  },
  signInWithEmailAndPassword: async () => ({
    user: {
      uid: 'mock-user-id',
      email: 'mock@example.com'
    }
  }),
  signOut: async () => {}
};

export const storage = {
  ref: () => ({
    put: async () => ({
      ref: {
        getDownloadURL: async () => 'https://example.com/mock-image.jpg'
      }
    }),
    getDownloadURL: async () => 'https://example.com/mock-image.jpg'
  })
};

export default {
  db,
  auth,
  storage
};
