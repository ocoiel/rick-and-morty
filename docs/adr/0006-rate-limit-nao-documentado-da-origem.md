# 6. Convivência com o rate limit não documentado da origem

Aceita — 2026-09-14

## Contexto

A documentação da API não menciona limite de requisições. Na prática ele
existe, e apareceu duas vezes.

Primeiro na máquina local: a tentativa inicial de pré-renderizar as 51
rotas falhou com HTTP 429, abortando a construção. O Next distribui a
geração estática entre vários processos, e cada um mantinha seu próprio
cliente HTTP sem coordenação — algo em torno de cem requisições
concorrentes.

Depois na integração contínua, de forma mais dura: o endereço de saída do
GitHub Actions é compartilhado entre muitos projetos e já chega
limitado. Mesmo com concorrência reduzida, a construção falhava de forma
imprevisível.

A segunda ocorrência é a mais grave. Uma publicação que só funciona
dependendo do humor de um serviço externo não é publicação confiável.

## Decisão

Separar **obter os dados** de **renderizar as páginas**.

Um passo de pré-construção busca o catálogo inteiro de uma vez, de forma
sequencial e cooperativa, e grava `lib/catalog-snapshot.json`:

- 3 requisições paginadas para os 51 episódios;
- 9 requisições em lote para os 826 personagens.

Doze requisições no total, com concorrência dois, contra as cerca de cem
concorrentes da abordagem anterior.

A renderização passa a consumir o `SnapshotGateway`, que implementa as
mesmas portas a partir desse arquivo. Nenhuma requisição parte durante a
geração das páginas.

O cliente HTTP mantém semáforo, espera exponencial e respeito ao
cabeçalho `Retry-After`, porque continua sendo o caminho usado pelo BFF e
pelo recuo quando não há catálogo.

O arquivo é versionado. O passo de pré-construção o regenera a cada
publicação; mantê-lo no repositório garante que verificação de tipos,
testes e construção funcionem sem rede.

## Consequências

A construção caiu de **55 para 4,5 segundos** e passou a ser
determinística: o mesmo commit produz o mesmo resultado, independente do
estado da origem.

A integração contínua deixou de depender da disponibilidade de um
serviço de terceiros para publicar.

O catálogo ocupa 260 KB versionados. É cache de construção, gerado por
integração real com a API, e não dado transcrito à mão.

O `SnapshotGateway` existe porque as portas já estavam definidas. Trocar a
origem dos dados custou uma classe e uma linha no composition root, sem
tocar em domínio, casos de uso ou componentes — ver
[ADR 1](0001-arquitetura-hexagonal-proporcional.md).

Como efeito secundário, as rotas dinâmicas remanescentes passaram a
responder do catálogo em memória, sem alcançar a origem.
