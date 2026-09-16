# Encantados — A Trilha das Oito Medalhas

RPG de captura de criaturas jogável direto no navegador, no PC ou no celular.
Criaturas e cenários inspirados no folclore brasileiro.

**Estado: Fase 2 — batalha.** Dá para andar por Porto Iara, conversar com os
moradores, cair em encontros no mato alto e lutar de verdade: turnos, tabela de
tipos, estados alterados, itens, captura com patuá, troca de Encantado, XP,
subida de nível e evolução.

Jogue agora, inclusive no celular: **https://andre88br.github.io/rpg_game/**

## Rodar

```bash
npm install
npm run dev          # http://localhost:5173  (e pela rede local, para testar no celular)
```

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | checa os tipos e gera `dist/` |
| `npm run checar` | só a checagem de tipos |
| `npm test` | testes de dano, tipos, captura, progressão e motor de turnos |
| `npm run arte` | regenera as imagens dos esboços em `esbocos/img/` |

Páginas: `/` é o jogo, `/esbocos.html` é a galeria de esboços de tela.

## Controles

| | Teclado | Toque |
|---|---|---|
| andar | setas ou WASD | direcional na tela |
| falar / confirmar | Z, Enter ou espaço | botão A |
| correr / voltar | X ou Shift | botão B |
| menu | Esc | botão MENU |

## Como está construído

Sem engine e sem nenhum asset externo: **toda a arte é desenhada por código**,
o que mantém o pacote pequeno (≈31 KB comprimidos) e elimina qualquer questão
de licenciamento. A mesma fonte em TypeScript serve o navegador (via Vite) e a
ferramenta de linha de comando que gera os PNGs.

```
src/
├─ core/      buf.ts (pixels, primitivas, contorno, "assar" p/ canvas)
│             renderer.ts · input.ts · loop.ts · scene.ts
├─ art/       palette · font (5×7 com acentuação) · tiles · people
│             creatures · badges · ui · battlebg
├─ battle/    engine.ts (máquina de turnos) · typechart · damage · status
│             capture · encantado.ts (nível, XP, evolução) + *.test.ts
├─ world/     tilemap.ts · camera.ts · actor.ts
├─ game/      state.ts (time, mochila, medalhas, flags — o que atravessa cenas)
├─ scenes/    title.ts · overworld.ts · battle.ts
├─ data/      creatures.ts · moves.ts · items.ts · mapas/portoIara.ts
└─ esbocos/   telas.ts (as telas de apresentação) + main.ts
tools/        png.mjs (codificador PNG) · render.mjs · preview.mjs · favicon.mjs
```

Três decisões que sustentam o desempenho e a nitidez:

- **Sprites assados uma vez.** Desenhar pixel a pixel a cada quadro seria lento;
  cada `Buf` vira um canvas na carga e o laço só faz `drawImage`. O texto usa um
  atlas de glifos por cor, gerado sob demanda.
- **Mapa pré-renderizado.** O cenário inteiro é desenhado num único canvas na
  carga; a cada quadro recortamos só a janela da câmera. Um `drawImage` no lugar
  de centenas. Roda a 60 quadros por segundo.
- **Ampliação em pixels do dispositivo.** O canvas tem 240×160 de verdade e o CSS
  amplia por fator inteiro em pixels *físicos*, então cada pixel do jogo ocupa
  sempre a mesma área. Em telas de densidade alta, quando o fator inteiro
  desperdiçaria mais de 10% da largura, preenchemos a tela — com 3 pixels
  físicos por pixel do jogo a diferença não é perceptível, e o jogo deixa de
  ficar minúsculo no celular.

**O motor de batalha não desenha nada.** `Batalha.executar(acao)` resolve o turno
inteiro e devolve uma *fila de eventos* (`texto`, `dano`, `status`, `desmaio`,
`xp`, `evoluir`…). A cena consome essa fila no ritmo das animações. É essa
separação que permite rodar uma batalha inteira num teste de texto — `npm test`
joga dezenas delas, com semente fixa, sem abrir navegador nenhum.

