# 5. Ausência de banco de dados

Aceita — 2026-09-14

## Contexto

Desempenho é o requisito principal, e a reação instintiva costuma ser
introduzir um armazenamento próprio: Postgres para espelhar o catálogo,
ou Redis como cache compartilhado.

Os dados em questão são 51 episódios e 826 personagens, públicos,
imutáveis e servidos por CDN com `max-age` de noventa dias.

## Decisão

Não utilizar banco de dados nem cache externo. A estratégia de leitura
tem três camadas, todas sem infraestrutura adicional:

1. **Construção.** As 51 páginas são pré-renderizadas; em produção a
   leitura não chega ao servidor. Ver [ADR 2](0002-geracao-estatica-das-rotas-de-episodio.md).
2. **Processo.** `InMemoryCacheStore`, com TTL de 24 horas e despejo por
   uso menos recente, atende as rotas dinâmicas remanescentes.
3. **Borda.** Respostas anunciam `public, max-age=86400,
stale-while-revalidate=86400`.

A porta `CacheStore` isola essa escolha: trocar por Redis significa
escrever uma classe de dois métodos e registrá-la no composition root.

## Consequências

Nenhum serviço a provisionar, migrar, versionar ou monitorar. O
`docker compose up` sobe apenas os dois serviços da aplicação.

Espelhar em banco dados que a origem declara imutáveis criaria um
problema de sincronização onde não havia nenhum.

O cache de processo não é compartilhado entre instâncias. Como a maior
parte do tráfego nunca alcança o servidor, o impacto é marginal; se
deixasse de ser, o substituto natural seria o cache de runtime da
plataforma, e não um Redis dedicado.

Medição local: 260 ms quando a resposta vem da origem, 1,2 ms quando vem
do cache de processo, 3 a 5 ms quando a página é estática.
