# Testes

[← README](../README.md)

```bash
pnpm test        # unitários e de integração
pnpm test:e2e    # ponta a ponta
```

| Camada        | Casos         | Cobertura      |
| ------------- | ------------- | -------------- |
| Núcleo        | 97            | 99%            |
| BFF           | 38            | 100%           |
| Front         | 60            | 100% de linhas |
| Ponta a ponta | 13 × 2 perfis | —              |

Os cenários de ponta a ponta usam o auxiliar `instant()` do Next 16.3, que
afirma que a troca de episódio pinta a tela **sem esperar a rede**. Regressão de
desempenho falha a suíte.

Foi esse nível que revelou um defeito real no painel de detalhe, invisível para
os testes unitários — descrito no
[ADR 10](adr/0010-testes-em-tres-niveis.md).

## Relatórios

O `pnpm test` imprime a tabela de cobertura no terminal e, junto dela, gera um
relatório navegável por pacote:

```
apps/web/coverage/index.html
apps/bff/coverage/index.html
packages/core/coverage/index.html
```

Os cenários de ponta a ponta não gravam nada por padrão — o custo por cenário
não se paga no dia a dia. Para gerar evidência do fluxo:

```bash
pnpm --filter @zrp/web test:e2e:record   # vídeo, trace e captura de cada cenário
pnpm --filter @zrp/web test:e2e:report   # abre o relatório no navegador
```

Isso produz um vídeo por cenário em
`apps/web/test-results/<cenário>/video.webm` e o relatório em
`apps/web/playwright-report/`. Os dois diretórios são ignorados pelo git.

Para assistir um cenário específico rodando, sem gravar:

```bash
pnpm --filter @zrp/web exec playwright test --headed --project=chromium
pnpm --filter @zrp/web exec playwright test --ui          # modo interativo
```
