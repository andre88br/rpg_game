/* =========================================================================
   Ventania Funda — o trecho obrigatório de correntes do Campo do Saci.

   Não tem treinador nenhum aqui dentro: o desafio é o próprio vento.
   Duas piscinas de corrente ('V', escorrega — mesma regra dos salões de
   Porto Iara e do Curupira, agora ao ar livre), ligadas por corredores de
   capim parado onde dá para respirar e pensar no próximo passo. As DUAS
   piscinas têm solução, e nenhuma prende: quem entra sempre consegue
   voltar até a porta de onde veio, de qualquer lugar que alcançar
   escorregando. `mapas.test.ts` reconfere isso a cada execução com o mesmo
   par `passo()`/`alcanceDeslizando()` que já provava os dois salões — mexer
   numa pedra aqui acusa na hora.

   As pedras ('#') dentro de cada piscina NÃO foram plantadas no olho: a
   posição das quatro de cada piscina foi achada por busca larga sobre
   milhares de combinações, exigindo ao mesmo tempo (a) que dê pra sair
   pelo vão de baixo, e (b) que segurar uma direção só NUNCA resolva
   sozinho — a mesma exigência do campo de raízes do Curupira. Sem o Dom
   Rajada nem nada: este trecho é o único jeito de atravessar a região, e
   por isso a solução nunca depende de nenhuma flag.

   A gride é editável à mão, um caractere por tile de 16x16:
     #  árvore/pedra (parede)   .  grama (chão)
     ,  mato alto (encontro)    o  pedra solta (obstáculo)
     V  corrente de vento (escorrega — ver world/tilemap.ts)             */
import type { DefMapa } from '../../world/tilemap.ts';

export const ventaniaFunda: DefMapa = {
  id: 'ventaniaFunda',
  nome: 'VENTANIA FUNDA',

  chao: [
    '#########..########',
    '#.................#',
    '#.................#',
    '#...o..,..........#',
    '#...............o.#',
    '#o...,.o..,...,...#',
    '#.,.........,.....#',
    '#.................#',
    '#.................#',
    '#########V#########',
    '###VVVVVVV#VVVVV###',
    '###VVVVVVVVVVVVV###',
    '###VVVVVV#VVVVVV###',
    '###VVVVVVVVVVVVV###',
    '###VVVVVVVVVVVVV###',
    '###VVVVV#VVVVVVV###',
    '###VVVVVVVV#VVVV###',
    '#########V#########',
    '#.................#',
    '#.....,.........o.#',
    '#............,....#',
    '#........,........#',
    '#...,..........,,.#',
    '#..,....,.........#',
    '#............,....#',
    '#.................#',
    '#########V#########',
    '###VVVVV#VVVVVVV###',
    '###VVVVVVVVVVVVV###',
    '###VVVVVVVVVVVVV###',
    '###VVVVVV#VVVVVV###',
    '####VVVVVVVVVVVV###',
    '###VVVVVVVVVVVVV###',
    '###VVVVVVV#VVVVV###',
    '#########V#########',
    '#.................#',
    '#............,....#',
    '#,..,,............#',
    '#.................#',
    '#o....,...........#',
    '#.............,...#',
    '#o.....,..........#',
    '#.................#',
    '#########..########',
  ],

  objetos: [
    { tipo: 'placa', tx: 12, ty: 1,
      placa: 'VENTANIA FUNDA. Quem pisa na corrente não para até bater em alguma coisa.' },
    { tipo: 'placa', tx: 5, ty: 20,
      placa: 'A primeira ventania ficou para trás. A segunda não é igual.' },

    /* acende sozinho: não há NPC nem treinador dentro da ventania — é a
       própria travessia que é o desafio. `conta_ventania` acende na
       primeira vez que se fala com esta placa, já perto da saída. */
    { tipo: 'placa', tx: 5, ty: 39, solido: false, placa: 'FIM DA VENTANIA',
      se: 'conta_ventania',
      falas: [{ linhas: [
        'O vento aqui já não puxa mais. Você atravessou a ventania funda.'] }] },
    { tipo: 'placa', tx: 5, ty: 39, solido: false, placa: 'FIM DA VENTANIA',
      seNao: 'conta_ventania',
      falas: [{ liga: 'conta_ventania', linhas: [
        'O vento aqui já não puxa mais — pela primeira vez desde a entrada.',
        'Você atravessou a ventania funda. A Aldeia Catavento fica logo à frente.'] }] },
  ],

  npcs: [],

  inicio: { tx: 9, ty: 1, dir: 'baixo' },

  saidas: [
    { tx: 9,  ty: 0,  para: 'campoAberto',    destino: { tx: 14, ty: 32, dir: 'cima' } },
    { tx: 10, ty: 0,  para: 'campoAberto',    destino: { tx: 15, ty: 32, dir: 'cima' } },
    { tx: 9,  ty: 43, para: 'aldeiaCatavento', destino: { tx: 16, ty: 1, dir: 'baixo' } },
    { tx: 10, ty: 43, para: 'aldeiaCatavento', destino: { tx: 17, ty: 1, dir: 'baixo' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 8,
  encontros: [
    { especie: 'sacizinho', min: 38, max: 41, peso: 40 },
    { especie: 'saci', min: 39, max: 42, peso: 30 },
    { especie: 'matinta', min: 40, max: 43, peso: 20 },
    { especie: 'cabritinha', min: 38, max: 41, peso: 10 },
  ],
};
