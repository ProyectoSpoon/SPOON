// Mock implementation for pg module
const Client = function() {
  return {
    connect: async () => {},
    query: async () => ({ rows: [], rowCount: 0 }),
    end: async () => {},
    on: () => {}
  };
};

const Pool = function() {
  return {
    connect: async () => ({
      query: async () => ({ rows: [], rowCount: 0 }),
      release: () => {}
    }),
    query: async () => ({ rows: [], rowCount: 0 }),
    end: async () => {},
    on: () => {}
  };
};

module.exports = {
  Client,
  Pool,
  defaults: {
    ssl: false,
    parseInt8: true
  }
};
