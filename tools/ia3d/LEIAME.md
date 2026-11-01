# Encantado de IA: da imagem ao `.glb`

O modelo 3D de um Encantado pode vir de uma imagem, pelo TripoSR (código
aberto, roda no processador). O jogo carrega `public/modelos/<nome>.glb` das
espécies listadas em `MODELOS_GLB` (`src/render3d/modelos/glb.ts`); quem não
tem arquivo continua com o esculpido.

1. Ambiente (fora do repositório):
   `python3 -m venv venv`, `venv/bin/pip install torch --index-url https://download.pytorch.org/whl/cpu`,
   e `omegaconf einops transformers==4.35.0 trimesh "rembg[cpu]" huggingface-hub xatlas scikit-image onnxruntime opencv-python-headless`.
   Clone `https://github.com/VAST-AI-Research/TripoSR` e troque, em
   `tsr/models/isosurface.py`, o `torchmcubes` pelo `marching_cubes` do
   scikit-image (devolvendo os vértices na ordem 2, 1, 0).
2. Imagem limpa: o bicho inteiro, sem texto por cima. Se tiver texto,
   `venv/bin/python -I prepara.py entrada.jpg limpa.png x0 y0 x1 y1` apaga as
   letras claras da caixa dada.
3. Gerar: `venv/bin/python run.py limpa.png --device cpu --mc-resolution 256 --model-save-format glb --output-dir saida`
   (uns 2 minutos; o fundo sai sozinho).
4. Acertar: `venv/bin/python -I acerta.py saida/0/mesh.glb public/modelos/<nome>.glb`
   — de pé (o "para cima" do TripoSR é z), virado para +z, pé no chão, sem
   caco solto, sem a escada da grade e sem o verde do fundo nas cores.
5. Repintar com a própria imagem (melhor que a cor que o TripoSR inventa):
   `venv/bin/python -I pinta.py public/modelos/<nome>.glb saida/0/input.png public/modelos/<nome>.glb`
   — desespelha o modelo (o TripoSR devolve o bicho espelhado), projeta a
   imagem de frente (sem os traços pretos do desenho, menos no rosto), as
   costas pegam a cor borrada (sem olho e boca atrás da cabeça), e a cor vai
   linear, como o glTF pede (senão o jogo clareia tudo).
6. Pôr a espécie em `MODELOS_GLB` e olhar na luta (`npm run dev`).
7. Para mexer braço, cabeça e perna: um esqueleto em
   `src/render3d/modelos/esqueleto.ts` (as juntas e a regra de que osso é
   cada vértice, pela posição), registrado em `ESQUELETOS` com o nome do
   arquivo. As medidas saem de fatias do modelo acertado (onde o braço
   descola do corpo, onde fica o pescoço, onde o calção acaba).

A imagem boa é de frente, corpo inteiro, fundo liso e sem texto. O TripoSR
só vê a frente: as costas são inventadas e saem mais simples.
