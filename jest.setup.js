// jest.setup.js
// This file is run before each test file

// Mock localStorage
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true
  });
}

// Mock console methods to avoid cluttering test output
global.console = {
  ...global.console,
  // Keep native behavior for other methods
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Add any other global setup here
