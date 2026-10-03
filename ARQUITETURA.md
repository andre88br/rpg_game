# Encantados — arquitetura

Como o jogo é feito por dentro. A apresentação do jogo, os controles e como
rodar estão no [`README.md`](README.md); o passo a passo de cada região, no
[`MANUAL.md`](MANUAL.md).

## Como está construído

Sem engine e sem nenhum asset externo: **toda a arte é desenhada por código**,
o que mantém o pacote pequeno e elimina qualquer questão de licenciamento. A
única biblioteca é o **three.js**, e só para a vista 3D: ela vem num arquivo à
parte, baixado na primeira vez que alguém entra na Foz com o 3D ligado. A mesma fonte em TypeScript serve o navegador (via Vite) e a
ferramenta de linha de comando que gera os PNGs.

```
src/
├─ core/      buf.ts (pixels, primitivas, contorno, "assar" p/ canvas)
│             renderer.ts · input.ts · loop.ts · scene.ts
├─ art/       palette · font (5×7 com acentuação) · tiles · people · mundo
│             predios (casa e terreiro com a cara de cada região)
│             creatures · badges · ui · battlebg
│             ceu (a cor da hora e a chuva, o vento, a neblina e o clarão)
│             raro (a cor rara: giro de matiz por espécie, e um banho de
│             cor nos bichos quase cinzas)
│             cenas (fundos e peças das cutscenes da Foz e da Mata, e o
│             que todo fundo usa: degradê, morro, árvore, moldura de lembrança)
│             fundos/ (os fundos de cada região da Serra em diante, um
│             arquivo por região, e o Círculo Dourado) · pecas (as peças
│             paradas: rede, carta, pote de carvão, sino, pena, balão...)
├─ battle/    engine.ts (máquina de turnos) · typechart · damage · status
│             capture · encantado.ts (nível, XP, evolução) + *.test.ts
│             tracos.test.ts (um caso por gancho de traço)
│             ia.test.ts (o que o treinador escolhe e quando troca)
├─ world/     tilemap.ts · mundo.ts (os mapas e o cache) · camera.ts · actor.ts
│             pedras.ts (empurrar, e o BFS que prova que a sala tem solução)
│             mapas.test.ts (coerência geral: saídas, alcance, encontros,
│             falas) + mapas.<região>.test.ts (os quebra-cabeças de cada
│             região) + mapas.apoio.ts (o mundo aberto/fechado e os jeitos
│             de andar por ele — a pé, deslizando, pelos trilhos)
├─ game/      state.ts (time, mochila, medalhas, flags — o que atravessa cenas)
│             tesouro.ts (a forquilha: quente/frio) · escolta.ts (quem te segue)
│             ronda.ts (o que um vigia enxerga) · sequencia.ts (ladrilhos)
│             feixe.ts (o raio que dobra nos espelhos) · corrida.ts (o relógio)
│             quests.ts (falas condicionais e as cinco contas) · save.ts
│             luz.ts (o raio que se enxerga no breu)
│             avisos.ts (o que placa, tranca e guia dizem ao A)
│             codigos.ts (os códigos secretos e o pacote de cada pulo)
│             transferencia.ts (o save como arquivo .json ou código para colar)
│             golpes.ts (o que o Rezador faz lembrar, a cantiga, ensinar)
│             raro.ts (a chance da cor rara e o Amuleto do Brilho)
│             escala.ts (a revanche que cresce: nível e forma no nível)
│             romaria.ts (o romeiro sorteado, o tamanho do time, as fichas)
│             desafio.ts (Modo Desafio: soltar quem desmaia, o primeiro
│             bicho de cada lugar) + posjogo.test.ts
│             viagem.ts (a Canoa: abrigo de cada cidade, destinos pelas
│             flags `visitou_`, a chegada e quando não dá para remar)
│             tempo.ts (período do dia, clima por região, o mato do
│             momento — `tabelaDoMomento` — e o clima na força do golpe)
│             + *.test.ts (puros)
├─ render3d/  relevo.ts (o que cada uma das 27 letras do chão vira, o modelo
│             de cada tipo de objeto, a luz de cada região e hora) + teste
│             vista3d.ts (o mundo low-poly em three.js, num canvas próprio)
│             carregar.ts (baixa a vista só quando precisa; sem WebGL, fica no
│             plano; `fimDoQuadro3D` esconde o canvas quando ninguém o usou)
├─ audio/     partitura.ts (a notação e o compilador: melodia + acordes →
│             notas; baixo, bateria e arpejo saem dos acordes) + teste
│             musicas.ts (os temas das cutscenes, do mundo, da batalha e as vinhetas)
│             temas.ts (qual tema toca em cada mapa e em cada batalha) + teste
│             motor.ts (o sintetizador WebAudio: pulso, triângulo, ruído)
│             som.ts (o que as cenas chamam: música, vinheta, efeito)
├─ ui/        listas.ts (time e mochila, iguais na batalha e no menu)
│             mapas.ts (o Mapa do Mundo e a planta de cada lugar)
│             arquivos.ts (baixar, copiar, escolher arquivo, colar: o DOM)
│             esquecer.ts ("esquecer qual golpe?", do Rezador e da cantiga)
├─ scenes/    title.ts · overworld.ts (a cena do mundo: coordena) · battle.ts
│             mundo/ (os pedaços da cena do mundo: dialogo.ts, a caixa de
│             conversa e a charada · corteGuia.ts, o corte de câmera para a
│             guia · pintor.ts, o desenho do mundo plano e do breu)
│             menu.ts · loja.ts · escolha.ts (os três patuás da mesa)
│             rezador.ts (o Rezador do benzimento: lembrar golpe a dinheiro)
│             creditos.ts (o fim do Círculo Dourado)
│             cutscene.ts (toca um roteiro: tomadas, câmera, atores, legenda)
├─ data/      creatures.ts · moves.ts · items.ts · mundo.ts (regiões e mapa do mundo)
│             tracos.ts (os 24 traços e o de cada espécie) + teste
│             cutscenes.ts (os roteiros das cutscenes) + teste de coerência
│             roteiros/ (da Serra em diante, um arquivo de roteiros por
│             região, e o torneio; comum.ts guarda o arco das oito medalhas)
│             mapas/ (Região da Foz: 3 externos + 5 interiores; Mata do
│             Curupira: 2 externos + 2 interiores; Serra Boitatá: 4 externos
│             + 3 interiores + o terreiro em 4 salas; Campo do Saci: 4
│             externos + 3 interiores + o terreiro em 1 sala; Aldeia Tupã:
│             4 externos largos + 3 interiores + o terreiro em 1 sala;
│             Minas da Caipora: 4 externos largos + 3 interiores + o
│             terreiro em 1 sala; Bairro da Cuca: 3 externos largos + o
│             Casarão + 3 interiores + o terreiro em 1 sala; Cidade do Sol:
│             4 externos largos + 3 interiores + o terreiro em 1 sala)
└─ esbocos/   telas.ts (as telas de apresentação) + main.ts
public/       favicon e ícones (gerados por tools/favicon.mjs) · manifest.webmanifest
tools/        png.mjs (codificador PNG) · render.mjs · preview.mjs
              favicon.mjs (favicon e os ícones do app instalado)
              sw.modelo.js (o service worker; o build preenche a lista de arquivos)
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

## O mundo em 3D

A vista 3D não muda a lógica: a cena do mundo anda em grade como sempre e só
troca o desenho. Ela renderiza num **canvas próprio** (`#mundo3d`), atrás do
canvas do jogo, na **resolução real da tela** (densidade até 2) e com
antisserrilhado. O canvas do jogo ficou transparente: a cena do mundo limpa o
quadro onde o mundo aparece, e diálogo, menu e clima continuam em 2D por cima.
O laço chama `fimDoQuadro3D()` depois de desenhar; se o mundo 3D não foi
desenhado naquele quadro (batalha, título, mapa plano), o canvas some.

