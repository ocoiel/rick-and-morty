# 2. Geração estática das 51 rotas de episódio

Aceita — 2026-09-14

## Contexto

Desempenho é requisito central. A abordagem usual seria renderizar sob
demanda com uma camada de cache.

A investigação da origem revelou três fatos que mudam a estratégia:

1. O catálogo é **finito e conhecido**: 51 episódios, 826 personagens.
2. A origem declara os dados **imutáveis**:
   `cache-control: public, max-age=7776000, immutable`.
3. `/character/1,2,3` aceita lote, eliminando o problema N+1.

Um conjunto finito de dados imutáveis não precisa ser computado a cada
requisição.

## Decisão

Pré-renderizar as 51 rotas em tempo de construção, via
`generateStaticParams`, com `cacheComponents` e `partialPrefetching`
habilitados no Next 16.3.

As funções de acesso a dados são marcadas com `'use cache'` e
`cacheLife('max')`.

## Consequências

Em produção as páginas são servidas sem executar função alguma. Medição
local com `next start`: **3 a 5 ms** por página, contra 260 ms quando a
resposta vem da origem.

A integração com a API continua real; ela acontece durante a construção.

Episódios novos exigem nova construção. Para uma série encerrada isso é
irrelevante; num catálogo vivo, o gatilho seria revalidação por webhook.

A construção passou a depender da origem, o que trouxe o problema tratado
no [ADR 6](0006-rate-limit-nao-documentado-da-origem.md).
