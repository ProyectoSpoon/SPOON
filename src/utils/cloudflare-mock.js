/**
 * Mock implementation for cloudflare:sockets
 * This file provides empty implementations of the Cloudflare socket functions
 * to prevent build errors when the application is running in a non-Cloudflare environment.
 */

// Create empty mock functions for all the socket operations
const mockSocket = {
  connect: () => Promise.resolve({}),
  createServer: () => ({}),
  createConnection: () => ({}),
  createSecureConnection: () => ({}),
  Socket: function() {
    return {
      connect: () => this,
      on: () => this,
      once: () => this,
      end: () => {},
      destroy: () => {},
      write: () => true,
    };
  },
  Server: function() {
    return {
      listen: () => this,
      on: () => this,
      close: () => {},
    };
  },
};

module.exports = mockSocket;
