#!/usr/bin/env node
/**
 * Expo'yu tunnel modunda başlatır ve tunnel URL'sini bulup ekrana kutu + QR kod yazar.
 * Aynı ağda değilseniz bu URL'yi Expo Go'da "URL ile bağlan"a yapıştırın veya QR'ı tarayın.
 */
const { spawn } = require('child_process');
const path = require('path');

let qrcodeTerminal;
try {
  qrcodeTerminal = require('qrcode-terminal');
} catch (_) {
  qrcodeTerminal = null;
}

const mobileRoot = path.join(__dirname, '..');
const EXPO_DEBUG = '1';
// URL satırın ortasında da geçebilir; exp://...exp.direct veya https://...exp.direct ara
const tunnelUrlPattern = /(exp:\/\/[^\s]+\.exp\.direct)|(https:\/\/[^\s]+\.exp\.direct)/i;

function extractTunnelUrl(text) {
  const m = text.match(tunnelUrlPattern);
  if (!m) return null;
  let url = (m[1] || m[2] || '').trim();
  if (url.startsWith('https://')) {
    url = 'exp://' + url.replace(/^https:\/\//, '');
  }
  return url || null;
}

function printTunnelBox(url) {
  const u = url.trim();
  const maxLen = 56;
  const padded = u.length <= maxLen ? u.padEnd(maxLen) : u.slice(0, maxLen);
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  EXPO GO — TÜNEL BAĞLANTISI (aynı ağ gerekmez)               ║');
  console.log('║                                                              ║');
  console.log('║  Expo Go uygulamasında "URL ile bağlan" açıp aşağıdaki       ║');
  console.log('║  adresi yapıştırın veya QR kodu tarayın:                    ║');
  console.log('║                                                              ║');
  console.log('║  ' + padded + '  ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('\n');
  if (qrcodeTerminal) {
    console.log('  QR kod (Expo Go ile tara):\n');
    qrcodeTerminal.generate(u, { small: true });
    console.log('\n');
  }
}

let tunnelPrinted = false;
let tunnelUrl = null;

const child = spawn(
  'npx',
  ['expo', 'start', '--tunnel'],
  {
    cwd: mobileRoot,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env, CI: 'false', EXPO_DEBUG },
  }
);

function processLine(data, isStderr) {
  const text = data.toString();
  if (!tunnelPrinted) {
    const url = extractTunnelUrl(text);
    if (url) {
      tunnelPrinted = true;
      tunnelUrl = url;
      printTunnelBox(url);
      // Kaydırıldığında da görünsün diye 5 saniye sonra tekrar yazdır
      setTimeout(() => {
        if (tunnelUrl) {
          console.log('\n  ► Tünel adresi (Expo Go → URL ile bağlan): ' + tunnelUrl + '\n');
        }
      }, 5000);
    }
  }
  const out = isStderr ? process.stderr : process.stdout;
  out.write(text);
}

child.stdout.on('data', (d) => processLine(d, false));
child.stderr.on('data', (d) => processLine(d, true));
child.on('error', (err) => {
  console.error('Başlatma hatası:', err.message);
  process.exit(1);
});
child.on('exit', (code) => process.exit(code != null ? code : 0));
