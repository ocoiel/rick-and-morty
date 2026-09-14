# 10. Testes em três níveis

Aceita — 2026-09-14

## Contexto

Cobertura alta em testes unitários não demonstra que a aplicação funciona.
Foi necessário decidir o que cada nível de teste deve provar, para que não
se sobreponham nem deixem lacunas.

## Decisão

**Unitário, no núcleo.** Casos de uso exercitados contra dublês das
portas, sem rede. É o retorno do investimento em arquitetura hexagonal:
87 casos em cerca de um segundo. Um teste afirma explicitamente a
divergência em relação à ordenação por ponto de código, de modo que a
regressão para `sort()` cru quebra a suíte.

**De integração, no adaptador.** Rotas verificadas com `inject()`, sem
porta: status, cabeçalhos, serialização e tradução de erro de domínio.

**De componente, no front.** Consultas por papel e rótulo acessível, e
não por classe CSS, para que regressões de acessibilidade também falhem.

**Ponta a ponta, no navegador.** Fluxos reais em dois perfis, desktop e
mobile. Inclui o auxiliar `instant()` do Next 16.3, que afirma que a troca
de episódio pinta a tela sem esperar a rede — regressão de desempenho
vira teste vermelho.

## Consequências

O nível ponta a ponta provou seu valor ao revelar um defeito que os
demais não alcançavam: o painel de detalhe permanecia em carregamento
indefinido apesar de a API responder 200. O componente era montado de
forma permanente com personagem nulo e consulta desabilitada; ao
selecionar alguém, chave e `enabled` mudavam juntos e o observador não
reagia. Todos os testes unitários passavam, porque exercitavam apenas o
estado já montado.

A correção foi montar o painel somente quando há personagem selecionado.

A suíte ponta a ponta executa em um único processo. Ela depende da API
pública, sujeita a limite de requisições, e processos concorrentes
disputavam a mesma cota. Ver [ADR 6](0006-rate-limit-nao-documentado-da-origem.md).

Cobertura atual: 99% no núcleo, 100% no BFF, 100% de linhas no front.