## Como funciona a batalha

- **Tipos.** Dois triângulos e um par, e nada mais: `Fogo → Planta → Água → Fogo`,
  `Terra → Raio → Vento → Terra`, `Luz ↔ Sombra`. Quem ataca com vantagem causa
  2x; o resto é neutro. Golpe do próprio tipo rende +50% (afinidade).
- **Dano.** Fórmula do gênero, com nível, ataque/defesa (física ou especial),
  crítico de 6% e variação de 85% a 100% — duas trocas iguais nunca dão o mesmo
  número, mas a diferença nunca vira sorte pura.
- **Estados.** Queimado e envenenado tiram 1/16 por turno (queimadura ainda corta
  o ataque pela metade), paralisado corta a velocidade e às vezes trava o turno,
  dormindo perde de 1 a 3 turnos, enfeitiçado faz o bicho se acertar sozinho.
  Não se queima um Encantado de Fogo nem se eletrocuta um de Raio.
- **Captura.** Chance cresce com o dano levado, com o estado alterado e com a
  qualidade do patuá. Os quatro balanços da animação são a mesma chance dividida
  em quatro sorteios: se balançar as quatro vezes, pegou.
- **IA.** Pontua cada golpe pelo dano real que ele faria e escolhe entre os
  melhores com um pingo de acaso — treinador é mais certeiro que bicho selvagem,
  e derrubar o oponente naquele turno vale mais que qualquer outra coisa.

O mapa é uma grade ASCII editável à mão em `src/data/mapas/`:

```
 .  grama        ,  mato alto (encontros)   =  caminho de terra
 a  areia        ~  água (intransponível)   p  cais de madeira
 #  árvore       o  pedra                   f  flores
```

## O jogo

- **9 cidades.** Vila Aurora (início, sem ginásio) e mais 8, uma por tipo.
- **8 ginásios.** Em cada cidade, uma cadeia de tarefas abre o portão do ginásio;
  derrotar o líder dá a medalha e um **Dom de Campo**, que remove o obstáculo da
  estrada para a cidade seguinte.
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

Elenco: Tainá / Bento (protagonista) · Zeca "Redemoinho" (rival) · Dona Firmina
(mentora) · Companhia Mata-Seca (antagonistas) · Anhangá (campeão).
Iniciais: **Boitatinha** (Fogo) → Boitatão · **Iarinha** (Água) → Iara-Mãe ·
**Curupinho** (Planta) → Curupirá.

## Fases

- [x] **0 — Esboços.** Direção visual aprovada. Imagens em [`esbocos/img/`](esbocos/img/).
- [x] **1 — Esqueleto.** Laço de jogo, movimento em grade, colisão, câmera,
      teclado e toque, mapa de Porto Iara, NPCs e diálogo.
- [x] **2 — Batalha.** Turnos, tabela de tipos, dano, PP, estados, itens, captura,
      troca, XP, subida de nível, evolução e IA — com 88 testes automatizados.
- [ ] **3 — Fatia vertical.** A tarefa das redes abre o ginásio; Mariana, a Medalha
      Maré e o Dom "Nadar" liberam a estrada seguinte. Save, menus, loja, cura.
- [ ] **4 — Conteúdo.** As 7 cidades restantes, ~40 Encantados, ~60 golpes.
- [ ] **5 — Torneio.** Círculo Dourado e balanceamento.
- [x] **6 — Publicação.** Build estático no GitHub Pages, publicado a cada push.

### Pontas soltas conhecidas

- O time inicial da Fase 2 é provisório (Iarinha e Boitatinha no nível 5): a
  escolha do inicial com a Dona Firmina entra na Fase 3.
- Os Encantados evoluídos são desenhados em 40×40 e, ampliados em dobro, passam
  por baixo do painel do oponente. Ganham arte de batalha própria na Fase 4.
- As formas intermediárias (Boitatá, Iaraí, Curupira) ainda não existem: por
  enquanto cada inicial evolui direto para a forma final, no nível 18.
