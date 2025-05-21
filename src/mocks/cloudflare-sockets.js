// Mock implementation for cloudflare:sockets
module.exports = {
  connect: () => Promise.resolve({}),
  createServer: () => ({}),
  createConnection: () => ({}),
  createSecureContext: () => ({}),
  getDefaultCerts: () => ({}),
  getGlobalDispatcher: () => ({}),
  setGlobalDispatcher: () => ({}),
  default: {}
};
