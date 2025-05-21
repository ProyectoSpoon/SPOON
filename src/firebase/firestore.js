// Mock Firebase Firestore module for development

export const collection = () => ({});
export const query = () => ({});
export const where = () => ({});
export const orderBy = () => ({});
export const limit = () => ({});
export const startAfter = () => ({});
export const getDocs = async () => ({
  empty: true,
  docs: [],
  forEach: () => {}
});
export const getDoc = async () => ({
  exists: () => false,
  data: () => null,
  id: 'mock-id'
});
export const setDoc = async () => {};
export const updateDoc = async () => {};
export const deleteDoc = async () => {};
export const addDoc = async () => ({ id: 'mock-id' });
export const doc = () => ({});
export const serverTimestamp = () => new Date();
export const Timestamp = {
  now: () => ({ toDate: () => new Date() }),
  fromDate: (date) => ({ toDate: () => date })
};
export const onSnapshot = () => () => {};
export const writeBatch = () => ({
  set: () => {},
  update: () => {},
  delete: () => {},
  commit: async () => {}
});
export const increment = () => {};
export const arrayUnion = () => {};
export const arrayRemove = () => {};
export const runTransaction = async () => {};
