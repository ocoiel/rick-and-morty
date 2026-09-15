# Testes

[← README](../README.md)

```bash
pnpm test        # unitários e de integração
pnpm test:e2e    # ponta a ponta
```

| Camada        | Casos         | Cobertura      |
| ------------- | ------------- | -------------- |
| Núcleo        | 87            | 99%            |
| BFF           | 26            | 100%           |
| Front         | 57            | 100% de linhas |
| Ponta a ponta | 13 × 2 perfis | —              |

Os cenários de ponta a ponta usam o auxiliar `instant()` do Next 16.3, que
afirma que a troca de episódio pinta a tela **sem esperar a rede**. Regressão de
desempenho falha a suíte.

Foi esse nível que revelou um defeito real no painel de detalhe, invisível para
os testes unitários — descrito no
[ADR 10](adr/0010-testes-em-tres-niveis.md).
