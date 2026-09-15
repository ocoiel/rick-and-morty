import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Dart só enxerga arquivos dentro do próprio pacote: o token gerado precisa ser
// copiado para lib/, não referenciado de node_modules.
const SOURCE = require.resolve('@zrp/design-tokens/theme.dart');
const TARGET = new URL('../lib/core/tokens.dart', import.meta.url);

await mkdir(new URL('../lib/core/', import.meta.url), { recursive: true });
await copyFile(SOURCE, TARGET);

process.stdout.write('Tokens sincronizados em lib/core/tokens.dart\n');
