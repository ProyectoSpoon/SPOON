/**
 * Mock implementation for pg-cloudflare
 * This file provides empty implementations of the pg-cloudflare functions
 * to prevent build errors when the application is running in a non-Cloudflare environment.
 */

// Create a mock implementation that returns the standard pg module
// or a mock if that's not available
const mockPgCloudflare = {
  // Main export is a function that returns a mock client
  default: function() {
    return {
      connect: () => Promise.resolve(),
      query: () => Promise.resolve({ rows: [] }),
      end: () => Promise.resolve(),
    };
  },
  // Mock the Socket class
  Socket: function() {
    return {
      connect: () => Promise.resolve(this),
      on: () => this,
      once: () => this,
      end: () => {},
      destroy: () => {},
      write: () => true,
    };
  },
};

module.exports = mockPgCloudflare;
