# Encantados — A Trilha das Oito Medalhas

RPG de captura de criaturas jogável direto no navegador, no PC ou no celular.
Criaturas e cenários inspirados no folclore brasileiro.

**Estado atual: Fase 0 — esboços visuais para aprovação.** Ainda não há código de jogo.

## Ver os esboços

```bash
npx serve mockups
# ou: python3 -m http.server --directory .
```

As imagens já renderizadas também estão em [`mockups/img/`](mockups/img/).

Para regerá-las:

```bash
node tools/render.mjs
```

## O que já existe

Um motor de pixel art completo, sem nenhuma dependência e sem nenhum asset externo —
toda a arte é desenhada por código. É o mesmo pipeline que vira `src/art/` no jogo.

| Arquivo | O que faz |
|---|---|
| `mockups/engine.js` | buffer de pixels, primitivas de desenho, contorno automático, escala |
| `mockups/font.js` | fonte bitmap 5×7 com acentuação portuguesa (Á Ã Ç É Ê Í Ó Õ Ú) |
| `mockups/palette.js` | paleta única do jogo e as cores dos 8 tipos |
| `mockups/tiles.js` | tiles 16×16 gerados com semente fixa, e as construções |
| `mockups/people.js` | molde de personagem 16×20 e o elenco |
| `mockups/creatures.js` | os 3 iniciais e suas evoluções finais |
| `mockups/badges.js` | as 8 medalhas |
| `mockups/ui.js` | caixas, barras de HP/XP, painéis de combate, menus |
| `mockups/scenes.js` | as telas completas do jogo |
| `tools/png.mjs` | codificador PNG mínimo (usa só o zlib do Node) |
| `tools/preview.mjs` | pré-visualização em ASCII no terminal, para desenhar sem chutar |
| `tools/render.mjs` | gera os PNGs em `mockups/img/` |

## O jogo

- **9 cidades.** Vila Aurora (início, sem ginásio) e mais 8, uma por tipo.
- **8 ginásios.** Em cada cidade, uma cadeia de tarefas abre o portão do ginásio;
  derrotar o líder dá a medalha e um **Dom de Campo**, que remove o obstáculo
  da estrada para a cidade seguinte.
- **Torneio Círculo Dourado.** 6 adversários seguidos, sem cura entre as lutas.
- **8 tipos:** Fogo → Planta → Água → Fogo · Terra → Raio → Vento → Terra · Luz ↔ Sombra.

| # | Cidade | Tipo | Líder | Medalha | Dom de Campo |
|---|---|---|---|---|---|
| 1 | Porto Iara | Água | Mariana | Maré | Nadar |
| 2 | Mata do Curupira | Planta | Tiê | Raiz | Cortar Cipó |
| 3 | Serra Boitatá | Fogo | Brás | Brasa | Tocha |
| 4 | Campo do Saci | Vento | Pererê | Rodamoinho | Rajada |
| 5 | Aldeia Tupã | Raio | Guaraci | Trovão | Faísca |
| 6 | Minas da Caipora | Terra | Ubirajara | Pedra | Escavar |
| 7 | Bairro da Cuca | Sombra | Morgana | Breu | Visão Noturna |
| 8 | Cidade do Sol | Luz | Solano | Aurora | Prisma |

## Elenco

Tainá / Bento (protagonista) · Zeca "Redemoinho" (rival) · Dona Firmina (mentora) ·
Companhia Mata-Seca (antagonistas) · Anhangá (campeão do torneio).

Iniciais: **Boitatinha** (Fogo) → Boitatão · **Iarinha** (Água) → Iara-Mãe ·
**Curupinho** (Planta) → Curupirá.

## Próximas fases

1. **Esqueleto** — Vite + TypeScript, laço de jogo, movimento em grade, colisão, câmera, toque e teclado.
2. **Batalha** — turnos, tabela de tipos, dano, estados, captura, evolução, IA.
3. **Fatia vertical** — Vila Aurora + Porto Iara + Ginásio 1 jogáveis de ponta a ponta.
4. **Conteúdo** — as 7 cidades restantes, ~40 Encantados, ~60 golpes.
5. **Torneio** — Círculo Dourado e balanceamento.
6. **Publicação** — build estático no GitHub Pages.
