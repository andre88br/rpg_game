"""Repinta o modelo com as cores da própria imagem (projeção de frente).
Uso: pinta.py modelo_acertado.glb input.png saida.glb
O input.png é o que o TripoSR gravou (o bicho já recortado, sobre cinza)."""
import sys, numpy as np, cv2, trimesh
cena = trimesh.load(sys.argv[1])
m = cena.to_geometry() if isinstance(cena, trimesh.Scene) else cena
im = cv2.imread(sys.argv[2]).astype(np.float32) / 255.0
h, w = im.shape[:2]
# o recorte: o que não é o cinza do fundo
cinza = np.abs(im - 0.5).max(2) < 0.03
obj = ~cinza
obj = cv2.morphologyEx(obj.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0
ys, xs = np.nonzero(obj)
bx0, bx1, by0, by1 = xs.min(), xs.max(), ys.min(), ys.max()
# os traços pretos do desenho saem (viram a cor em volta), menos no rosto
lum = im.mean(2)
traco = ((lum < 0.2) & obj).astype(np.uint8) * 255
rosto_y0, rosto_y1 = by0 + int((by1 - by0) * 0.08), by0 + int((by1 - by0) * 0.27)
rosto_x0, rosto_x1 = bx0 + int((bx1 - bx0) * 0.38), bx0 + int((bx1 - bx0) * 0.62)
traco[rosto_y0:rosto_y1, rosto_x0:rosto_x1] = 0
traco = cv2.dilate(traco, np.ones((3, 3), np.uint8), iterations=1)
limpa = cv2.inpaint((im * 255).astype(np.uint8), traco, 5, cv2.INPAINT_TELEA).astype(np.float32) / 255.0
# o fundo cinza vira a cor de dentro (a borda do bicho não puxa cinza)
fundo = (~obj).astype(np.uint8) * 255
limpa = cv2.inpaint((limpa * 255).astype(np.uint8), fundo, 9, cv2.INPAINT_TELEA).astype(np.float32) / 255.0
cv2.imwrite(sys.argv[3].replace('.glb', '_tinta.png'), (limpa * 255).astype(np.uint8))
# o TripoSR devolve o bicho espelhado em relação à imagem: desespelha
espelho = np.diag([-1.0, 1.0, 1.0, 1.0])
m.apply_transform(espelho)
if np.linalg.det(espelho[:3, :3]) < 0 and m.is_winding_consistent:
    m.invert() if m.volume < 0 else None
v = m.vertices
lo, hi = v.min(0), v.max(0)
u = (v[:, 0] - lo[0]) / (hi[0] - lo[0])
t = (hi[1] - v[:, 1]) / (hi[1] - lo[1])
px = np.clip(bx0 + u * (bx1 - bx0), 0, w - 1)
py = np.clip(by0 + t * (by1 - by0), 0, h - 1)
# quem cai fora do recorte (a borda, o lado) pega a cor do pixel de dentro
# mais perto (de um recorte um pouco encolhido, longe da borda de cinza)
dentro = cv2.erode(obj.astype(np.uint8), np.ones((5, 5), np.uint8), iterations=2)
_, rot = cv2.distanceTransformWithLabels((1 - dentro).astype(np.uint8), cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
zy, zx = np.nonzero(dentro == 1)
onde = np.zeros(rot.max() + 1, np.int64); ondey = onde.copy()
onde[rot[zy, zx]] = zx; ondey[rot[zy, zx]] = zy
ix, iy = np.round(px).astype(int), np.round(py).astype(int)
fora = dentro[iy, ix] == 0
lab = rot[iy[fora], ix[fora]]
px[fora] = onde[lab]; py[fora] = ondey[lab]
cor = cv2.remap(limpa, px.astype(np.float32).reshape(-1, 1), py.astype(np.float32).reshape(-1, 1), cv2.INTER_LINEAR).reshape(-1, 3)
# nas costas, a cor de uma cópia bem borrada: fica a cor (pele, gorro,
# calção) e somem os detalhes da frente (olho, boca, costela)
borrada = cv2.GaussianBlur(limpa, (0, 0), 14)
cor_costas = cv2.remap(borrada, px.astype(np.float32).reshape(-1, 1), py.astype(np.float32).reshape(-1, 1), cv2.INTER_LINEAR).reshape(-1, 3)
nz = m.vertex_normals[:, 2]
# o detalhe só onde a superfície olha bem para a imagem; de lado, a projeção
# de frente escorre (o olho esticado na bochecha) e fica só a cor
peso = np.clip((0.6 - nz) / 0.4, 0, 1)[:, None]           # 0 de frente, 1 de lado e de costas
peso = peso * peso * (3 - 2 * peso)
cor = cor * (1 - peso) + cor_costas * peso
cor = cor[:, ::-1]                           # BGR -> RGB
# o glTF guarda cor de vértice LINEAR: a cor de tela (sRGB) é convertida,
# senão o jogo clareia tudo
cor = np.clip(cor, 0, 1)
cor = np.where(cor <= 0.04045, cor / 12.92, ((cor + 0.055) / 1.055) ** 2.4)
# as costas um tico mais escuras (sem sol direto no desenho de lá)
n = m.vertex_normals
costas = np.clip(-n[:, 2], 0, 1)[:, None]
cor = cor * (1 - 0.12 * costas)
m.visual = trimesh.visual.ColorVisuals(m, vertex_colors=np.concatenate([(np.clip(cor, 0, 1) * 255).astype(np.uint8), np.full((len(cor), 1), 255, np.uint8)], 1))
m.export(sys.argv[3])
print('pintado', len(v), 'vértices; recorte', bx0, by0, bx1, by1)
