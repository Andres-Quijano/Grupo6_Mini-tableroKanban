/**
 * vendor-assets.mjs — copia fuentes e íconos a src/assets/ para que la app
 * funcione sin internet (también dentro del ejecutable).
 *
 *  - Fuentes Archivo y JetBrains Mono (licencia OFL) desde @fontsource-variable.
 *  - Íconos Phosphor (licencia MIT): solo los que usa la interfaz (ICONS),
 *    para no cargar los ~1.500 de la librería.
 *
 * Uso: npm run vendor   (después de agregar un ícono a ICONS)
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MODULES = join(ROOT, 'node_modules');
const ASSETS = join(ROOT, 'src', 'assets');

const ICONS = [
  'arrow-left', 'arrow-right', 'arrow-up-right', 'pencil-simple', 'x', 'plus', 'check', 'info', 'warning',
  'prohibit', 'user', 'github-logo', 'gauge', 'list-checks', 'seal-check', 'arrows-left-right',
  'strategy', 'broadcast', 'cursor-click', 'shield-check', 'swap', 'arrows-clockwise',
];

const FONTS = [
  ['@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2', 'archivo-latin.woff2'],
  ['@fontsource-variable/archivo/files/archivo-latin-ext-wdth-normal.woff2', 'archivo-latin-ext.woff2'],
  ['@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2', 'jetbrains-mono-latin.woff2'],
  ['@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-ext-wght-normal.woff2', 'jetbrains-mono-latin-ext.woff2'],
];

mkdirSync(join(ASSETS, 'fonts'), { recursive: true });
mkdirSync(join(ASSETS, 'icons'), { recursive: true });

for (const [from, to] of FONTS) copyFileSync(join(MODULES, from), join(ASSETS, 'fonts', to));

const phosphor = join(MODULES, '@phosphor-icons', 'web', 'src', 'regular');
copyFileSync(join(phosphor, 'Phosphor.woff2'), join(ASSETS, 'icons', 'phosphor.woff2'));

const css = readFileSync(join(phosphor, 'style.css'), 'utf8');
const rules = ICONS.map((name) => {
  const match = css.match(new RegExp(`\\.ph\\.ph-${name}:before \\{\\s*content: "(\\\\[0-9a-f]+)";`));
  if (!match) throw new Error(`Ícono no encontrado en Phosphor: ${name}`);
  return `.ph-${name}::before { content: "${match[1]}"; }`;
});

writeFileSync(
  join(ASSETS, 'icons', 'icons.css'),
  `/* Subconjunto de Phosphor Icons (MIT, phosphoricons.com). Generado por scripts/vendor-assets.mjs. */
@font-face {
  font-family: "Phosphor";
  src: url("./phosphor.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

.ph {
  font-family: "Phosphor" !important;
  font-style: normal;
  font-weight: normal;
  line-height: 1;
  speak: never;
  text-transform: none;
  -webkit-font-smoothing: antialiased;
}

${rules.join('\n')}
`,
);

console.log(`Fuentes: ${FONTS.length} archivos. Íconos: ${ICONS.length}.`);
