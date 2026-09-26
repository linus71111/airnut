// Macht aus dem Web-Export eine installierbare Web-App ("Zum Home-Bildschirm" auf dem iPhone).
// Aufruf: node scripts/pwa.mjs <dist-Ordner> <baseUrl, z.B. /airnut>
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [dist = 'dist', basis = ''] = process.argv.slice(2);
const b = basis.replace(/\/$/, '');
const datei = join(dist, 'index.html');

const kopf = `
    <meta name="theme-color" content="#E2001A" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Fallbeispiel" />
    <link rel="apple-touch-icon" href="${b}/apple-touch-icon.png" />
    <link rel="manifest" href="${b}/manifest.json" />
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('${b}/sw.js', { scope: '${b}/' }).catch(function () {});
        });
      }
    </script>
  </head>`;

let html = readFileSync(datei, 'utf8');
if (!html.includes('rel="manifest"')) html = html.replace('</head>', kopf);
// viewport-fit=cover, damit die App auf dem iPhone bis in die Ecken reicht
html = html.replace(/<meta name="viewport" content="[^"]*"/, '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"');
html = html.replace('<html lang="en">', '<html lang="de">');
writeFileSync(datei, html);
// GitHub Pages liefert bei unbekannten Pfaden 404.html – so funktionieren auch Links auf Unterseiten
copyFileSync(datei, join(dist, '404.html'));
console.log('Web-App vorbereitet:', datei);
