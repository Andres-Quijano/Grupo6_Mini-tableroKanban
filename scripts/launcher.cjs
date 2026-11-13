/**
 * launcher.cjs — punto de entrada del ejecutable (MiniTableroKanban.exe).
 *
 * Levanta un servidor local con la aplicación y abre el navegador.
 *  - Dentro del .exe, los archivos de src/ vienen empaquetados como "assets"
 *    del ejecutable (Node.js Single Executable Applications).
 *  - Fuera del .exe (node scripts/launcher.cjs) se leen directamente de src/,
 *    lo que permite probar el lanzador sin compilar.
 *
 * Se escribe en CommonJS porque es el formato que exige el ejecutable de Node.
 *
 * Opciones: --no-open   no abre el navegador (útil para pruebas).
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

let sea = null;
try {
  sea = require('node:sea');
} catch {
  // Versiones de Node sin soporte de ejecutables: se usa el disco.
}
const IN_EXECUTABLE = Boolean(sea && sea.isSea());
const SRC_DIR = path.join(__dirname, '..', 'src');
const FIRST_PORT = 3000;
const LAST_PORT = 3010;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

/** Devuelve el contenido de un archivo de la app, o null si no existe. */
function readAppFile(relativePath) {
  if (IN_EXECUTABLE) {
    try {
      return Buffer.from(sea.getAsset(relativePath));
    } catch {
      return null;
    }
  }
  try {
    return fs.readFileSync(path.join(SRC_DIR, relativePath));
  } catch {
    return null;
  }
}

/** Convierte la URL pedida en una ruta relativa segura dentro de src/. */
function toAppPath(url) {
  const pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname);
  const clean = path.posix.normalize(pathname).replace(/^\/+/, '');
  if (clean.split('/').includes('..')) return null; // impide salir de src/
  return clean === '' ? 'index.html' : clean;
}

function handleRequest(req, res) {
  let appPath;
  try {
    appPath = toAppPath(req.url);
  } catch {
    appPath = null; // URL mal formada
  }
  if (!appPath) {
    res.writeHead(400).end('Solicitud inválida');
    return;
  }

  const body = readAppFile(appPath);
  if (!body) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No encontrado');
    return;
  }
  res.writeHead(200, {
    'Content-Type': TYPES[path.extname(appPath)] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

/** Escucha en el primer puerto libre entre FIRST_PORT y LAST_PORT. */
function listen(server, port = FIRST_PORT) {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off('listening', onListening);
      if (error.code === 'EADDRINUSE' && port < LAST_PORT) {
        resolve(listen(server, port + 1));
      } else {
        reject(error);
      }
    };
    const onListening = () => {
      server.off('error', onError);
      resolve(port);
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, '127.0.0.1');
  });
}

function openBrowser(url) {
  const [command, args] =
    process.platform === 'win32'
      ? ['cmd', ['/c', 'start', '""', url]]
      : process.platform === 'darwin'
        ? ['open', [url]]
        : ['xdg-open', [url]];
  const child = spawn(command, args, { detached: true, stdio: 'ignore', windowsHide: true });
  child.on('error', () => console.log(`  No se pudo abrir el navegador. Abra manualmente: ${url}`));
  child.unref();
}

async function main() {
  if (!readAppFile('index.html')) {
    console.error('No se encontraron los archivos de la aplicación (index.html).');
    process.exit(1);
  }

  const server = http.createServer(handleRequest);
  const port = await listen(server);
  const url = `http://localhost:${port}`;

  console.log('');
  console.log('  Mini-tablero Kanban — Grupo 6');
  console.log('  ----------------------------------------');
  console.log(`  Tablero disponible en: ${url}`);
  console.log('  Cierre esta ventana (o presione Ctrl+C) para detenerlo.');
  console.log('');

  if (!process.argv.includes('--no-open')) openBrowser(url);
}

main().catch((error) => {
  console.error('No se pudo iniciar el tablero:', error.message);
  process.exit(1);
});
