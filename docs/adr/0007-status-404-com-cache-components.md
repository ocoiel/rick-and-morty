# 7. Emissão de 404 real com Cache Components

Aceita — 2026-09-14

## Contexto

Com `cacheComponents` habilitado, a rota de episódio envia primeiro um
invólucro estático e transmite o conteúdo dinâmico em seguida. Quando o
conteúdo chama `notFound()`, o status já partiu.

O efeito observado: `/episode/999` exibia corretamente a tela de erro,
porém com **HTTP 200**. É um 404 falso — indexável, e indistinguível de
sucesso para qualquer cliente que leia o status.

Duas saídas foram descartadas:

- `export const dynamicParams = false` é incompatível com
  `cacheComponents`; a construção falha explicitamente.
- `export const instant = false` corrigiria o status ao tornar a
  navegação bloqueante, mas anularia o principal ganho do projeto.

## Decisão

Validar o número do episódio antes que qualquer renderização comece.

Um script de pré-construção consulta a origem e grava
`lib/episode-catalog.ts` com o total de episódios. O `proxy.ts` compara o
parâmetro com esse catálogo e, quando não corresponde, reescreve para uma
rota cuja única responsabilidade é chamar `notFound()`.

O catálogo é versionado, com valor de reserva, de modo que verificação de
tipos e construção funcionem sem rede.

## Consequências

`/episode/999`, `/episode/abc`, `/episode/0`, `/episode/1.5` e
`/episode/007` retornam **404 real em cerca de 3 ms**, com a tela de erro
correta.

As rotas válidas seguem estáticas e instantâneas; a validação acontece
antes delas e não as atinge.

Episódios novos exigem nova construção para entrar no catálogo — a mesma
dependência já assumida no [ADR 2](0002-geracao-estatica-das-rotas-de-episodio.md).

A página continua chamando `notFound()` como segunda linha de defesa,
caso o proxy seja contornado.