- **Chão low-poly.** Cada tile vira quatro triângulos em leque: o centro na
  altura do tile (é onde se pisa), os cantos na média dos vizinhos — o
  barranco vira rampa chanfrada, e ao ar livre a cor do canto mistura as
  cores em volta (dentro de casa, não: tapete é tapete). Parede, rocha e
  paredão são blocos com tampo chanfrado; o fundo d'água é areia, o que dá
  prainha nas margens.
- **Água em shader.** Ondas no vértice, e uma textura de margem (forte na
  água colada em terra, com uma borda de mar aberto em volta) que desenha a
  linha de espuma; brilho que corre e a mesma névoa da cena.
- **Vento.** Copa e mato balançam no shader (`onBeforeCompile`, o tempo num
  uniform compartilhado) — o topo anda mais que a base.
- **Luz.** `luzDe(região, período, clima, interior)` em `relevo.ts`: céu em
  degradê com a cor da região, sol que muda de cor e de ângulo com a hora,
  névoa; chuva apaga o sol e neblina aproxima a névoa. Tone mapping ACES.
- **Entorno.** Além da borda: chão da cor da borda, uma faixa de mata que
  rareia e morros que a névoa apaga — o mapa não parece um tabuleiro
  recortado. Do lado do mar, só o mar.
- **Câmera.** Persegue o jogador com amortecimento (salta ao trocar de mapa),
  com altura e recuo próprios para rua, casa e caverna.

## Som feito por código

Nenhum arquivo de áudio: `src/audio/motor.ts` é um sintetizador pequeno em
WebAudio, no espírito de um console portátil — onda de pulso (12,5%, 25% e
50%) para melodia e arpejo, triângulo para o baixo, ruído filtrado para a
bateria e para os efeitos.

**A música é texto.** Cada música em `audio/musicas.ts` é só a melodia e os
acordes:

```ts
agua: {
  bpm: 96, baixo: 'baiao', bateria: 'baiao', arpejo: 'colcheia',
  acordes: ['D', 'G', 'D', 'A', 'D', 'G', 'A', 'D'],
  melodia: `a4 d5 f#5:3 e5:1 d5 a4 b4:4 | g4 b4 d5:4 c#5 b4 g4:4 | ...`,
},
```

Nota é `c5`, `f#4`, `bb4`; `:4` é a duração em semicolcheias (sem ela, uma
colcheia); `-` é pausa; `|` fecha o compasso — e compasso que não soma 16 é
erro, pego pelo teste. O baixo, a bateria e o arpejo **saem dos acordes**, por
estilo (`baiao`, `galope`, `marcha`, `passeio`...), então compor uma música
nova é escrever a melodia e a harmonia. A música é agendada ~150 ms à frente
no relógio do áudio, para o ritmo não tremer quando um quadro atrasa.

**Na cutscene, a música é por tomada.** Cada `Tomada` em
`data/cutscenes.ts` pode dizer `musica: '<tema>'`; sem isso, segue o tema da
anterior, e a primeira de todo roteiro precisa dizer (o teste cobra, e cobra
também que nenhum tema fique sem tocar). Trocar de tema no meio da cena é um
fade de 0,6 s; o mesmo tema em tomadas seguidas não recomeça; ao acabar ou
pular a cutscene, a música some, e o mundo põe o tema dele de volta. Os
temas saem do roteiro:

| tema | o tom | onde toca hoje |
|---|---|---|
| `fogueira` | acalanto, sem bateria | a avó na beira do fogo |
| `encantados` | encanto, fá lídio | "cada rio tinha dona"; a Iara-Mãe no salão |
| `companhia` | ameaça: ostinato grave, marcha, diminuto | toda aparição da Companhia Mata-Seca |
| `trilha` | esperança que cresce | as oito medalhas no céu |
| `firmina` | modinha de casa | a sala da Dona Firmina |
| `zeca` | forró atrevido | o rival, no paredão |
| `lembranca` | saudade que termina em maior | o redemoinho do Zeca; o porto de antigamente |
| `porto` | baião de pescador | o Mestre do Porto, as redes, o barco saindo |
| `redes_noite` | noite calma, gorro espiando | as redes no varal |
| `boitata` | perigo, mi frígio, galope | o mar fervendo e a cobra de fogo |
| `saci` | travessura cromática | os três Sacizinhos |
| `contador` | curiosidade miúda | o Contador de Bichos |
| `terreiro_agua` | solene, devagar | o Terreiro de Água e a Dona Mariana |
| `viagem` | partida, horizonte | a carta para a Tiê; a touceira que abre para a Serra |
| `mata` | baião manso, lá dórico | o Seu Elias, o viveiro, a clareira |
| `caipora` | trote miúdo e cromático | as três Caiporinhas das mudas |
| `curupira` | mistério, ré dórico, assobio no alto | a grota funda e a pegada de pé virado |
| `terreiro_raiz` | devagar, como raiz que cresce | o Terreiro de Raiz e a Tiê |
| `serra` | baião de tropeiro, lá mixolídio | a tropa, a Vila Fornalha de noite |
| `forja` | marcha de martelo, ré menor | o Ferreiro, a candeia e os cinco potes |
| `mula` | galope de casco de fogo | a Mula-sem-Cabeça da cumeeira |
| `terreiro_brasa` | solene, brasa que não apaga | o Terreiro de Brasa e o Brás |
| `campo` | xote de vento solto | os catadores, o moinho, a Aldeia Catavento |
| `matinta` | o assobio comprido lá no alto | a Matinta do redemoinho |
| `terreiro_vento` | vento que gira, ré dórico | o Terreiro do Rodamoinho e o Pererê |
| `tambores` | baque forte, mi menor | os tambores da campina, a aldeia em festa |
| `relampo` | tempestade ligeira | o Relampo do cume |
| `terreiro_trovao` | quem escuta o céu, mi dórico | o Terreiro do Trovão e o Guaraci |
| `garimpo` | baião de trabalho, ré mixolídio | a Garimpeira, o arraial, o Tuco |
| `mapinguari` | passo pesado, dó menor | o fundo da Cava Funda |
| `terreiro_pedra` | pedra que assenta | o Terreiro da Pedra e o Ubirajara |
| `bairro` | passo miúdo e cromático, de noite | a Cartomante, o bairro, a Velha |
| `cuca` | o acalanto de "dorme, neném", assombrado | o sótão do Casarão |
| `terreiro_breu` | o escuro que escuta, sol menor | o Terreiro do Breu e a Morgana |
| `sol` | marcha clara de meio-dia | a Cidade do Sol, o Oráculo, o Baloeiro |
| `estrela` | a última estrela, mi maior, no alto | a Estrela-d'Alva do Pico |
| `terreiro_aurora` | majestoso, sol nascendo | o Terreiro da Aurora e o Solano |
| `circulo` | fanfarra das oito regiões | a praça e a arena do Círculo Dourado |
| `anhanga` | a luta final, mi menor | o Anhangá, campeão do Círculo |
| `campeao` | o hino da trilha inteira | a vitória, e o fim da história |

