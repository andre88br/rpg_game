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
5. Pôr a espécie em `MODELOS_GLB` e olhar na luta (`npm run dev`).

O TripoSR só vê a frente: as costas são inventadas e saem mais pobres.
