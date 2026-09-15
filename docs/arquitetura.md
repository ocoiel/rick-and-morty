# Arquitetura

[← README](../README.md)

## O que foi priorizado

Desempenho era o requisito central, então a primeira coisa foi investigar a
origem antes de escrever código. Três descobertas moldaram o resto:

| Descoberta                                              | Consequência                                         |
| ------------------------------------------------------- | ---------------------------------------------------- |
| O catálogo é finito: 51 episódios, 826 personagens      | As páginas podem ser geradas na construção           |
| A origem declara `cache-control: immutable` por 90 dias | O cache pode ser agressivo, com respaldo do contrato |
| `/character/1,2,3` aceita lote                          | Nenhuma consulta em N+1                              |

O episódio mais populoso da série tem **65 personagens**. Sem lote, seriam 65
requisições para montar uma única tela.

### Resultados medidos

| Operação                         | Tempo        |
| -------------------------------- | ------------ |
| Página de episódio (estática)    | **3 a 5 ms** |
| Resposta vinda da origem         | 260 ms       |
| Resposta vinda do cache          | **1,2 ms**   |
| 404 de episódio inexistente      | 3 ms         |
| Construção completa (55 páginas) | 55 s         |

Medições locais com `next start`. A construção não faz requisição alguma: o
catálogo é obtido uma vez, antes dela — ver
[ADR 6](adr/0006-rate-limit-nao-documentado-da-origem.md).

---

## Arquitetura

O núcleo não conhece framework algum. Dois adaptadores de entrada o consomem.

```
                    ┌──────────────────────────────┐
   Navegador ─────► │  apps/web — Next.js 16.3     │
                    │  51 rotas estáticas          │
                    └───────────────┬──────────────┘
                                    │
                                    ├──────────────┐
                                    ▼              │
                    ┌──────────────────────────────┴───┐
                    │  packages/core                   │
                    │                                  │
                    │  domain/       Cast, ordenação   │
                    │  application/  casos de uso      │
                    │      ports/    EpisodeGateway    │
                    │                CharacterGateway  │
                    │                CacheStore        │
                    │  infrastructure/  adaptadores    │
                    └──────────────────▲───────────────┘
                                       │
                    ┌──────────────────┴───────────┐
   Outros    ─────► │  apps/bff — Fastify          │
   clientes         │  mesmo caso de uso, por HTTP │
                    └──────────────────────────────┘
```

As dependências apontam para dentro. `domain/` não importa nada — nem
biblioteca externa. `application/` conhece `domain/`, mas não conhece HTTP,
Next, Fastify ou a API de origem.

O mesmo `GetEpisodeCastUseCase` roda sob os dois adaptadores. É o que torna a
separação verificável em vez de apenas declarada.

### Onde mora cada decisão

```
packages/core/src/
├── domain/                     regras que independem de tecnologia
│   ├── episode-cast.ts           agregado: ordenação alfabética
│   ├── episode-number.ts         objeto de valor: validação
│   └── errors.ts                 erros sem noção de HTTP
├── application/
│   ├── ports/                    contratos de saída
│   └── use-cases/                orquestração
├── infrastructure/
│   ├── http/                     cliente da origem, semáforo, contratos
│   └── cache/                    memória e no-op
└── composition-root.ts         único ponto que monta as dependências
```