Os temas que não são de região (`companhia`, `lembranca`, `encantados`, `zeca`,
`viagem`, `trilha`, `porto`, `fogueira`) voltam em todas elas: a Companhia
sempre soa igual, toda lembrança tem a moldura e o tema de lembrança, todo
Encantado exclusivo desce com `encantados`, e toda saída de região é `viagem`. Cura,
medalha, item, subir de nível, captura, vitória e derrota são **vinhetas**:
tocam uma vez, interrompem a música da vez e a devolvem do começo.

**No mundo e na batalha, a música é por lugar.** Os temas do mundo são
outros, mais longos (16 compassos, para o laço não cansar) e mais baixos — o
campo `ganho` de `Musica` baixa a faixa inteira no motor. Quem escolhe é
`audio/temas.ts`, puro e testado:

| onde | tema |
|---|---|
| ao ar livre, por região | `mundoFoz` · `mundoMata` · `mundoSerra` · `mundoCampo` · `mundoTupa` · `mundoMinas` · `mundoCuca` · `mundoSol` |
| a praça do Círculo e a Estrada Dourada | `mundoCirculo` (pedido no próprio mapa: `musica` em `DefMapa`) |
| dentro de casa, loja, benzimento | `casa` |
| terreiros e a arena | `terreiro` |
| mapa com `escuro` (caverna, casarão, os salões no breu) | `breu` |
| bicho do mato alto, e o bicho-ladrão (Sacizinho, Caiporinha) | `batalhaSelvagem` |
| treinador da estrada, guarda de terreiro | `batalhaTreinador` |
| dono de terreiro, o Zeca, guardião, campeão, revanche, bicho-chefe | `batalhaChefe` |

`temaDoMapa` olha, nesta ordem: o `musica` do mapa, o `escuro`, se é terreiro
(o id ou `zeraAoEntrar`), se é interior, e por fim a região. `temaDaBatalha`
decide pela `classe` do treinador (DONO/DONA, REVANCHE, RIVAL, MOLEQUE DA
VILA — o Zeca —, GUARDIÃ(O), CAMPEÃO, BICHO, CHEFE); "GUARDA DO..." fica de
fora. A cena do mundo pede o tema ao montar o mapa e ao voltar de batalha
ou cutscene; `main.ts` pede o da batalha ao começar a luta (`PedidoBatalha.
musica`); os créditos tocam `campeao`, e o título fica em silêncio. Pedir o
tema que já toca não o recomeça — entrar e sair de casa só troca o tema
quando ele muda. O teste de cutscenes cobra que nenhum tema fique sem tocar
em lugar nenhum: cutscene, mapa ou batalha.

**O clique de interface** não está espalhado pelas telas: `Entrada` sabe o
que cada cena de fato *usou* no quadro (`usadasNoQuadro`), e o laço toca um
som só — A confirma, B volta, MENU abre, seta move o cursor. Tecla que
ninguém usou fica muda: o A andando pelo mapa sem nada na frente não clica.

O navegador só libera áudio depois de um toque ou tecla; o primeiro destrava
o motor, e a música pedida antes disso começa ali. Aba escondida suspende o
áudio. Volumes (desligado, baixo, médio, alto) moram em `game/config.ts`,
fora de qualquer save.

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
- **Golpes.** 92, em `data/moves.ts`: cada um é um punhado de números, e o
  `efeito` diz o que ele faz além do dano. Além de estado, quebranto,
  atributo, dreno, recuo, cura e crítico, há cinco efeitos que o motor
  interpreta em `acaoGolpe`/`aplicarGolpe`:
  - `multi: [min, max]` — várias pancadas, cada uma com o próprio dano e
    crítico; o "é super eficaz" sai uma vez só, na última;
  - `recarga` — depois de acertar, `Combatente.recarregando` faz o próximo
    golpe virar "precisa recuperar o fôlego";
  - `protege` — o Fecha-Corpo marca `protegido` até o fim do turno, e o
    golpe do outro que mire nele (`miraOponente`: dano, estado, quebranto ou
    atributo do oponente) não pega; `ultimoProtege` faz o segundo seguido
    falhar;
  - `danoFixo: 'nivel'` — tira o nível de quem usou;
  - `dobraSeStatus` — potência dobrada contra estado alterado.
  Trocar de Encantado zera tudo isso (`envolver`). Doze golpes são próprios
  de uma forma final; `data/moves.test.ts` confere quem aprende cada um, que
  todo golpe tem quem o aprenda, que as listas estão em ordem de nível, e
  roda uma simulação de equilíbrio no nível 60 (todas as formas finais contra
  todas) como alarme contra golpe quebrado.
