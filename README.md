# Elenco por Episódio - Rick and Morty

Simples assim, você informa um número de um episódio e veja todo o elenco em ordem alfabética!

Web em Next.js, Mobile em Flutter e um BFF em Fastify, sobre o mesmo núcleo construído em _arquitetura limpa_. Dados
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

---

## Cobertura de testes unitários

### Core

<img width="961" height="396" alt="file-1002477c16cd0b8b7ea8ae45d41682c7" src="https://github.com/user-attachments/assets/41cf88c8-9090-404a-8297-444f194e668c" />

### Web

<img width="961" height="390" alt="file-0d76406b177f4376f4a191db4663a9bb" src="https://github.com/user-attachments/assets/5720e877-de03-4a9c-817d-a38588fc4e5c" />

---

## Mais

|                                    |                                                                 |
| ---------------------------------- | --------------------------------------------------------------- |
| [Arquitetura](docs/arquitetura.md) | Como o núcleo se separa dos adaptadores, e o que foi priorizado |
| [Decisões](docs/decisoes.md)       | Os dez ADRs, com contexto e consequências                       |
| [Testes](docs/testes.md)           | Três níveis, cobertura e o que cada um pegou                    |
| [API](docs/api.md)                 | Rotas do BFF, formato das respostas e códigos de erro           |
| [Comandos](docs/comandos.md)       | Todos os scripts do monorepo                                    |
