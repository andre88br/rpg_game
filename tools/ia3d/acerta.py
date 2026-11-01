import sys, numpy as np, trimesh
entrada, saida = sys.argv[1], sys.argv[2]
cena = trimesh.load(entrada)
m = cena.to_geometry() if isinstance(cena, trimesh.Scene) else cena
cores = np.array(m.visual.vertex_colors, dtype=np.float64)[:, :3] / 255.0
# só o pedaço maior (e os que forem quase do tamanho dele): some o caco solto
partes = m.split(only_watertight=False)
maior = max(len(p.faces) for p in partes)
print('pedaços', len(partes), 'faces', [len(p.faces) for p in partes][:8])
# alisa a escada da grade sem encolher (Taubin)
trimesh.smoothing.filter_taubin(m, lamb=0.5, nu=-0.53, iterations=12)
# de pé: o "para cima" do TripoSR é z; a frente vai para +z
R = trimesh.transformations.rotation_matrix(-np.pi / 2, [1, 0, 0]) @ np.eye(4)
m.apply_transform(R)
m.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2, [0, 1, 0]))
# tira o verde que vazou do fundo, e devolve o calor da pele
r, g, b = cores[:, 0], cores[:, 1], cores[:, 2]
g2 = np.minimum(g, np.maximum(r, b) * 0.98)
c = np.stack([r, g2, b], 1)
c = np.clip((c - 0.5) * 1.08 + 0.5 + 0.03, 0, 1)
lum = c.mean(1, keepdims=True)
c = np.clip(lum + (c - lum) * 1.15, 0, 1)
m.visual.vertex_colors = np.concatenate([(c * 255).astype(np.uint8), np.full((len(c), 1), 255, np.uint8)], 1)
# descarta componentes pequenos depois de pintar (as faces mantêm as cores)
comp = trimesh.graph.connected_component_labels(m.face_adjacency, node_count=len(m.faces))
conta = np.bincount(comp)
manter = conta[comp] > maior * 0.2
m.update_faces(manter)
m.remove_unreferenced_vertices()
# pé no chão, no meio
b0, b1 = m.bounds
m.apply_translation([-(b0[0] + b1[0]) / 2, -b0[1], -(b0[2] + b1[2]) / 2])
print('faces', len(m.faces), 'caixa', m.bounds.round(3).tolist())
m.export(saida)
