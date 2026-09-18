# Encantados — A Trilha das Oito Medalhas

RPG de captura de criaturas jogável direto no navegador, no PC ou no celular.
Criaturas e cenários inspirados no folclore brasileiro.

**Estado: a Fase 1 do jogo está fechada.** A **Região da Foz** dá para jogar do
começo ao fim: escolhe-se o Encantado inicial na mesa da Dona Firmina, acendem-se
as cinco contas da guia — o recado, o Zeca na estrada, o caderno do Contador, as
três redes e o bicho do farol —, atravessa-se o salão alagado do terreiro e
ganha-se a **Medalha Maré** com o Dom de **Nadar**, que abre a água. A batalha
continua inteira: turnos, tabela de tipos, estados alterados, itens, captura com
patuá, troca, XP, nível e evolução.

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
o que mantém o pacote pequeno (≈35 KB comprimidos) e elimina qualquer questão
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
│             quests.ts (falas condicionais e as cinco contas) · save.ts
│             + *.test.ts (os dois são puros: rodam sem navegador)
├─ ui/        listas.ts (time e mochila, iguais na batalha e no menu)
├─ scenes/    title.ts · overworld.ts · battle.ts
│             menu.ts · loja.ts · escolha.ts (os três patuás da mesa)
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
- **Ampliação em pixels do dispositivo.** O jogo desenha em 240×160 e o CSS
  amplia por fator inteiro em pixels *físicos*, então cada pixel do jogo ocupa
  sempre a mesma área. Em telas de densidade alta, quando o fator inteiro
  desperdiçaria mais de 10% da largura, preenchemos a tela — com 3 pixels
  físicos por pixel do jogo a diferença não é perceptível, e o jogo deixa de
  ficar minúsculo no celular.

## Assar suave: o mundo sem escadinha

O canvas guarda o **dobro** dos pixels de 240×160, e uma transformação de escala
converte um pelo outro — todo o desenho continua sendo escrito em coordenadas de
240×160, e nenhuma das 148 chamadas de desenho das telas precisou mudar. Os
pixels a mais existem para caber `assarSuave()`, que roda duas vezes sobre a arte
que já existe, sem redesenhar nada:

1. **EPX/Scale2x.** Cada pixel vira quatro, e os quatro cantos são decididos pela
   vizinhança: onde duas cores se encontram em diagonal, o canto recebe a cor que
   continua a diagonal em vez de repetir o centro. É o que arredonda a copa da
   árvore, o telhado e o contorno dos bichos.
2. **Anti-serrilhado só nas bordas.** Pixel cercado de iguais fica intacto; só
   quem está num limite de cor se mistura com os quatro vizinhos, em alfa
   pré-multiplicado — sem isso a borda de um sprite se mistura com o preto
   invisível de fora e ganha uma auréola escura. Área chapada continua chapada, e
   o resultado não vira o borrão típico de filtro de emulador.

**Textura não é contorno**, e essa distinção teve de ser ensinada ao filtro.
Grama, areia e terra batida são feitas de chuvisco: pontinhos de um tom vizinho
espalhados pelo tile. O filtro engordava cada pontinho e o gramado da Vila Aurora
virou um mofo esverdeado. Agora só conta como borda o encontro de duas cores
**distantes** — a copa da árvore contra a grama, o contorno de um bicho, a parede
contra o chão. Tom vizinho de tom vizinho é textura, e textura passa intacta.

E o tamanho de um sprite deixou de ser o `width` dele: a imagem assada suave tem
o dobro de pixels do que ocupa na tela, então quem se posiciona pelo próprio
tamanho — centralizar, encostar os pés no tile — pergunta a `larguraDe()` e
`alturaDe()`. Medir pelo `width` cru jogava o personagem meio sprite para o lado
e um corpo inteiro para cima: ele aparecia em cima do telhado, fora do vão da
porta.

