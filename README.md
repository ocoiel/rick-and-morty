# Elenco por Episódio — Rick and Morty

Informe o número de um episódio e veja todo o elenco em ordem alfabética.

Web em Next.js, app em Flutter e um BFF em Fastify, sobre o mesmo núcleo. Dados
da [Rick and Morty API](https://rickandmortyapi.com/documentation).

![Busca por episódio](docs/home.png)

| Elenco do episódio         | Detalhe do personagem        |
| -------------------------- | ---------------------------- |
| ![Elenco](docs/elenco.png) | ![Detalhe](docs/detalhe.png) |

### App iOS

https://github.com/user-attachments/assets/a28db08b-c0e3-4906-ae53-124be714b27d

## Como rodar

Node 22+ e pnpm 11+.

```bash
pnpm install
pnpm dev
```

Web em `http://localhost:3000`, BFF em `http://localhost:3333`.

Com Docker:

```bash
docker compose up --build
```

Nenhuma variável de ambiente é obrigatória — todas têm padrão funcional em
[`.env.example`](.env.example).

## Stack

Next.js 16.3 · React 19 · Flutter · Fastify 5 · TypeScript 7 · Zod 4 ·
TanStack Query 5 · Tailwind 4 · Vitest 4 · Playwright · oxlint · Turborepo · pnpm

## Mais

|                                    |                                                                 |
| ---------------------------------- | --------------------------------------------------------------- |
| [Arquitetura](docs/arquitetura.md) | Como o núcleo se separa dos adaptadores, e o que foi priorizado |
| [Decisões](docs/decisoes.md)       | Os dez ADRs, com contexto e consequências                       |
| [Testes](docs/testes.md)           | Três níveis, cobertura e o que cada um pegou                    |
| [API](docs/api.md)                 | Rotas do BFF, formato das respostas e códigos de erro           |
| [Comandos](docs/comandos.md)       | Todos os scripts do monorepo                                    |
