import dns from 'dns';

// Forzar IPv4 globalmente
dns.setDefaultResultOrder('ipv4first');

// Configurar lookup personalizado para forzar IPv4
export const dnsLookup = (hostname: string, options: any, callback: any) => {
    // Si solo se pasan 2 argumentos, el segundo es el callback
    const cb = typeof options === 'function' ? options : callback;
    const opts = typeof options === 'function' ? {} : options;

    // Forzar IPv4 (familia 4)
    dns.lookup(hostname, { ...opts, family: 4 }, cb);
};

console.log('🌐 DNS configurado para IPv4');