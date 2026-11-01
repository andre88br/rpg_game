/* =========================================================================
   O mar: o que é mar aberto, a distância de cada ponto até a costa e o
   ritmo das ondas. A água (vista3d.ts, shader da água) e a areia (o shader
   do chão, `comMare`) usam o MESMO ritmo (`ONDA_GLSL`), então a crista que
   vem do largo quebra na beira exatamente quando a lâmina começa a subir
   na areia.

   Mar aberto é a água ligada à borda do mapa: rio e lagoa no meio da terra
   não fazem onda. Puro, sem DOM: os testes rodam no node.
   ========================================================================= */

/* a água ligada à borda (o que está fora do mapa conta como mar) */
export function marAberto(W: number, H: number, agua: (x: number, y: number) => boolean): Uint8Array {
  const mar = new Uint8Array(W * H);
  const fila: number[] = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if ((x === 0 || y === 0 || x === W - 1 || y === H - 1) && agua(x, y)) { mar[y * W + x] = 1; fila.push(y * W + x); }
    }
  }
  while (fila.length) {
    const i = fila.pop()!;
    const x = i % W, y = Math.floor(i / W);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx;
      if (!mar[j] && agua(nx, ny)) { mar[j] = 1; fila.push(j); }
    }
  }
  return mar;
}

/* quanto cabe na textura: de -1 (terra) a 9 tiles de mar, em passos de 1/25 */
export const COSTA_MAX = 9;

/* A textura da costa, com uma borda de um tile em volta do mapa (fora do
   mapa é mar). Por texel:
   R: a distância do centro do tile até a terra mais perto, em tiles
      (negativa em terra: a distância até a água), guardada como (d + 1) * 25;
   G: 255 se é mar aberto (ou terra colada nele), 0 se é rio ou lagoa;
   B: 255 se é água de qualquer tipo. */
export function texturaDaCosta(W: number, H: number, agua: (x: number, y: number) => boolean,
                               mar: Uint8Array): Uint8Array<ArrayBuffer> {
  const LW = W + 2, LH = H + 2;
  const ehAgua = (x: number, y: number) => x < 0 || y < 0 || x >= W || y >= H || agua(x, y);
  const ehMar = (x: number, y: number) => x < 0 || y < 0 || x >= W || y >= H || mar[y * W + x] === 1;
  const dados = new Uint8Array(new ArrayBuffer(LW * LH * 4));
  const R = COSTA_MAX + 1;
  for (let ty = -1; ty <= H; ty++) {
    for (let tx = -1; tx <= W; tx++) {
      const molhado = ehAgua(tx, ty);
      // a distância do centro do tile ao quadrado do tile do outro tipo mais perto
      let d = R;
      for (let y = ty - R; y <= ty + R; y++) {
        for (let x = tx - R; x <= tx + R; x++) {
          if (ehAgua(x, y) === molhado) continue;
          const ex = Math.max(Math.abs(x - tx) - 0.5, 0), ey = Math.max(Math.abs(y - ty) - 0.5, 0);
          d = Math.min(d, Math.hypot(ex, ey));
        }
      }
      const dist = molhado ? Math.min(d, COSTA_MAX) : -Math.min(d, 1);
      let marPerto = molhado ? ehMar(tx, ty) : false;
      if (!molhado) {
        for (let y = ty - 1; y <= ty + 1; y++) for (let x = tx - 1; x <= tx + 1; x++) if (ehAgua(x, y) && ehMar(x, y)) marPerto = true;
      }
      const i = ((ty + 1) * LW + tx + 1) * 4;
      dados[i] = Math.round((dist + 1) * 25);
      dados[i + 1] = marPerto ? 255 : 0;
      dados[i + 2] = molhado ? 255 : 0;
      dados[i + 3] = 255;
    }
  }
  return dados;
}

/* O ritmo das ondas, em GLSL (precisa de fbm3, de RUIDO_FUNCOES):
   `faseDaOnda(xz, tempo)` vai de 0 a 1 num ciclo de uns nove segundos; o
   ciclo muda devagar ao longo da praia. Em 0 a crista chega na beira e a
   lâmina começa a subir na areia; até 0,28 ela sobe, depois volta. No mar,
   a crista k (k = 0, 1, 2...) está a `ONDA_PASSO * (1 - fase + k)` tiles da
   costa, e é a onda `k + 1` de `forcaDaOnda`. */
export const ONDA_PASSO = 4.0;
export const ONDA_GLSL = `
const float ONDA_PASSO = ${ONDA_PASSO.toFixed(1)};
float lugarDaOnda(vec2 xz) { return fbm3(vec3(xz.x * 0.12, 0.0, xz.y * 0.12)); }
float faseDaOnda(vec2 xz, float tempo) { return fract(tempo * 0.11 + lugarDaOnda(xz) * 0.7); }
// a força de cada onda (umas sobem mais longe que outras); k = 0 é a que
// está na areia agora, k = 1 a crista que vem chegando, e assim por diante
float forcaDaOnda(vec2 xz, float tempo, float k) {
  return 0.55 + 0.45 * fbm3(vec3((floor(tempo * 0.11 + lugarDaOnda(xz) * 0.7) + k) * 3.7, xz.x * 0.15, xz.y * 0.15));
}
`;
