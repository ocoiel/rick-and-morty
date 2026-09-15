# rick_and_morty

Elenco por episódio de Rick and Morty

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Learn Flutter](https://docs.flutter.dev/get-started/learn-flutter)
- [Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Flutter learning resources](https://docs.flutter.dev/reference/learning-resources)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

## Comandos

Rode pelo turbo, da raiz do repositório, para que as dependências de workspace
sejam construídas antes:

| Comando                             | O que faz                                                          |
| ----------------------------------- | ------------------------------------------------------------------ |
| `pnpm --filter @zrp/mobile dev`     | Sobe o app no Chrome (o BFF precisa estar em :3333)                |
| `pnpm --filter @zrp/mobile lint`    | `flutter analyze` — em Dart, o analisador é o verificador de tipos |
| `pnpm --filter @zrp/mobile test`    | `flutter test --coverage`                                          |
| `pnpm --filter @zrp/mobile codegen` | Regera o cliente a partir de `apps/bff/openapi.json`               |

Não há script de `typecheck`: `flutter analyze` já reprova até avisos de nível
info, então um `dart analyze --fatal-infos` separado seria a mesma checagem
rodando duas vezes.

Para apontar o app a outro host, por exemplo um iPhone na mesma rede:

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.0.10:3333
```
