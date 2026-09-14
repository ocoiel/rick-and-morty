# 9. Escolha do framework HTTP do BFF

Aceita — 2026-09-14

## Contexto

O adaptador de entrada HTTP precisa de roteamento, tratamento de erro,
cabeçalhos de segurança e desligamento gracioso. Foram considerados
Fastify, Hono, Elysia, Bun e o módulo `node:http` sem intermediários.

Convém registrar antes de tudo: esta é a decisão de menor alcance do
projeto, precisamente porque o núcleo não depende dela.

## Decisão

Fastify, pelos seguintes motivos:

- **`app.inject()`.** É a razão técnica determinante. Os 26 casos do BFF
  exercitam rotas, status, cabeçalhos e serialização sem abrir porta nem
  socket, e concluem em cerca de 600 ms.
- **Ubiquidade.** É o padrão de fato em equipes Node, o que reduz atrito
  de leitura para quem revisa.
- **Plugins com contrato estável** para cabeçalhos de segurança e CORS.

Alternativas, e por que não:

- **Hono** seria escolha igualmente defensável, e superior sob o critério
  de portabilidade de runtime, por ser construído sobre Web Standards.
  Não foi preterido por ser pior, e sim porque `inject()` e familiaridade
  pesaram mais neste contexto.
- **Elysia** é orientado a Bun; adotá-lo deslocaria a decisão de framework
  para decisão de runtime.
- **Bun** traria ganho de inicialização ao custo de mais uma variável em
  Docker e integração contínua, sem retorno proporcional em 24 horas.
- **`node:http` puro** resolveria três rotas em cerca de 80 linhas sem
  dependência alguma, mas implicaria reescrever roteamento, tratamento de
  erro e desligamento gracioso — infraestrutura já resolvida.

## Consequências

O acoplamento ao Fastify está contido em **três arquivos e 119 linhas**.
O núcleo não possui nenhuma referência a ele.

Substituir por Hono significa reescrever esses três arquivos. Os 87 casos
do núcleo e a totalidade dos casos de uso permanecem intactos.

A decisão foi tomada de forma que seu custo de reversão fosse baixo, e
isso é deliberado: a arquitetura deve tornar a escolha de framework
pouco importante.
