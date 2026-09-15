# Comandos

[← README](../README.md)

| Comando          | Efeito                             |
| ---------------- | ---------------------------------- |
| `pnpm dev`       | Sobe front e BFF                   |
| `pnpm build`     | Constrói tudo                      |
| `pnpm test`      | Testes unitários e de integração   |
| `pnpm test:e2e`  | Cenários ponta a ponta             |
| `pnpm lint`      | oxlint nos três pacotes            |
| `pnpm typecheck` | Verificação de tipos               |
| `pnpm format`    | Prettier                           |
| `pnpm docker:up` | Sobe os dois serviços em contêiner |

Variáveis de ambiente em [`.env.example`](../.env.example). Todas têm valor padrão
funcional; nenhuma é obrigatória.

### Avatares

Os 826 avatares ficam versionados em `apps/web/public/avatars`, em WebP de
320px. A API limita requisições por IP no Cloudflare, e buscá-los em execução
fazia o grid ficar cheio de buracos ao navegar entre episódios.

Não são regenerados no build. Só se a série ganhar episódios novos:

```bash
pnpm --filter @zrp/web avatars
```

O script pula o que já está em disco e busca o resto no repositório da própria
API, que publica as mesmas imagens sob BSD-3.
