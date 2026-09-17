# Encantados — A Trilha das Oito Medalhas

RPG de captura de criaturas jogável direto no navegador, no PC ou no celular.
Criaturas e cenários inspirados no folclore brasileiro.

**Estado: Fase 3, Etapa 1 — a região se abre.** A Fase 1 do jogo é a **Região da
Foz**: acorda-se em casa na Vila Aurora, desce-se a Rota da Foz e chega-se a
Porto Iara, entrando e saindo das casas, da loja, do benzimento e do terreiro.
A batalha da Fase 2 continua inteira: turnos, tabela de tipos, estados
alterados, itens, captura com patuá, troca, XP, nível e evolução.

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
| `npm test` | testes de dano, tipos, captura, progressão, motor de turnos e coerência dos mapas |
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
├─ world/     tilemap.ts · mundo.ts (os mapas e o cache) · camera.ts · actor.ts
│             mapas.test.ts (coerência: saídas, alcance, encontros)
├─ game/      state.ts (time, mochila, medalhas, flags — o que atravessa cenas)
├─ scenes/    title.ts · overworld.ts · battle.ts
├─ data/      creatures.ts · moves.ts · items.ts
│             mapas/ (a Região da Foz: 3 externos + 5 interiores)
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

**A cena de batalha desenha de uma fotografia, não do motor.** `executar()`
resolve o turno inteiro de uma vez: quando ele devolve, a vida já caiu e o bicho
já desmaiou. Se a cena lesse o motor direto, a barra esvaziaria no instante do
comando, antes de a frase do golpe aparecer. Por isso cada lado tem uma ficha de
exibição (`Visual`) que só avança quando o evento correspondente sai da fila.

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
- **Estados.** A etiqueta de três letras ocupa o lugar do rótulo VIDA no painel:

  | | Estado | O que faz |
  |---|---|---|
  | **BRA** | em brasa | perde 1/16 da vida por turno **e** bate com metade da força física; Encantado de Fogo é imune |
  | **PEÇ** | com peçonha | perde 1/16 da vida por turno |
  | **TRA** | travado | velocidade pela metade e 25% de chance de perder o turno; Encantado de Raio é imune |
  | **SON** | no sono | não age por 1 a 3 turnos, e **dobra a chance de captura** |
  | **QUE** | quebranto | passageiro (2 a 4 turnos): 50% de chance de se acertar sozinho; é o único que não ocupa a vaga dos outros |
- **Captura.** Chance cresce com o dano levado, com o estado alterado e com a
  qualidade do patuá. Os quatro balanços da animação são a mesma chance dividida
  em quatro sorteios: se balançar as quatro vezes, pegou.
- **IA.** Pontua cada golpe pelo dano real que ele faria e escolhe entre os
  melhores com um pingo de acaso — treinador é mais certeiro que bicho selvagem,
  e derrubar o oponente naquele turno vale mais que qualquer outra coisa.

## O mundo

Cada mapa é uma grade ASCII editável à mão em `src/data/mapas/`:

```
 .  grama        ,  mato alto (encontros)   =  caminho de terra
 a  areia        ~  água (intransponível)   p  cais de madeira
 #  árvore       o  pedra                   f  flores
 _  piso         W  parede interna          T  tapete
 m  tatame       u  poça d'água
```

As portas ficam sempre no meio de um **tile inteiro**, e é nele que mora a
`DefSaida` que leva ao interior. O `Mundo` (`src/world/mundo.ts`) guarda cada
mapa já desenhado: atravessar uma porta troca o cenário e os NPCs, mas não
remonta nada nem mexe no jogador.

Erro de grade não aparece no `tsc` — uma linha com um caractere a mais, uma casa
plantada em cima da única moita, uma porta que abre para dentro de uma parede:
tudo isso compila. Por isso `src/world/mapas.test.ts` lê os mapas de verdade e
anda por eles em busca larga: confere o comprimento de cada linha, que toda
saída caia em chão livre (e não em cima de outra saída, o que faria laço de
porta), que todo NPC e todo início estejam em tile andável, que toda espécie de
encontro exista, e que todo mato alto e toda saída tenham caminho a pé a partir
do início.

## O jogo

- **9 cidades.** Vila Aurora (início, sem terreiro) e mais 8, uma por tipo.
- **8 terreiros.** Cada terreiro é fechado por uma **guia de cinco contas**: cinco
  desafios espalhados pela região, um de cada sabor — um recado para entregar, um
  rival que barra a estrada, uma caçada no mato alto, um sumiço para resolver e um
  chefe. Cinco contas acesas abrem a guia; derrotar o líder dá a medalha e um
  **Dom de Campo**, que remove o obstáculo da estrada para a região seguinte.
- **Uma região por vez.** Cada região sai completa e jogável antes de a seguinte
  começar. A primeira é a **Região da Foz**: Vila Aurora → Rota da Foz → Porto Iara.
- **Torneio Círculo Dourado.** 6 adversários seguidos, sem cura entre as lutas.
- **8 tipos:** Fogo → Planta → Água → Fogo · Terra → Raio → Vento → Terra · Luz ↔ Sombra.

| # | Cidade | Tipo | Quem manda no terreiro | Medalha | Dom de Campo |
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
- [ ] **3 — Região da Foz.** A Fase 1 do jogo, inteira.
  - [x] **Etapa 1 — o mundo se abre.** Oito mapas encadeados (Vila Aurora, Rota da
        Foz, Porto Iara e cinco interiores), passagens, portas alinhadas ao tile,
        abrigo onde se acorda depois de apagar, e os testes de coerência de mapa.
  - [ ] **Etapa 2 — o jogo lembra de você.** Falas condicionais, as cinco contas
        ligadas às flags, treinadores com visão, menu de pausa, loja, benzimento e save.
  - [ ] **Etapa 3 — a fase fecha.** Escolha do inicial, os cinco desafios completos,
        o puzzle de poças, Mariana, a Medalha Maré e o Dom "Nadar".
- [ ] **4 — Conteúdo.** As 7 regiões restantes, uma completa de cada vez.
- [ ] **5 — Torneio.** Círculo Dourado e balanceamento.
- [x] **6 — Publicação.** Build estático no GitHub Pages, publicado a cada push.

### Pontas soltas conhecidas

- O time inicial da Fase 2 é provisório (Iarinha e Boitatinha no nível 5): a
  escolha do inicial com a Dona Firmina entra na Etapa 3.
- As cinco contas da guia já aparecem apagadas no portão do terreiro, mas ainda
  não acendem: os cinco desafios ganham lógica nas Etapas 2 e 3.
- As poças do salão do terreiro ainda são só piso molhado. Escorregar até a
  parede exige um modo "deslizando" no `Ator`, que entra na Etapa 3.
- Os Encantados evoluídos são desenhados em 40×40 e, ampliados em dobro, passam
  por baixo do painel do oponente. Ganham arte de batalha própria na Fase 4.
- As formas intermediárias (Boitatá, Iaraí, Curupira) ainda não existem: por
  enquanto cada inicial evolui direto para a forma final, no nível 18.