**Texto e menus ficam de fora**, assados em 1× por `assar()`: caem em pixels
inteiros do canvas e continuam nítidos. Fonte de 5×7 suavizada seria ilegível
neste tamanho. Numa tela de Porto Iara isso dá 852 tons distintos onde a paleta
do jogo tem umas 60 — os outros 800 são degraus de borda.

O custo é de carga, não de quadro: o mapa é assado uma vez por mapa (e reassado
quando uma flag muda o cenário, como já era), com quatro vezes mais pixels para
preencher. O laço de jogo continua fazendo um `drawImage` por quadro.

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
 a  areia        ~  água (só com "Nadar")   p  cais de madeira
 #  árvore       o  pedra                   f  flores
 _  piso         W  parede interna          T  tapete
 m  tatame       u  água parada (escorrega)
```

As portas ficam sempre no meio de um **tile inteiro**, e é nele que mora a
`DefSaida` que leva ao interior. O `Mundo` (`src/world/mundo.ts`) guarda cada
mapa já desenhado: atravessar uma porta troca o cenário e os NPCs, mas não
remonta nada nem mexe no jogador.

Um objeto pode ser **condicional** (`se` / `seNao`, no vocabulário de
`src/game/quests.ts`): a tranca que o Zeca atravessa na estrada some no instante
em que ele perde. Como isso muda o desenho E a colisão, o `Mundo` guarda junto de
cada mapa a **impressão** das condições que o desenharam, e só o reaproveita
enquanto essa impressão continuar a mesma — é assim que a guia acende conta por
conta sem remontar a região inteira a cada passo.

Erro de grade não aparece no `tsc` — uma linha com um caractere a mais, uma casa
plantada em cima da única moita, uma porta que abre para dentro de uma parede:
tudo isso compila. Por isso `src/world/mapas.test.ts` lê os mapas de verdade e
anda por eles em busca larga: confere o comprimento de cada linha, que toda
saída caia em chão livre (e não em cima de outra saída, o que faria laço de
porta), que todo NPC e todo início estejam em tile andável, que toda espécie de
encontro exista, e que todo mato alto e toda saída tenham caminho a pé a partir
do início. Desde a Etapa 2 ele também anda pela região **fechada** e pela região
**aberta**, para provar que a tranca do Zeca barra de verdade antes e libera
depois, e que a guia só deixa entrar no terreiro com as cinco contas acesas.

## Escorregar, nadar, fugir

Três coisas que o chão e a gente fazem, e que a Fase 1 precisava:

- **A água parada leva.** Pisar num tile `u` repete o passo na mesma direção até
  a parede — e o salão do terreiro é feito disso. O detalhe que não é óbvio: uma
  poça encostada numa parede tem que voltar a ser chão comum, senão quem
  escorrega até o canto fica preso lá para sempre, sem nem batalha para perder.
- **A água funda deixa de ser parede** quando a Medalha Maré entrega o Dom de
  Nadar. Isso muda a colisão do mapa inteiro, não de um objeto, então entra na
  impressão que o `Mundo` guarda e o cenário é remontado na hora.
- **E quem nada, afunda até o pescoço.** `Mapa` guarda um `aguas` à parte de
  `solidos` — água continua sendo água pro desenho mesmo depois de o Dom
  tirá-la da colisão. Em cima dela, `desenhar()` corta o sprite do ator em
  `ALTURA_NADANDO` (`scenes/overworld.ts`) com `recorte()`: só a cabeça e um
  fiapo de ombro aparecem, o resto do corpo nem se desenha — quem faz parecer
  água ali é o próprio tile já pintado por baixo, sem gastar um pixel a mais.
  Duas ondinhas (`art/tiles.ts:ondaNado`) alternam ao lado da cabeça, do
  mesmo jeito que a folha baixa (`rocada`) já marca o mato alto.
- **A conversa passa por cima do balcão.** Balcão de loja e mesa de cozinha são
  parede para o corpo e não para a voz: quem está do outro lado escuta. Sem
  isso, um NPC posto atrás do próprio balcão vira enfeite — a Dona Firmina
  ficou uma versão inteira cercada por duas estantes e a própria mesa, com a
  fileira dela sem nenhuma entrada. "Tile andável" não quer dizer alcançável, e
  agora `mapas.test.ts` procura, para cada NPC, um lugar de onde o botão A
  chegue nele **com caminho a pé** desde a porta.
- **Quem foge, foge.** Um NPC com `fujao` pula para longe de quem chega perto,
  enquanto tiver fôlego e para onde ir. Os três Sacizinhos que levaram as redes
  do Mestre do Porto só sentam para conversar depois de encurralados — e sair do
  mapa devolve o fôlego deles, para a caçada nunca ficar impossível nem eterna.

**O salão da Dona Mariana não foi desenhado no olho.** Um salão de gelo erra
fácil de dois jeitos: ou vira corredor, ou vira armadilha — você chega num canto
de onde não dá mais para voltar e a partida trava. A planta saiu de uma busca
larga entre as combinações de duas colunas, exigindo caminho até a saída **e**
volta até a porta a partir de todo lugar alcançável. `mapas.test.ts` refaz as
duas contas a cada execução.

## O que o mundo lembra

Um NPC não tem "a" fala: tem uma lista, e a primeira cujas condições batem é a
que ele diz.

```ts
falas: [
  { se: 'conta_recado', linhas: ['O Mestre do Porto mandou agradecer.'] },
  { seNao: 'falou_firmina', liga: ['falou_firmina', 'tem_recado'],
    da: { item: 'carta' }, linhas: ['Leve esta carta ao Mestre do Porto.'] },
  { linhas: ['Volte aqui que eu escrevo outra.'] },
]
```

O vocabulário de condições cabe numa tela: uma flag (`falou_firmina`), a flag
negada (`!falou_firmina`), `item:carta`, `item:patua>=3`, `vistos>=4`,
`capturados>=2`, `contas>=5`, `medalha:mare`, `dinheiro>=200`. Uma fala pode
`liga`r flags, `da`r e `pede`r itens, `paga`r, `cura`r o time, abrir a `loja` ou
virar `batalha`. O texto aceita recheio: `{nome}`, `{contas}`, `{faltam}`,
`{servico}`, `{vistos}`, e dois que concordam em gênero com o protagonista
escolhido — `{crianca}` ("menino" ou "menina") e `{caida}` ("caído" ou
"caída"), resolvidos por `pronomeDe(estado)` em `game/state.ts`. Quem
escreve uma fala nova para "a menina"/"moça" escreve `{crianca}` no lugar,
e ela lê certo para os dois.

Isso mora todo em `src/game/quests.ts`, que é puro — nada de canvas, nada de
DOM. Por isso ele tem teste de verdade, e por isso o conteúdo da região continua
sendo **dado**, não código de cena.

A partida se grava em `localStorage`, sozinha: ao curar no benzimento, ao
trocar de mapa, ao acender uma conta e ao vencer um treinador. O save
atravessa publicações do jogo, então `restaurar()` não confia nele — espécie
que sumiu, golpe renomeado, mapa que não existe mais e vida acima do máximo
são corrigidos em silêncio, porque perder a partida inteira por causa de um
campo torto seria pior do que voltar com um item a menos.

## Seis slots, uma introdução, e a velocidade do jogo

`src/game/save.ts` guarda até **seis partidas independentes**
(`encantados:save:v1:0` a `:5`), cada uma na sua própria chave — sobrescrever
uma nunca risca as outras. Todo ponto de gravação automática espalhado pelo
jogo continua chamando só `salvar(estado)`, sem saber de slot nenhum: por
baixo, isso cai sempre no **slot ativo** da sessão (`obterSlotAtivo()`), que só
muda quando o jogador escolhe outro de propósito — ao CONTINUAR, ou gravando
num slot diferente pela tela SALVAR.

Essa tela — `scenes/slots.ts:TelaSlots` — é uma sobreposição só, usada em três
lugares: CONTINUAR e NOVO JOGO no título, SALVAR no menu de pausa. Ela lista
os seis slots como uma coisa só (nome, nível, quando foi gravado), mas o
comportamento muda com o `modo`: CONTINUAR só aceita slot ocupado; NOVO JOGO e
SALVAR aceitam qualquer um, e um slot ocupado pede confirmação antes. Isso mora
dentro do próprio componente, então as três telas que o usam ganham a
confirmação de graça, sem reescrever nada. Quem jogava antes dos seis slots
tinha um save só, numa chave sem número; `migrarSaveAntigo()` o move para o
slot 1 na primeira vez que o jogo carrega, e nunca mais toca naquela chave.

Um jogo NOVO — nunca um CONTINUAR — passa primeiro por `scenes/intro.ts`:
quatro páginas de texto sobre um céu escuro, lidas como qualquer conversa (A
revela e avança, B pula a introdução inteira). Depois vem `scenes/
personagem.ts:CenaPersonagem` — Tainá ou Bento, e o nome, digitado num
teclado alfabético na tela (setas andam pela grade, A escolhe a letra, B
volta da tela de nome pra de personagem). Só depois disso `novoJogo(nome,
personagem)` roda e o mundo existe de verdade.

E `src/game/config.ts` guarda a **velocidade do jogo** — NORMAL, RÁPIDA ou
TURBO — à parte de qualquer slot, porque é preferência do dispositivo, não da
partida: trocar de save não deveria trocar a velocidade do texto. O
multiplicador entra em dois lugares só: quanto texto revela por segundo
(diálogo e batalha) e a duração do passo do `Ator` — ambos dividem o valor de
sempre pelo multiplicador, então nenhum outro código precisa saber que a
velocidade existe. A opção mora no menu de pausa, junto de TIME e MOCHILA.

Três coisas pequenas que valem a pena entender juntas, porque moram todas em
`game/state.ts` e `scenes/menu.ts`:

- **Os patuás na mesa.** A escolha do inicial não é só a sobreposição de
  `EscolhaInicial`: os três patuás também estão desenhados NO MUNDO, pousados na
  mesa da Dona Firmina (`tiles.ts:patuasNaMesa`, um objeto comum de mapa com
  `seNao: 'escolheu_inicial'`). Somem da mesa no instante em que a flag liga,
  porque o mapa já reage a flag — é o mesmo mecanismo da guia, não um novo.
- **Item de cura fora de batalha.** `usavelForaDeBatalha()` separa o que só faz
  sentido numa luta (patuá) do que não precisa de adversário nenhum (garrafada,
  erva-doce, água benta); `usarItemForaDeBatalha()` espelha exatamente a conta
  que `battle/engine.ts` já fazia dentro da luta, só que target por índice do
  time, sem Batalha nenhuma por perto. A MOCHILA do menu de pausa abre a lista
  do time quando o item pedir alvo.
- **Reordenar o time.** Na página TIME do menu, A pega um Encantado e A de novo
  (numa linha diferente) troca os dois de lugar — `trocarPosicoes()`. Sempre que
  alguém entra no time por captura (e já havia mais de um), `CenaMundo` abre o
  menu direto nessa página, com o recém-chegado selecionado: é o convite para
  decidir se ele lidera o time ou não.
- **A caixa da benzedeira, um baú de verdade.** Quem é capturado com o time
  cheio vai para `estado.caixa` — e até aqui isso não tinha tela nenhuma, só
  existia no save. Agora tem um baú desenhado no mundo, dentro da Casa de
  Benzimento (`tiles.ts:bau`, um objeto comum de mapa com `falas: [{ caixa:
  true, ... }]`), que abre `scenes/caixa.ts`: time e caixa como uma lista só,
  um cursor que anda pelas duas partes — A num Encantado do time manda ele pra
  caixa (não deixa esvaziar o time todo), A num da caixa chama ele pro time
  (não deixa passar de seis). Fica na benzedeira, não na loja nem no menu de
  pausa, porque é ela quem guarda os bichos que não couberam.

E uma quarta, que é cena de verdade, não regra de dado: **o corte para a guia.**
Toda vez que uma das cinco contas acende — numa conversa ou numa vitória — a
câmera corta para onde a guia do terreiro está (`CenaMundo` procura o objeto
`portao` em qualquer mapa do registro), mostra o colar já com a conta nova
acesa, e avisa quantas faltam. É uma `Cutscene` local à cena do mundo — mapa e
câmera próprios, para não perturbar o mapa e a câmera do jogador — que só começa
quando não há conversa, batalha, loja ou menu tomando a tela; se acender no meio
de uma dessas coisas, ela fica **guardada** em `cutscenePendente` até a vez certa.

## Golpes que voam

Cada golpe usado em batalha lança um efeito pequeno do atacante até o alvo —
`art/effects.ts:golpeEfeito(tipo, quadro)` desenha uma FORMA por tipo de golpe
(chama para fogo, gota para água, folha para planta, pedra para terra, rajada
para vento, zigue para raio, orbe para sombra, estrela para luz, e um impacto
neutro para golpe comum), sempre na MESMA cor que `TIPOS[]` já usa em qualquer
outro lugar — etiqueta, medalha — então a cor chega familiar. `scenes/battle.ts`
guarda só um `projetil` por vez (`{ tipo, origem, t, dur }`), nascido no mesmo
evento `'golpe'` que já fazia o atacante avançar, e o desenha interpolando entre
o ponto de quem ataca e o de quem apanha (`pontoCombatente()`, o meio do corpo
de cada lado); os quadros da forma são baked uma vez e ficam em cache por
`tipo:quadro`, então o custo por quadro continua sendo só um `drawImage`.

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
- [x] **3 — Região da Foz.** A Fase 1 do jogo, inteira.
  - [x] **Etapa 1 — o mundo se abre.** Oito mapas encadeados (Vila Aurora, Rota da
        Foz, Porto Iara e cinco interiores), passagens, portas alinhadas ao tile,
        abrigo onde se acorda depois de apagar, e os testes de coerência de mapa.
  - [x] **Etapa 2 — o jogo lembra de você.** Falas condicionais com efeitos, as
        cinco contas ligadas às flags, objetos que somem, treinadores com visão,
        menu de pausa (time, mochila, medalhas, guia, salvar, sair), loja,
        benzimento e `encantados:save:v1` com autosave e CONTINUAR no título.
  - [x] **Etapa 3 — a fase fecha.** Escolha do inicial na mesa da Dona Firmina,
        os cinco desafios completos, o salão alagado que escorrega, o farol e o
        bicho que mora nele, Dona Mariana, a Medalha Maré e o Dom "Nadar".
- [ ] **4 — Conteúdo.** As 7 regiões restantes, uma completa de cada vez.
- [ ] **5 — Torneio.** Círculo Dourado e balanceamento.
- [x] **6 — Publicação.** Build estático no GitHub Pages, publicado a cada push.

### Pontas soltas conhecidas

- Quem nada continua andando em pé na água: não existe sprite de nado. O Dom
  funciona, mas a pose é a mesma da terra firme.
- O `premio` do treinador é pago pela cena do mundo, não pelo motor de batalha:
  é lá que mora o bolso do jogador.
- Um toque curto numa direção só VIRA o personagem, como no gênero. No salão
  alagado, em que cada passo muda de direção, isso custa um toque a mais.
- Os Encantados evoluídos são desenhados em 40×40 e, ampliados em dobro, passam
  por baixo do painel do oponente. Ganham arte de batalha própria na Fase 4.
- As formas intermediárias (Boitatá, Iaraí, Curupira) ainda não existem: por
  enquanto cada inicial evolui direto para a forma final, no nível 18.
