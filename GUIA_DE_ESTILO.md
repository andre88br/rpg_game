# Guia de estilo — Encantados

Uma página para manter o jogo com cara de um jogo só. Vale para quem
desenha bicho novo, gente nova ou efeito novo em `src/art/`. O que dá para
conferir por máquina tem teste. O resto é olho, e está aqui.

## A ideia em uma frase

Desenho animado de cabeção: figuras redondas e simpáticas, cabeça grande,
olho preto com ponto de brilho, bochecha rosada e sorriso. Mesmo as
assombrações são mais fofas que assustadoras.

## Proporção

| Figura | Tela | Cabeça | Corpo |
| --- | --- | --- | --- |
| Encantado, primeira forma | 32×32 | metade da altura ou mais | pequeno, perninhas curtas |
| Encantado, evolução | 40×40 | um pouco menos de metade | maior, pose mais firme |
| Gente | 16×20, 4 direções | redonda, linhas 2 a 12 | tronco de 4 linhas, pernas de 3 |
| Gente em 3D | `pessoa3D` | raio 0,105, umas seis cabeças de altura | tronco torneado, braço e perna em duas partes |

## O rosto

Use sempre os ajudantes de `art/creatures.ts`: são eles que fazem o rosto
mudar nas poses.

- `carinha(b, cx, cy, sep)`: olhinho de ponto (2×3, brilho no canto de cima),
  bochecha e sorriso. Para bichos pequenos e para gente.
- `olhao(b, x, y, r, dir)`: olho grande de branco com pupila. `dir = -1` no
  olho da direita, para os dois olharem para o meio.
- `olhoPonto(b, x, y, esquerdo)`: só o olhinho, quando o rosto é desenhado à mão.
- `bocaAberta(b, cx, y, meia)`: riso aberto com língua.
- Pupila de outra cor (olho azul da Mboitatá, vermelho do Pesadelo): pinte
  por cima só dentro de `if (abertos())`, senão ela aparece no olho fechado.

## As cinco poses

normal, pisca, ataque (sobrancelha fechada), dano (olho apertado `> <`) e
desmaio (olho em x). Quem desenha não escreve as poses: os ajudantes do
rosto já sabem. O teste `art/poses.test.ts` reprova um bicho cujo rosto não
muda em alguma pose.

## A silhueta

Todo bicho tem de ser reconhecível só pela sombra. O teste
`art/silhuetas.test.ts` compara as sombras de todos os pares:

- de famílias diferentes: sobreposição abaixo de 0,80;
- da mesma família (a forma e a evolução dela): abaixo de 0,88. A evolução
  lembra a forma de antes, mas muda de figura (a Mula empina, a Mboitatá se
  arrasta, a Cobra Norato se enrola).

Bicho redondo de chifrinho é o caminho mais fácil para se confundir com os
outros. Prefira uma pose que diga quem ele é.

## Cor

- Cada tipo tem a sua cor (`infoTipo` em `art/palette.ts`): fogo vermelho e
  laranja, água azul, planta verde, terra marrom, vento verde-água, raio
  amarelo, sombra roxo-escuro, luz dourado. O bicho de um tipo carrega essa
  cor em algum lugar, mesmo quando o corpo é de outra (a Boitatá é verde,
  com fogo na coroa e no rabo).
- Fogo é sempre de três cores, borda vermelha, meio laranja e miolo amarelo
  (`coroaDeFogo`, `chamaComCara`).
- Olho fechado em rosto escuro sai em traço claro (o `traco` cuida disso).
- Cor nunca é a única pista: o tipo tem nome escrito, a vida tem número, o
  status tem sigla.

## Contorno e ordem de desenho

- O contorno escuro é automático (`b.outline(P.ink)` no fim). Não desenhe
  contorno à mão por fora.
- Desenhe primeiro o que fica atrás: rabo, cabelo comprido, asas, o porco
  em que a Caipora monta. Assim os ajustes do 3D (`render3d/modelos/bichos.ts`)
  apontam para as primeiras peças, e o modelo 3D sai certo.
- Asas que batem: a da esquerda primeiro, depois a da direita.
- Bolinha pequena (`ellipse` de raio 1) vira "+" na tela. Para pinta, mancha
  ou brilho pequeno, use `rect`.

## Cenário e interface

O plano (mapa de cima, menus, luta 2D) segue em pixel. O 3D é realista:
luz de verdade, textura e nenhum contorno.

- **3D:** tudo de cor por vértice usa `materialReal()` (`render3d/modelos/base.ts`),
  que põe grão e manchas no próprio shader. Cor de natureza de verdade: verde
  de mato meio apagado, terra parda, areia clara; nada de verde-bandeira.
  Copa de árvore é `folhagem()` (tufos irregulares, miolo escuro, ponta
  clara), tronco é `galho()`. A grama tem capim (`tufoDeCapim`) da cor do
  chão. O sol fica de meio da manhã, para a sombra comprida dar volume.
- **Gente em 3D:** proporção de gente (umas seis cabeças), rosto pequeno
  de olho com íris, nariz, boca e orelha; as cores são as do estilo plano.
- **Bicho em 3D:** todos são esculpidos (`modelos/esculpidos/`, com o kit
  de `modelos/escultura.ts`) e têm olho de
  verdade (branco, íris, pupila e brilho; cobra sem branco e de pupila em
  fenda), pele lisa, escama, placa de barriga, e fogo que acende de dentro.
  Mantêm as cores do desenho, para o bicho continuar o mesmo.
- **Mapa plano:** árvore, moita e pedra têm contorno escuro. A grama tem pouco
  pontilhado, porque cor chapada lê melhor que ruído.
- **Fundo de luta 2D:** nuvens fofas de contorno manso, sol na praia, copas
  redondas no horizonte e plataformas contornadas.
- **Caixas:** canto redondo, contorno escuro, filete dourado e um brilho fino
  no alto. O miolo começa sempre em (2, 2), então trocar o desenho da caixa
  não mexe no texto de ninguém.

## Movimento

- Parado, o bicho respira (estica uns 3% para cima, com o pé no chão) e pisca
  a cada 3,4 s. Quem flutua sobe e desce.
- Nada pisca mais de três vezes por segundo. É a regra de acessibilidade para
  quem é sensível a luz que pisca.
- Clarões (relâmpago, evolução, golpes no 3D) passam por `forcaDoClarao()`,
  que a opção CLARÕES SUAVES baixa a um quarto.

## Antes de publicar um bicho novo

1. Desenhou com os ajudantes do rosto?
2. `npm test` passou, inclusive o de poses e o de silhuetas?
3. Esculpiu o bicho em 3D (`modelos/esculpidos/`, na família dele) com as
   duas cores principais do desenho, e olhou de frente, de lado e de costas?
4. A descrição (`sobre`, em `data/creatures.ts`) combina com o desenho?
