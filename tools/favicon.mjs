/* Os ícones do jogo, desenhados por código como todo o resto:
   - favicon.png: a medalha Maré, para a aba do navegador;
   - icone-192.png e icone-512.png: a Boitatinha na noite do título, para
     instalar o jogo no celular (manifest.webmanifest). A arte fica dentro
     da zona segura do ícone "maskable" (80% do meio), que o Android pode
     recortar em círculo ou gota.
   Uso: node tools/favicon.mjs */
import { writeFileSync } from 'node:fs';
import { bufToPNG } from './png.mjs';
import { medalha } from '../src/art/badges.ts';
import { boitatinha } from '../src/art/creatures.ts';
import { Buf } from '../src/core/buf.ts';

const publico = (nome) => new URL(`../public/${nome}`, import.meta.url);

writeFileSync(publico('favicon.png'), bufToPNG(medalha('mare', 16), 2));

/* 64×64 de base: ×3 dá 192 e ×8 dá 512, os dois tamanhos que o manifest pede */
function icone() {
  const b = new Buf(64, 64);
  for (let y = 0; y < 64; y++) b.rect(0, y, 64, 1, y < 40 ? '#1b1338' : y < 50 ? '#2a1d4a' : '#101a14');
  for (const [x, y] of [[9, 8], [52, 12], [16, 22], [46, 30], [30, 6], [57, 40], [6, 36]]) b.set(x, y, '#cdbff0');
  const bicho = boitatinha();
  b.blit(bicho, Math.round((64 - bicho.w) / 2), Math.round((64 - bicho.h) / 2) + 2);
  return b;
}
const base = icone();
writeFileSync(publico('icone-192.png'), bufToPNG(base, 3));
writeFileSync(publico('icone-512.png'), bufToPNG(base, 8));
console.log('favicon e ícones gerados');
