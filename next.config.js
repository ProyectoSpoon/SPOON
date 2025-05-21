/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle cloudflare:sockets and pg-cloudflare issues
    config.resolve.alias = {
      ...config.resolve.alias,
      'cloudflare:sockets': path.resolve(__dirname, 'src/utils/cloudflare-mock.js'),
      'pg-cloudflare': path.resolve(__dirname, 'src/utils/pg-cloudflare-mock.js'),
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        module: false,
        http2: false,
        'pg-native': false,
      };
    }

    return config;
  },
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    // Desactivamos las opciones experimentales que pueden causar conflictos
    scrollRestoration: true,
  },
  // Aseguramos compatibilidad con versiones más nuevas de React
  images: {
    unoptimized: true,
  }
};

module.exports = nextConfig;
