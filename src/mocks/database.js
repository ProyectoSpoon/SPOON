'use client';

// Mock implementation for database.ts
const pool = {
  connect: async () => ({
    query: async () => ({ rows: [], rowCount: 0 }),
    release: () => {}
  }),
  query: async () => ({ rows: [], rowCount: 0 }),
  end: async () => {},
  on: () => {}
};

// Mock query function
export const query = async (text, params) => {
  console.log('Mock database query:', text, params);
  return { rows: [], rowCount: 0 };
};

// Export the mock pool
export default pool;
