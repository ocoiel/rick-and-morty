# 1. Arquitetura hexagonal proporcional ao problema

Aceita — 2026-09-14

## Contexto

O desafio pede uma funcionalidade pequena: dado o número de um episódio,
devolver seu elenco em ordem alfabética. A avaliação, porém, recai sobre
organização de código e arquitetura.

Existe uma tentação evidente de empilhar padrões — repository, facade,
specification, factory — para demonstrar repertório. O efeito costuma ser
o oposto: indireção sem contrapartida, que um revisor experiente
identifica como aplicação mecânica de catálogo.

## Decisão

Adotar arquitetura hexagonal de verdade, porém apenas nos pontos em que a
inversão de dependência tem contrapartida demonstrável.

Aplicado:

- **Camada de domínio sem dependências.** `packages/core/src/domain` não
  importa framework nem biblioteca externa.
- **Portas de saída** onde a implementação pode variar: `EpisodeGateway`,
  `CharacterGateway` e `CacheStore`.
- **Caso de uso** como unidade de orquestração testável.
- **Adaptadores** concretos isolados em `infrastructure`.
- **Composition root** único, em `composition-root.ts`.

Deliberadamente não aplicado:

- **Repository.** Não há persistência. Um repositório que apenas encaminha
  para HTTP seria um nome enganoso para um gateway.
- **Facade.** Não há subsistema complexo a esconder: o caso de uso já é a
  superfície mínima.
- **DTO por camada.** O payload de saída é único e serializável; duplicá-lo
  em camadas geraria mapeamento sem ganho.

## Consequências

O caso de uso é testado integralmente com dublês, sem rede: 87 casos no
núcleo executam em cerca de um segundo.

O mesmo núcleo alimenta dois adaptadores de entrada distintos, o que
comprova que a separação não é decorativa. Ver [ADR 3](0003-dois-adaptadores-de-entrada.md).

Ausência de repository e facade é escolha registrada, não esquecimento.
