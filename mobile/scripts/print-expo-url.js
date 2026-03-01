#!/usr/bin/env node
/**
 * Yerel ağ IP'sini bulup Expo bağlantı URL'sini ekrana yazar.
 * QR kod görünmeyen ortamlarda Expo Go'da "URL ile bağlan" için kullanılır.
 */
const { networkInterfaces } = require('os');

function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

const port = process.env.EXPO_PORT || 8081;
const ip = getLocalIP();
const lanUrl = `exp://${ip}:${port}`;

console.log('\n');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  EXPO GO — URL İLE BAĞLAN                                    ║');
console.log('║                                                              ║');
console.log('║  Expo Go uygulamasında "URL ile bağlan" / "Enter URL" açın   ║');
console.log('║  ve aşağıdaki adresi yapıştırın:                             ║');
console.log('║                                                              ║');
console.log('║  ' + lanUrl.padEnd(56) + '  ║');
console.log('║                                                              ║');
console.log('║  (Aynı Wi-Fi ağında olmanız gerekir.)                        ║');
console.log('║  Tunnel kullandıysanız bağlantı linki birkaç saniye içinde    ║');
console.log('║  terminalde görünecektir.                                    ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('\n');
