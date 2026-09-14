import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { emitCss } from './emit-css.ts';
import { emitDart } from './emit-dart.ts';

import type { DesignTokens } from './tokens.ts';

const SOURCE = new URL('../tokens.json', import.meta.url);
const OUTPUT_DIR = new URL('../dist/', import.meta.url);
const CSS_OUTPUT = new URL('../dist/tokens.css', import.meta.url);
const DART_OUTPUT = new URL('../dist/theme.dart', import.meta.url);

const tokens = JSON.parse(await readFile(SOURCE, 'utf8')) as DesignTokens;

// dist/ não é versionado: num checkout limpo o diretório ainda não existe.
await mkdir(OUTPUT_DIR, { recursive: true });

await Promise.all([
  writeFile(CSS_OUTPUT, emitCss(tokens), 'utf8'),
  writeFile(DART_OUTPUT, emitDart(tokens), 'utf8'),
]);

process.stdout.write('Tokens gerados: dist/tokens.css e dist/theme.dart\n');
