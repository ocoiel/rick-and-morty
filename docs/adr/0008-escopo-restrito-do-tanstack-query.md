# 8. Escopo restrito do TanStack Query

Aceita — 2026-09-14

## Contexto

Havia intenção inicial de usar TanStack Query como camada de cache do
cliente, motivada por leitura rápida e controle fino de invalidação.

O Next 16.3 resolve o mesmo problema para dados de rota, e por outro
caminho: pré-busca um invólucro reutilizável por rota, mantém-no em cache
na sessão e serve conteúdo marcado com `'use cache'` de imediato.

Usar as duas coisas para o mesmo dado produziria dois caches
concorrentes, duas buscas do mesmo conteúdo e uma hidratação
desnecessária — resultado pior do que qualquer uma das abordagens
isoladamente.

## Decisão

Dados de rota pertencem ao servidor. O elenco do episódio é renderizado
em componente de servidor, já ordenado, e chega pronto no HTML.

O TanStack Query cobre exclusivamente a única interação que de fato busca
dados no cliente: as aparições do personagem, exibidas no painel de
detalhe. Esses dados não estão no payload do elenco e só fazem sentido
sob demanda.

Aproveita-se então o que a biblioteca tem de melhor: `prefetchQuery`
disparado ao passar o ponteiro ou focar o cartão, de modo que o painel
costuma abrir com os dados já em memória.

O filtro do elenco não usa a biblioteca. A lista já está no cliente; é
filtragem local, com `useDeferredValue` para não disputar com a digitação.

## Consequências

Cada camada tem uma responsabilidade única, sem sobreposição de cache.

Menos JavaScript enviado: o elenco não é serializado duas vezes, uma no
HTML e outra no estado do cliente.

A configuração do cliente reflete a natureza do dado — `staleTime`
infinito e sem revalidação ao recuperar foco — porque a origem declara o
conteúdo imutável.

Foi a montagem desse painel que revelou um defeito real, descrito no
[ADR 10](0010-testes-em-tres-niveis.md).
