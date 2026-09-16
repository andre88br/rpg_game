/* Mostra um Buf no terminal como mapa ASCII + legenda de cores.
   Uso: node tools/preview.mjs <modulo> <export> [args-json] */
const CHARS = '#@%&*+=-:oOxXwWmMnNhHsSdDbBqQpPzZ0123456789';

export function dump(buf) {
  const map = new Map(); let out = '';
  for (let y = 0; y < buf.h; y++) {
    let row = '';
    for (let x = 0; x < buf.w; x++) {
      const c = buf.get(x, y);
      if (c == null) { row += '.'; continue; }
      if (!map.has(c)) map.set(c, CHARS[map.size % CHARS.length]);
      row += map.get(c);
    }
    out += String(y).padStart(2, ' ') + ' ' + row + '\n';
  }
  out += '\nlegenda: ' + [...map].map(([c, ch]) => ch + '=' + c).join('  ') + '\n';
  out += `tamanho: ${buf.w}x${buf.h}, ${map.size} cores\n`;
  return out;
}

import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const [, , mod, exp, argsJson] = process.argv;
if (mod) {
  const m = await import(pathToFileURL(resolve(process.cwd(), mod)).href);
  const fn = m[exp];
  const buf = typeof fn === 'function' ? fn(...(argsJson ? JSON.parse(argsJson) : [])) : fn;
  process.stdout.write(dump(buf));
}
