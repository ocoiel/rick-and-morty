# Rick and Morty — elenco por episódio

Digite o número de um episódio e veja todo o elenco em ordem alfabética, com o
detalhe de cada personagem e em quais outros episódios ele aparece.

Os dados vêm da [Rick and Morty API](https://rickandmortyapi.com) pública.

![Home](docs/home.png)

| Elenco do episódio         | Detalhe do personagem        |
| -------------------------- | ---------------------------- |
| ![Elenco](docs/elenco.png) | ![Detalhe](docs/detalhe.png) |

## Como rodar

Requer **Node 22.14+** e **pnpm 11**.

```bash
pnpm install
pnpm dev
```

- Web: http://localhost:3000
- BFF: http://localhost:3333 (`/health`, `/api/episodes`, `/api/episodes/:id/cast`)

Nenhuma variável de ambiente é obrigatória. Para customizar, copie
`apps/web/.env.example` para `apps/web/.env.local` e `apps/bff/.env.example`
para `apps/bff/.env`.

## Verificação

Um comando roda lint, typecheck, testes unitários, build e end-to-end:

```bash
pnpm verify
```

Na primeira execução, instale os navegadores do Playwright:

```bash
pnpm --filter @zrp/web exec playwright install chromium
```

## Estrutura

```
apps/web      Next.js 16 — interface e rotas de API
apps/bff      Fastify — API HTTP independente
packages/core Domínio, casos de uso e gateway da origem (sem framework)
```

`packages/core` concentra as regras e não conhece Next nem Fastify: as duas
aplicações montam o mesmo container de casos de uso e apenas expõem o resultado.
