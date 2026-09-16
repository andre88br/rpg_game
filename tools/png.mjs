/* Codificador PNG minimo (RGBA, sem dependencias). Usa o zlib do proprio Node. */
import { deflateSync } from 'node:zlib';

function crc32(buf) {
  let c, table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

/* rgba: Uint8Array de w*h*4 */
export function encodePNG(w, h, rgba) {
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;                       // filtro None
    Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4)
      .copy(raw, y * (w * 4 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* converte um Buf do motor em PNG, ampliado n vezes */
export function bufToPNG(buf, scale = 1, bg = null) {
  const w = buf.w * scale, h = buf.h * scale;
  const rgba = new Uint8Array(w * h * 4);
  const parse = (hex) => {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  };
  const bgc = bg ? parse(bg) : null;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = buf.get((x / scale) | 0, (y / scale) | 0);
      const i = (y * w + x) * 4;
      if (c == null) {
        if (bgc) { rgba[i] = bgc[0]; rgba[i + 1] = bgc[1]; rgba[i + 2] = bgc[2]; rgba[i + 3] = 255; }
        continue;
      }
      const [r, g, b] = parse(c);
      rgba[i] = r; rgba[i + 1] = g; rgba[i + 2] = b; rgba[i + 3] = 255;
    }
  }
  return encodePNG(w, h, rgba);
}