- **Golpes fora do nível.** `game/golpes.ts` é puro: `relembraveis` junta o
  que a espécie e as formas de antes dela (pela cadeia `evolui.em`) aprendem
  até o nível de agora, menos o que ele sabe — sem campo novo no save;
  `compatibilidade` diz se uma cantiga serve (`tipos` ou `'todos'`); `ensinar`
  põe na vaga ou troca o golpe escolhido. O Rezador é uma fala com
  `rezador: true` (como o baú tem `caixa: true`) que abre `scenes/rezador.ts`;
  a cantiga é um item `{ k: 'cantiga', golpe, tipos }` que não se gasta —
  `Fala.cantiga` entrega uma se ainda não estiver na mochila, e a de loja tem
  `medalha` (só aparece no balcão depois dela, `aVendaPara`) e máximo de uma
  (`maximoNaMochila`).
- **Traços.** `data/tracos.ts` é uma ficha por traço, declarativa como o
  `efeito` dos golpes, e o mapa `TRACO_DA_ESPECIE` (fora da ficha da
  espécie, para ficar tudo num lugar; a linha de evolução divide o traço).
  O motor lê os campos nos ganchos: `aoEntrar` (no `abrir`, nas trocas e no
  inimigo que entra), `fatorTraco` (força de quem bate × couro de quem
  apanha, passado como `fator` ao `calcularDano`; a IA usa a mesma conta),
  `absorve`, `semCritico`/`criticoExtra`, `contato` (depois de golpe físico
  que tirou HP), `imune`/`semQuebranto`/`semRecuo`, `miraTorta`,
  `tracoFimDeTurno`, captura, fuga e `achar` (Rodamoinho, que põe o item
  direto na mochila viva). Quando um traço age sai o evento
  `{ k: 'traco', lado, nome }`, que a cena mostra como uma faixa junto do
  painel. A noite vem de `OpcoesBatalha.noite`, que a cena preenche com
  `game/tempo.ts` (`ehNoite`, pelo relógio do aparelho).
- **Captura.** Chance cresce com o dano levado, com o estado alterado e com a
  qualidade do patuá. Os quatro balanços da animação são a mesma chance dividida
  em quatro sorteios: se balançar as quatro vezes, pegou.
- **IA.** Pontua cada golpe pelo dano real que ele faria e escolhe entre os
  melhores com um pingo de acaso — treinador é mais certeiro que bicho selvagem,
  e derrubar o oponente naquele turno vale mais que qualquer outra coisa. Golpe
  de várias pancadas conta a média; golpe com recarga só compensa se derruba;
  o Fecha-Corpo só aparece com a vida curta, e nunca dois turnos seguidos.
  O dano sai de `danoEstimado` (com traços; quem absorve aquele tipo vale 0).
  O bicho selvagem fica nisso. O **treinador** pensa mais
  (`notaEstadoEsperta`): golpe de estado sem efeito vale zero (alvo já com
  estado, imune pelo tipo — `imunePorTipo`, a mesma regra da `aplicarStatus`
  — ou pelo traço; atributo no limite; cura de vida cheia), não gasta golpe de
  estado quando o jogador o derruba neste turno, e entre golpes que derrubam
  prefere o mais certeiro e o que sai antes (`ageAntes`: prioridade, depois
  velocidade) quando ele mesmo está para cair. O treinador **`esperta`**
  também troca (`trocaDaIA`): quando leva 2× ou cairia neste turno
  (`perigo`: o maior dano do jogador sobre a vida atual), não derruba o
  jogador agora e não somou +2 de ataque e poder, vai para a reserva de menor
  perigo que não leve 2× — com 55% de chance, para não ficar previsível.
  `ia.test.ts` cobre cada regra.

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
  `ALTURA_NADANDO` (`scenes/mundo/pintor.ts`) com `recorte()`: só a cabeça e um
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
  do Mestre do Porto, encurralados, brigam pela rede: são treinadores
  selvagens (`selvagem`, sem `visao`) com `da: { item: 'rede' }`, e vencer —
  ou prender no patuá — larga a rede na mochila. Eles só existem depois da
  carta (`se: 'conta_recado'`: é o Mestre quem conta das redes) e ficam em
  esconderijos: atrás das pedras do paredão, atrás do farol e no beco entre a
  venda e a casa do pescador. Sair do mapa devolve o fôlego deles, para a
  caçada nunca ficar impossível nem eterna.
- **Encontro.** Um NPC com `encontro: '<cutscene>'` toca essa cutscene a
  primeira vez que o jogador chega a 3 passos dele — é o Sacizinho achado no
  esconderijo, antes da caçada.
