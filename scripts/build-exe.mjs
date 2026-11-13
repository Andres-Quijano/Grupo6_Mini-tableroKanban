/**
 * build-exe.mjs — genera el ejecutable dist/MiniTableroKanban(.exe).
 *
 * Usa "Single Executable Applications" de Node.js:
 *   1. Empaqueta scripts/launcher.cjs y todos los archivos de src/ en un "blob".
 *   2. Copia el ejecutable de Node que está corriendo este script.
 *   3. Inyecta el blob en esa copia con postject.
 *
 * El resultado funciona sin tener Node.js instalado, en el mismo sistema
 * operativo donde se compiló (un .exe hecho en Windows es para Windows).
 *
 * Uso: npm run build:exe
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import postject from 'postject';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(ROOT, 'src');
const DIST = join(ROOT, 'dist');
const NAME = 'MiniTableroKanban' + (process.platform === 'win32' ? '.exe' : '');
const EXE = join(DIST, NAME);
const BLOB = join(DIST, 'sea-prep.blob');
const CONFIG = join(DIST, 'sea-config.json');
// Marca que Node busca para saber que el ejecutable trae una aplicación inyectada.
const SENTINEL_FUSE = 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2';

/** Lista todos los archivos de una carpeta: { 'domain/Board.js': 'C:\\...\\src\\domain\\Board.js' }. */
function collectAssets(dir, assets = {}) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collectAssets(full, assets);
    else assets[relative(SRC, full).split(sep).join('/')] = full;
  }
  return assets;
}

function step(message) {
  console.log(`> ${message}`);
}

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

step('Empaquetando la aplicación');
const assets = collectAssets(SRC);
writeFileSync(
  CONFIG,
  JSON.stringify(
    {
      main: join(ROOT, 'scripts', 'launcher.cjs'),
      output: BLOB,
      disableExperimentalSEAWarning: true,
      useCodeCache: false,
      useSnapshot: false,
      assets,
    },
    null,
    2,
  ),
);
execFileSync(process.execPath, ['--experimental-sea-config', CONFIG], { stdio: 'inherit' });
console.log(`  ${Object.keys(assets).length} archivos de src/ incluidos`);

step(`Copiando Node.js ${process.version}`);
copyFileSync(process.execPath, EXE);

step('Inyectando la aplicación en el ejecutable');
await postject.inject(EXE, 'NODE_SEA_BLOB', readFileSync(BLOB), {
  sentinelFuse: SENTINEL_FUSE,
  machoSegmentName: process.platform === 'darwin' ? 'NODE_SEA' : undefined,
  overwrite: true,
});

rmSync(BLOB);
rmSync(CONFIG);

const sizeMb = (statSync(EXE).size / 1024 / 1024).toFixed(1);
console.log(`\nListo: dist/${NAME} (${sizeMb} MB)`);
