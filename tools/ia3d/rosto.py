"""Traz para a frente o rosto afundado que o TripoSR às vezes devolve (sem
queixo nem nariz, atrás da aba do gorro). Puxa em z os vértices da frente da
cabeça, mais no meio do rosto e nada nas bordas, até o perfil pedido.

uso: python -I rosto.py entrada.glb saida.glb [meio]
Roda entre o acerta.py e o pinta.py (o pinta.py olha para onde a superfície
aponta). As medidas são do Saci (altura 0,95; o meio do rosto em x = 0,01
antes do pinta.py desespelhar); para outro bicho, mude PERFIL e o meio com
as fatias do modelo acertado.
"""
import sys
import numpy as np
import trimesh

ALTURA = 0.95
MEIO = 0.01
LARGO = 0.095         # meia largura do rosto
# (y, quanto puxar para a frente) — o queixo, a boca, o nariz, os olhos
PERFIL = [(0.69, 0.0), (0.72, 0.008), (0.745, 0.018), (0.77, 0.026), (0.795, 0.02), (0.825, 0.0)]


def main(entrada: str, saida: str, meio: float = MEIO) -> None:
    cena = trimesh.load(entrada)
    for geo in cena.geometry.values():
        v = geo.vertices
        alto = v[:, 1].max() - v[:, 1].min()
        s = ALTURA / alto            # para as medidas do jogo
        y = (v[:, 1] - v[:, 1].min()) * s
        x = v[:, 0] * s
        z = v[:, 2] * s
        ys, ds = zip(*PERFIL)
        puxa = np.interp(y, ys, ds, left=0, right=0)
        # o meio do rosto puxa inteiro; as bordas, nada, numa curva macia
        lado = np.cos(np.clip((x - meio) / LARGO, -1, 1) * np.pi / 2) ** 2
        # da orelha para a frente, crescendo devagar (sem degrau no rosto)
        f = np.clip((z + 0.07) / 0.07, 0, 1)
        frente = f * f * (3 - 2 * f)
        z2 = z + puxa * lado * frente
        v[:, 2] = z2 / s
        geo.vertices = v
    cena.export(saida)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], *(float(a) for a in sys.argv[3:4]))
