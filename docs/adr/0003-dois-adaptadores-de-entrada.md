# 3. Dois adaptadores de entrada sobre o mesmo núcleo

Aceita — 2026-09-14

## Contexto

O enunciado traz requisitos que, lidos isoladamente, conflitam: publicar
na Vercel usando Next.js; ter back-end dockerizado; e manter monorepo com
front e back que suba de forma simples.

Um back-end Fastify separado, consumido por HTTP pelo front, atenderia à
dockerização mas acrescentaria um salto de rede em produção e
complicaria a publicação.

## Decisão

Manter o núcleo em `packages/core`, sem framework, e expô-lo por dois
adaptadores de entrada:

- `apps/web` — Next.js, consome o núcleo em processo, sem salto de rede.
- `apps/bff` — Fastify, expõe o mesmo caso de uso por HTTP, dockerizado.

Nenhum dos dois contém regra de negócio. Ambos traduzem protocolo.

## Consequências

Todos os requisitos do enunciado são atendidos sem que nenhum seja
degradado.

O mesmo `GetEpisodeCastUseCase` rodando sob dois drivers é a demonstração
concreta da arquitetura hexagonal. Sem isso, "portas e adaptadores" seria
vocabulário sem evidência.

Há duplicação na tradução de erro de domínio para status HTTP, uma vez em
cada adaptador. É duplicação aceita: a política de status é decisão de
protocolo, e cada adaptador deve poder divergir.
