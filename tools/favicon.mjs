import { writeFileSync } from 'node:fs';
import { bufToPNG } from './png.mjs';
import { medalha } from '../src/art/badges.ts';
writeFileSync(new URL('../public/favicon.png', import.meta.url), bufToPNG(medalha('mare', 16), 2));
console.log('favicon gerado');
