# Decisões

[← README](../README.md)

Cada uma registrada com contexto e consequências em [`docs/adr`](adr).

|                                                         | Decisão                                                                       |
| ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [1](adr/0001-arquitetura-hexagonal-proporcional.md)     | Arquitetura hexagonal proporcional — e o que foi deixado de fora de propósito |
| [2](adr/0002-geracao-estatica-das-rotas-de-episodio.md) | Geração estática das 51 rotas                                                 |
| [3](adr/0003-dois-adaptadores-de-entrada.md)            | Dois adaptadores sobre o mesmo núcleo                                         |
| [4](adr/0004-ordenacao-como-regra-de-dominio.md)        | Ordenação como regra de domínio                                               |
| [5](adr/0005-sem-banco-de-dados.md)                     | Ausência de banco de dados                                                    |
| [6](adr/0006-rate-limit-nao-documentado-da-origem.md)   | Convivência com o rate limit da origem                                        |
| [7](adr/0007-status-404-com-cache-components.md)        | 404 real com Cache Components                                                 |
| [8](adr/0008-escopo-restrito-do-tanstack-query.md)      | Escopo restrito do TanStack Query                                             |
| [9](adr/0009-escolha-do-framework-http.md)              | Escolha do framework HTTP                                                     |
| [10](adr/0010-testes-em-tres-niveis.md)                 | Testes em três níveis                                                         |

### Três pontos que merecem destaque

**A ordenação usa `Intl.Collator`, não `sort()`.** O conjunto de dados contém
nomes acentuados — "Ábradolf Lincler" entre eles. Comparação por ponto de
código os lançaria depois do "Z". Empates são resolvidos pelo identificador,
para que a saída seja determinística entre construções.

**A origem tem limite de requisições não documentado.** A primeira tentativa de
gerar as 51 páginas falhou com HTTP 429, e na integração contínua o problema era
pior, porque o endereço de saída é compartilhado. Resolvido separando obter
dados de renderizar páginas: doze requisições em lote antes da construção, e
nenhuma durante. A construção caiu de 55 para 4,5 segundos e ficou
determinística.

**`notFound()` não devolvia 404.** Com Cache Components, o invólucro estático
parte antes do conteúdo transmitido, então `/episode/999` respondia 200 com a
tela de erro. Um proxy valida o número contra o catálogo antes de qualquer
renderização.