- **Emboscada.** Com `emboscada: true`, o NPC do `encontro` nem aparece
  (nem enxerga, nem conversa) antes da cutscene dele, e a luta começa assim
  que ela acaba — o Boitatá do farol, que só existe depois das redes
  (`se: 'conta_redes'`), e o bicho da quinta conta de toda região (a Mula,
  a Matinta, o Relampo, o Mapinguari, a Cuca, a Estrela-d'Alva). Enquanto uma cutscene de encontro está pedida,
  nenhum treinador desafia ninguém.

**O salão da Dona Mariana não foi desenhado no olho.** Um salão de gelo erra
fácil de dois jeitos: ou vira corredor, ou vira armadilha — você chega num canto
de onde não dá mais para voltar e a partida trava. A planta saiu de uma busca
larga entre as combinações de duas colunas, exigindo caminho até a saída **e**
volta até a porta a partir de todo lugar alcançável. `mapas.test.ts` refaz as
duas contas a cada execução.

**O Terreiro de Raiz reusa a mesma regra, cara nova.** Em vez de poça (`u`),
o chão do salão da Tiê é raiz viva (`v`, `art/tiles.ts:tileRaizViva`) — mesmo
`escorrega`, mesma física, textura marrom-avermelhada em vez de azul, e um
traçado de colunas diferente, buscado à parte para não repetir a solução do
Terreiro de Água nem virar corredor de uma tecla só. `guia()` também aprendeu
a colorir as contas acesas pela cor do tipo do terreiro (`TIPOS[tipo].cor`),
então a guia da Mata do Curupira acende em verde, não em azul.

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

`contas`/`faltam`/`servico` sem sufixo sempre falam do Terreiro de Água — é
compatibilidade com a Região da Foz inteira, que já cita assim. Uma segunda
guia usa o sufixo do próprio tipo: `contas:planta>=3`, `{faltam:planta}`,
`{servico:planta}`. Por trás, `TERREIROS` (em `quests.ts`) é um registro de
listas de cinco contas por terreiro — `agua`, `planta`, e uma por região que
vier depois —, e `ContextoMapa.contas` deixou de ser um número (contagem de
UM terreiro) para ser uma função `(terreiro) => número`: cada `portao` no
mapa carrega o seu próprio `terreiro`, e a cena do mundo descobre qual guia
cortar a câmera para mostrar pela flag que a conta liga (`terreiroDaConta`),
não mais comparando contagem de antes e depois — o que quebraria assim que
uma segunda guia entrasse em jogo ao mesmo tempo.

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

Essa tela — `scenes/slots.ts:TelaSlots` — é uma sobreposição só, usada em quatro
lugares: CONTINUAR, NOVO JOGO e IMPORTAR SAVE no título, SALVAR no menu de pausa. Ela lista
os seis slots como uma coisa só (nome, nível, quando foi gravado), mas o
comportamento muda com o `modo`: CONTINUAR só aceita slot ocupado; NOVO JOGO,
SALVAR e IMPORTAR aceitam qualquer um, e um slot ocupado pede confirmação antes. Isso mora
dentro do próprio componente, então as telas que o usam ganham a
confirmação de graça, sem reescrever nada. Quem jogava antes dos seis slots
tinha um save só, numa chave sem número; `migrarSaveAntigo()` o move para o
slot 1 na primeira vez que o jogo carrega, e nunca mais toca naquela chave.

**Levar o save para fora.** `game/transferencia.ts` transforma a partida em
texto e de volta: o arquivo baixado é o próprio JSON do slot; o código é o
mesmo JSON em UTF-8 e base64, com o prefixo `ENCANTADOS1:`. A volta passa por
`restaurar()`, a mesma porta de entrada de qualquer save, então um arquivo
de outra versão ou um código mal colado vira no máximo uma partida com
menos coisas, nunca uma exceção. A ponte com o navegador (baixar, copiar,
o seletor de arquivo, o `prompt` para colar) mora em `ui/arquivos.ts`.
Exportar fica em OPÇÕES; importar, no título, que é por onde entra quem
trocou de aparelho — e a `TelaSlots` ganhou o modo `importar`.

**Instalável e offline.** `public/manifest.webmanifest` e os ícones deixam
instalar o jogo. O service worker é gerado no build: o plugin
`encantados-service-worker` (`vite.config.ts`) lista tudo o que foi para
`dist/` (menos a página de esboços) e escreve `dist/sw.js` a partir de
`tools/sw.modelo.js`, com uma versão que é o hash dessa lista. Na instalação
ele guarda todos os arquivos, inclusive a vista 3D; a página vem da rede
primeiro (sem o cache HTTP de dez minutos do Pages) e cai na cópia guardada
sem internet; o resto, que tem hash no nome, vem direto do cache. Cada
publicação cria um cache novo e apaga o anterior. Só é registrado no build
de produção (`main.ts`).

Um jogo NOVO — nunca um CONTINUAR — passa primeiro pela **cutscene de
abertura**: seis tomadas animadas (a avó contando a história na beira da
fogueira, o rio, a mata e a serra com os Encantados que moram neles, a vila
de hoje em que ninguém mais os vê, o trator da **Companhia Mata-Seca**
transformando a mata em toco, a trilha ao amanhecer com as oito medalhas no
céu, e o letreiro). A legenda se lê como qualquer conversa (A revela e
avança), B pula a abertura inteira. Quem toca é `scenes/cutscene.ts:
CenaCutscene`, a partir de um roteiro em `data/cutscenes.ts` — fundos e
peças desenhados em `art/cenas.ts`. Outras cutscenes da história entram do
mesmo jeito: basta um roteiro novo e `cutscene: '<id>'` numa fala ou num
treinador; ela toca quando a conversa fecha, uma vez só por partida (flag
`viu_cut_<id>`), e o mundo continua de onde estava. A segunda cutscene é a
da **Dona Firmina**, logo depois de escolher o primeiro Encantado: ele em
cima da mesa, e a Firmina contando como a Companhia desceu na Foz com
estaca e papel carimbado e fechou o rio com uma comporta. Ela usa o
personagem e o Encantado de quem está jogando (`{ jogador: true }`,
`{ inicial: true }` e `{inicial}` na legenda), e as páginas de fala levam
o nome de quem fala numa etiqueta. A terceira é a do **Zeca**, no primeiro encontro no paredão da Rota da
Foz: o letreiro "ZECA, O REDEMOINHO", a lembrança dele pulando num
redemoinho atrás de um Sacizinho (daí o apelido) e o pai dele, que foi
trabalhar para a Companhia Mata-Seca. Ela toca ENTRE a fala de desafio e a
batalha: o treinador leva `apresentacao: '<id>'`, e a luta espera a cutscene
acabar. A quarta é a do **Mestre do Porto**, quando ele recebe a carta da
Firmina em Porto Iara: o porto de antigamente com trinta barcos e a Iara-Mãe
guiando na neblina, o capataz da Companhia com o papel de compra, as redes
sumindo de noite nas mãos dos Sacizinhos e, no fim, o aviso do farol. Ela
toca antes do corte da guia que acende a conta. Os três **Sacizinhos das
redes** têm duas cada, do mesmo molde com o esconderijo trocado: a de quando
são achados (brincando de dar nó na rede, o aviso de encurralar) e a de
quando perdem a briga — a rede cai e ele vira redemoinho (`peca: 'rede'` e o
efeito `poeira`). A de derrota não toca se ele foi preso no patuá. E quando as
três redes chegam no Mestre, mais uma (`mestre_redes`): os nós de Saci
desfeitos no cais, as redes de volta no varal com um gorro vermelho espiando
de longe, o barco dele saindo pela barra ao amanhecer, e a conta acesa. E a do
**Boitatá** (`boitata`), quando o jogador chega na ponta do cais: o mar
ferve, a cobra de fogo desenrola de trás do farol (a peça `farol` tem
`frente: true`, desenhada por cima do bicho) e o letreiro "BOITATÁ, O BICHO
DO FAROL". E a do **Contador de Bichos** (`contador`), na primeira conversa,
quando ele dá o caderno: a mesinha debaixo da amendoeira, o caderno aberto
com Piraguá, Caiporinha, Sacizinho e o inicial de quem joga nos quadros, a
mata cortada pela Companhia ("o que ninguém conta, some sem ninguém saber")
e o pedido dos quatro bichos. O **Terreiro de Água** tem duas: a da
primeira entrada (`terreiro_agua`, pelo `aoChegar` do mapa, que liga
`viu_cut_terreiro_agua` e não toca de novo) — o salão alagado, a Iara-Mãe na
lembrança e o letreiro da Dona Mariana — e a da vitória (`mariana_vence`,
`cutscene` do treinador): a água assentando (`depois` com `salaoAguaCalmo`),
a comporta e a Medalha Maré, que a fala dela entrega em seguida. E a
carta para a Tiê fecha a região com duas: saindo do terreiro com a medalha,
o `aoChegar` de Porto Iara (`se: 'medalha:mare'`, `seNao` com
`viu_cut_firmina_chama` e `deu_carta_tie`) põe o Mestre do Porto na porta
com o recado da Firmina (`firmina_chama`: a porta do terreiro ao pôr do sol,
a Firmina na lembrança e a trilha de volta); e na casa dela, a fala que dá
`carta_tie` toca `firmina_carta` — a carta lacrada na mesa (peça `carta`), a
Tiê do outro lado da água e o letreiro da Mata do Curupira.

A **Mata do Curupira** segue o mesmo desenho. O **Seu Elias** recebe a carta
(`elias`): a clareira, a mata de antigamente com o Curupira trazendo de volta
quem se perdia, a picada da Companhia com X vermelho nos troncos (peça
`tinta`), o viveiro com três covas vazias, o caderno de pegadas e o aviso da
grota. O **Zeca** volta no igarapé (`zeca_mata`, `apresentacao`): atravessou
o rio a nado, viu o pai pintando árvore para a Companhia, e o letreiro "ZECA,
DE NOVO NO CAMINHO". As três **Caiporinhas** das mudas saem do mesmo molde dos
Sacizinhos (`caiporinhaAchada`/`caiporinhaVencida`, com a peça `muda`): na
beira do igarapé, entre as touceiras e em cima do tronco caído — e, como eles,
só aparecem depois da carta e brigam pela muda quando encurraladas. As mudas
de volta (`elias_mudas`): o viveiro replantado, uma Caiporinha que volta de
noite para regar, e uma muda em cada toco da picada. O caderno cheio
(`elias_pegadas`): os bichos nos quadros e a pegada de pé virado. O
**Curupira** da grota vem de emboscada depois da carta (`curupira`), com o
letreiro "CURUPIRA, O GUARDIÃO DA GROTA". O **Terreiro de Raiz** tem a entrada
(`terreiro_raiz`: o salão de raiz viva, a sumaúma de mil anos e o letreiro da
Tiê) e a vitória (`tie_vence`: as raízes dão flor, a mata marcada, a Medalha
Raiz). E saindo com a medalha, o `aoChegar` da Mata (`elias_serra`) mostra a
fumaça da Serra Boitatá e a touceira que o Dom de Cortar Cipó abre.

**Da Serra ao Círculo, o mesmo desenho**, com os roteiros de cada região num
arquivo seu (`data/roteiros/`) e os fundos também (`art/fundos/`). Em toda
região: o rival e o chefe da estrada apresentados antes da luta
(`apresentacao`), quem pede serviço contando a história quando a fala fecha, o
bicho da região de **emboscada** (`encontro` + `emboscada`: some até o jogador
chegar perto, a cutscene mostra ele saindo e a luta começa), o terreiro com a
entrada (`aoChegar` do salão) e a vitória (`cutscene` do dono, que termina na
medalha que a fala dele entrega), a saída chamando a região seguinte (`aoChegar`
do eixo da região com `se: 'medalha:<id>'`) e o Encantado exclusivo descendo
com cutscene (a oferta de reordenar o time fica para o menu, para não cobrir a
cena). A Companhia aparece em todas, cada uma do seu jeito:

| região | a história | cutscenes |
|---|---|---|
| Serra Boitatá | a tropa sem trilha; a carvoaria queimando a encosta espantou o Boitatá para o fundo da caverna | `chefe_tropa`, `ferreiro` (a candeia), `zeca_serra`, `ferreiro_fole` (os cinco potes), `mula`, `terreiro_brasa`, `bras_vence`, `fornalha_campo`, `mae_do_ouro` |
| Campo do Saci | os catadores de vento e o recado do Saci; a cerca de arame e a soja até o horizonte | `catadores`, `zeca_campo`, `moleiro` (as cinco penas), `matinta`, `terreiro_vento`, `perere_vence`, `catavento_tupa`, `uirapuru` |
| Aldeia Tupã | o tambor que responde ao trovão; as torres e o casarão de para-raios que prendem o raio num fio | `tambores`, `zeca_tupa`, `paje` (as pedras-de-raio), `para_raios` (o para-raio mestre, fala de objeto), `relampo`, `terreiro_trovao`, `guaraci_vence`, `tupa_minas`, `arco_da_velha` |
| Minas da Caipora | o garimpo de bateia contra a draga que revira o rio | `garimpeira` (a forquilha), `zeca_minas`, `tuco` (o Tuco em casa), `mapinguari`, `terreiro_pedra`, `ubirajara_vence`, `arraial_cuca`, `caipora` |
| Bairro da Cuca | a noite que era de todo mundo; a placa de VENDIDO no Casarão | `cartomante` (na terceira carta certa), `zeca_cuca`, `cuca`, `terreiro_breu`, `morgana_vence`, `bairro_sol`, `pisadeira` |
| Cidade do Sol | a visão das oito medalhas e da sala da Companhia, com um X em cada região | `oraculo` (na terceira resposta certa), `zeca_sol`, `estrela`, `terreiro_aurora`, `solano_vence`, `sol_circulo`, `jaci` |
| Círculo Dourado | o campeão de vinte anos; e o fim | `circulo` (a praça), `arena`, `zeca_final`, `anhanga`, `campeao` |

O **Zeca** atravessa tudo isso com o pai: na Serra o pai vai para os fornos da
carvoaria, no Campo o Zeca vê um redemoinho derrubar a cerca, na Aldeia um
raio cai do lado do pai, nas Minas ele pede as contas e volta a pescar com o
Mestre do Porto, no Bairro manda carta, na Cidade do Sol promete vir — e na
arena está na arquibancada. E a vitória sobre o **Anhangá** toca `campeao`
antes dos créditos (a cutscene é pedida antes, e o mundo só solta os créditos
depois dela): a arena em festa (`camaraFesta`), as oito medalhas acendendo, a
comporta da Foz rachando com a Iara-Mãe acordando (`rioLivre`), a mata
voltando (`mataDepois` → `mataAntes`), a avó fechando a história na mesma
fogueira da abertura e o letreiro "ENCANTADOS".

Os donos de terreiro e quem conta história ganharam estilo próprio em
`art/people.ts` (`bras`, `perere`, `guaraci`, `ubirajara`, `morgana`,
`solano`, `ferreiro`, `paje`, `garimpeira`, `cartomante`, `oraculo`), usado
no mapa, na revanche do Círculo e nas cutscenes.

Depois da abertura vem `scenes/
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
  - [x] **Mata do Curupira.** A guia e as contas viraram um sistema por
        terreiro (`TERREIROS` em `quests.ts`, uma chave por tipo), para caber
        mais de uma região aberta ao mesmo tempo. A segunda carta da Dona
        Firmina, o Zeca barrando o igarapé de novo, o viveiro do Seu Elias e
        as Caiporinhas com as mudas, o Curupira selvagem da grota, o Terreiro
        de Raiz com quebra-cabeça de raízes vivas (a mesma regra do salão
        alagado, cara nova), a Tiê, a Medalha Raiz e o Dom "Cortar Cipó".
  - [x] **Serra Boitatá.** A primeira região grande e difícil de verdade, a
        pedido de quem joga: 4.480 tiles ao ar livre em quatro mapas, doze
        treinadores com times de 2 a 5, e duas mecânicas novas — a
        **escuridão** (`game/luz.ts` + `mascaraLuz`, com a candeia do
        Ferreiro e depois o Dom "Tocha" aumentando o que se enxerga) e as
        **pedras que se empurram** (`world/pedras.ts`, com busca em largura
        provando que toda sala tem solução). A IA de batalha passou a trocar
        de Encantado e a usar item, mas só para treinador marcado `esperta` —
        as regiões 1 e 2 ficaram exatamente como estavam. O Terreiro de Brasa
        tem quatro salas, três guardas e dois campos de pedra até o Brás, que
        escala um quinto Encantado escolhido contra o inicial do jogador. Mais
        a Medalha Brasa, o Dom "Tocha", e dois serviços opcionais (os três
        sinos e a Mãe-do-Ouro) que não travam a guia.
  - [x] **Campo do Saci.** Mesma escala da Serra — 4 mapas externos + 6
        interiores —, com o quebra-cabeça de escorregar saindo da sala
        fechada pela primeira vez: `world/tilemap.ts` ganha um tile de
        corrente de vento (`escorrega: true`, mesma regra da água e da
        raiz), e a Ventania Funda é um trecho **obrigatório** no caminho —
        duas piscinas de correntes achadas por busca larga, sem NPC nem
        treinador dentro, onde atravessar é o próprio desafio. O Terreiro
        do Rodamoinho fecha a região com três correntes empilhadas — cada
        uma com mais forquilhas que a anterior, e uma guarda entre elas —
        onde errar o lado certo de qualquer forquilha pisa numa saída de
        mapa disfarçada (a mesma `DefSaida` usada entre regiões, aqui com
        destino igual ao próprio `inicio`) e devolve pro começo do salão
        inteiro; guarda já vencida continua vencida, só a corrente em si
        tem que ser refeita. O Pererê espera no topo, depois da terceira
        guarda. Todo treinador da região (não só os chefes, como na Serra) troca de
        Encantado e usa item. Um `TipoObjeto` novo, `'monteFolhas'` (molde
        de `'forja'`/`'moinho'`), some com o Dom Rajada e abre bolsos que
        ninguém alcançava antes — sem nunca trancar o caminho obrigatório,
        que se resolve só andando. Mais a Medalha Rodamoinho, o Dom
        "Rajada", e dois serviços opcionais (os três punhados de capim
        dourado e o Uirapuru) que não travam a guia.
  - [x] **Aldeia Tupã.** Maior para baixo E para os lados: quatro mapas
        externos de 56 a 64 colunas (as regiões anteriores paravam em 34),
        e a primeira região em cruz em vez de fila — Campina dos Raios a
        oeste, Charco Relampejante a leste, Morro do Trovão ao norte, todos
        saindo da aldeia. A travessia é de lado: cercas de norte a sul na
        campina e cristas de oeste a leste no morro, com os vãos alternando
        de ponta, e as cinco pedras-de-raio do Pajé nos cantos mais longe.
        Mecânica nova sem código de motor: **chaves de para-raio** — um par
        de objetos `paraRaio` por chave (`se`/`seNao` na flag, o molde do
        `achado`) e `cercaRaio`s condicionados às mesmas flags, que
        `Fala.desliga` e `atualizarCenario()` já sabiam ligar e desligar.
        Toda chave abre uma cerca e fecha outra; `mapas.test.ts` busca em
        largura sobre posição × chaves e prova que o casarão do Charco pede
        seis toques e o Terreiro do Trovão quatro (e, como todo movimento
        é reversível, que ninguém fica preso). Dois `TipoObjeto` novos de
        cenário (`cercaRaio`, `pedraRachada` — molde do `monteFolhas`, some
        com o Dom Faísca) e um de chave (`paraRaio`). O Guaraci escala um
        sexto Encantado contra o inicial, como o Brás. Mais a Medalha
        Trovão, o Dom "Faísca", e dois serviços opcionais (as três penas de
        trovão e o Arco-da-Velha) que não travam a guia.
  - [x] **Minas da Caipora.** Tipos de tarefa novos, cada um com motor e
        teste próprios. **Caça ao tesouro**: `TipoObjeto` `'enterrado'`
        (não se desenha nem é parede; cavado, vira buraco) e a forquilha,
        que o menu usa através de `OpcoesMenu.sondar` — a resposta vem de
        `game/tesouro.ts`, puro. **Charadas**: `Fala.pergunta` (opções,
        certa, acertou, errou/desliga); `fecharConversa()` segura a fala,
        abre a caixinha de opções e `responder()` decide — certa aplica a
        fala como qualquer outra, errada só apaga o progresso. **Escolta**:
        `game/escolta.ts` (só flag) e um `Ator` seguidor que vai sempre para
        o tile que o jogador acabou de deixar (`Ator.andarPara`), atravessa
        porta e trilho junto e cai em `socorrer()`. **Trilhos de vagonete**:
        tiles `D`/`E`/`C`/`B` com `DefTile.trilho`, objetos `'desvio'` que
        sobrepõem a direção enquanto ativos e `'alavanca'` para trocá-los;
        `aoPisarNoTile()` vira o jogador e reaproveita o `deslizando`. O
        labirinto das Galerias saiu de busca (subida de encosta sobre 3×3
        plataformas e 3 alavancas) e `mapas.test.ts` prova, sobre o mapa de
        verdade, as seis alavancadas mínimas e — agora com busca reversa,
        porque trilho não se desfaz — que nenhum estado deixa ninguém preso
        e que do sino sempre se volta com o Tuco. O Dom Faísca da região 5
        abre a estrada (duas pedras rachadas no alto do Morro do Trovão);
        o Dom Escavar, conquistado aqui, abre `'monteTerra'`.
  - [x] **Bairro da Cuca.** Mais dois tipos de tarefa novos. **Furtividade**:
        `DefNPC.ronda` (caminho fechado de tiles vizinhos, alcance da vista,
        para onde devolve, o que diz); a cena anda os vigias um tile por vez
        (`Ator.andarPara`, o mesmo do escoltado) e, a cada quadro, pergunta a
        `game/ronda.ts` se algum enxerga o jogador em linha reta — parede
        corta a vista. Visto, volta à entrada e as rondas recomeçam. As rondas
        do Beco saíram de simulação, e `mapas.test.ts` refaz a simulação sobre
        o mapa de verdade: a travessia sem vigia tem 36 passos; a mais curta
        que ninguém vê, bem mais. No Terreiro do Breu as fases dos três vultos
        foram escolhidas por busca para obrigar a esperar. **Ladrilhos de
        memória**: `DefMapa.sequencia` e objetos `'ladrilho'` com símbolo;
        pisar conta, zera ou completa (`game/sequencia.ts`, puro), e a
        sequência liga a conta da guia. O Dom Visão Noturna amplia a luz
        (`RAIO_VISAO`) e desfaz `'veu'` (molde do monte de terra); o Dom
        Escavar da região 6 abre a estrada na borda oeste da Cava Funda.
  - [x] **Cidade do Sol.** Mais dois tipos de tarefa novos. **Feixe de
        luz**: `DefMapa.feixe` e objetos `'fonteLuz'`, `'espelho'` (com
        `inclinacao` "/" ou "\\", girado pelo mesmo par de objetos das
        chaves de para-raio) e `'cristal'`; `game/feixe.ts` (puro) traça o
        raio tile a tile, a cena o desenha e, ao bater no cristal, acende a
        flag. `mapas.test.ts` testa as 512 combinações do Jardim: a solução
        mais curta gira quatro espelhos, e é única. **Corrida contra o
        sol**: `DefMapa.corrida` (flag que dá a largada, marcos, conta,
        segundos); `game/corrida.ts` (puro) diz se está correndo, venceu ou
        perdeu, a cena desconta o tempo só com o jogador andando livre e
        mostra o relógio. O teste acha a rota mais curta pelos cinco
        lampiões e confere que ela cabe no tempo correndo, mas não andando.
        O Dom Prisma desfaz `'cortinaLuz'`; o Dom Visão Noturna da região 7
        desfaz o véu da saída sul do Bairro da Cuca.
- [x] **5 — Torneio.** O **Círculo Dourado**, no meio do continente: a
      Estrada Dourada sai da borda oeste da Aldeia Catavento, com um portão
      que só abre com as oito medalhas, e um **balão** liga a Cidade do Sol à
      praça (`Fala.leva`). Na arena, seis câmaras uma em cima da outra:
      Iracema (Água/Planta), Itaberá (Fogo/Terra), Ybytu (Vento/Raio),
      Jacira (Sombra/Luz), o Zeca pela última vez e o **Anhangá**. Não há
      benzimento lá dentro, e `DefMapa.zeraAoEntrar` apaga as vitórias toda
      vez que se entra vindo de fora: quem sai para se curar, ou cai, recomeça
      do primeiro Guardião. Vencer o Anhangá liga `campeao` e toca os
      **créditos** (`scenes/creditos.ts`); depois, os seis voltam com times
      mais fortes e os oito donos de terreiro esperam revanche na praça.
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
- Os iniciais evoluem no 18 e de novo no 55. As formas de cima de cada
  linhagem só aparecem por evolução: nenhum treinador nem mato alto as usa.
- A Serra Boitatá usa `cenario: 'caverna'` nas batalhas da caverna e da
  cumeeira: não existe fundo de montanha próprio, e a trilha e a vila caem no
  fundo de mata mesmo.
- Uma placa é sólida. Num corredor de largura 1 isso parte o caminho em dois —
  foi exatamente o que aconteceu na câmara das covas da caverna e travou uma
  cova inalcançável. O teste de solução das pedras pega, mas só se a sala
  tiver `pedras` declaradas; em corredor sem pedra, nada acusa.
- `temSolucao` lê o sólido do mapa já assado: uma tranca do lado de fora da
  sala, presa à mesma flag da cova, continua fechada dentro da busca. O
  `objetivo` tem que ser um ponto deste lado da tranca — quem confere se ela
  abre é outro teste, com outro `Mapa`.
- Objeto sólido (`placa`, `achado`) plantado em cima do `inicio` de um mapa, ou
  bem no meio de um corredor de largura 1 que liga duas partes de um
  quebra-cabeça, bloqueia tudo sem avisar em lugar nenhum do `tsc` — foi
  exatamente o que aconteceu duas vezes construindo o Campo do Saci (uma
  placa em cima da própria entrada da Ventania Funda, outra na única boca de
  saída da primeira piscina de vento). Os testes gerais de mapa pegam o
  primeiro caso; o segundo só aparece rodando o BFS de verdade a partir do
  início, e foi assim que apareceu.
- As correntes de vento ao ar livre reaproveitam 100% o mesmo `escorrega` dos
  salões fechados — nenhuma linha nova de motor. A única coisa que muda de
  região para região é onde o tile aparece no `chao` e o tamanho da sala.
- Objeto sólido sem `larg` vira parede em **quatro** tiles (`larg ?? 4` em
  `desenharObjeto`), mesmo que o desenho ocupe um só. `achado` escapa porque
  quase sempre é `solido: false`; o `paraRaio` é sólido, então toda chave
  declara `larg: 1`.
- Tocar numa chave de para-raio muda a flag, mas não grava sozinho — o save
  só acontece nos pontos de sempre (cura, conta acesa, troca de mapa). Quem
  fechar o jogo no meio do casarão volta com as chaves como estavam no
  último save, o que nunca trava: toda chave desfaz o próprio toque.
- A Aldeia Tupã e o Morro do Trovão usam fundos de batalha que já existiam
  (`mata` e `caverna`), e o Charco usa `praia`: não há fundo de brejo nem de
  tempestade próprio.
- A escolta anda um passo atrás do jogador, sem colisão própria: o Tuco
  passa por onde o jogador acabou de passar, e numa porta surge atrás de
  quem chegou (ou no mesmo tile, se atrás for parede).
- A pergunta de uma charada mostra só a última frase da fala: uma charada
  cujo enunciado precise de mais de três linhas corta o começo.
- Os vigias de ronda não colidem com nada ao andar: o caminho deles é
  conferido nos testes (tiles vizinhos, andáveis, sem saída no meio), e o
  jogador que para na frente de um vigia é, de todo jeito, visto.
- A simulação de furtividade dos testes anda o vigia um tile a cada dois do
  jogador; no jogo ele leva 0,45 s por tile contra 0,2 s do jogador. O teste
  prova que existe travessia no modelo em passos, não no tempo exato do jogo
  — lá quem garante é poder esperar nos nichos quanto quiser.
