# 4. Ordenação alfabética como regra de domínio

Aceita — 2026-09-14

## Contexto

A ordenação alfabética é o requisito funcional central. Tratá-la como
detalhe de apresentação permitiria que um adaptador esquecesse de
ordenar.

Além disso, `Array.prototype.sort` sem comparador ordena por ponto de
código. O conjunto de dados contém nomes acentuados — "Ábradolf Lincler"
entre eles — que seriam lançados após o "Z".

## Decisão

A ordenação vive no agregado `EpisodeCast`. O construtor é privado e a
única via de criação é `assemble`, que já devolve o elenco ordenado.

A comparação usa `Intl.Collator` com `sensitivity: 'base'` e
`numeric: true`, instanciado uma vez por processo. Empates de nome são
resolvidos pelo identificador.

## Consequências

Nenhum adaptador consegue produzir um elenco desordenado.

"Ábradolf Lincler" ordena junto de nomes iniciados por A, e "Rick 2"
precede "Rick 10".

O desempate por identificador torna a saída determinística, condição
necessária para que páginas geradas estaticamente sejam comparáveis entre
execuções.

Um teste afirma explicitamente a divergência em relação à ordenação por
ponto de código, de modo que a regressão para `sort()` cru quebra a suíte.
