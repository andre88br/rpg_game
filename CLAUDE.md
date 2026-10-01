# Encantados — regras para o Claude

## Publicar o site (deploy) — autorizado, sem perguntar

O site em https://andre88br.github.io/rpg_game/ é gerado pelo workflow
`.github/workflows/pages.yml` a cada push no branch
`claude/pokemon-style-game-design-skz67b`. O dono do repositório autorizou
publicar **sem pedir confirmação**, sempre que houver mudança no jogo pronta:

1. `npm test` e `npm run build` precisam estar verdes. Se não estiverem, não
   publique: conserte ou avise.
2. Commit e push no branch de trabalho da sessão.
3. `git fetch origin claude/pokemon-style-game-design-skz67b` e confira
   `git merge-base --is-ancestor origin/claude/pokemon-style-game-design-skz67b HEAD`.
   Se o branch do site tiver commits novos, mescle-os primeiro no branch de
   trabalho (merge, nunca rebase de história publicada).
4. `git push origin HEAD:claude/pokemon-style-game-design-skz67b` — nunca
   com `--force`.
5. Espere o site servir o `principal-*.js` novo (o mesmo nome do `dist/`) e
   avise que está no ar.

## Convenções do projeto

- Português em nomes, comentários e textos do jogo.
- `npm test` roda os testes (node:test, sem DOM); `npm run build` = tsc + vite.
- Arte toda desenhada por código (`src/art/`); mapas são grades de letras em
  `src/data/mapas/`, registrados em `index.ts` e numa região de `src/data/mundo.ts`.
- Mudança de mecânica ou de região atualiza o README e o MANUAL; mudança na
  estrutura do código atualiza o ARQUITETURA.md.
