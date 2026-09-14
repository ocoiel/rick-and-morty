import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { emitCss } from '../src/emit-css.ts';
import { emitDart, toDartIdentifier } from '../src/emit-dart.ts';

import type { DesignTokens } from '../src/tokens.ts';

const SOURCE = new URL('../tokens.json', import.meta.url);

const sample: DesignTokens = {
  color: { void: '#07090c', 'surface-raised': '#151c24' },
  font: { display: { family: 'Space Grotesk', fallbacks: ['system-ui', 'sans-serif'] } },
  radius: { card: 14 },
  easing: { 'out-quint': [0.22, 1, 0.36, 1] },
};

async function loadTokens(): Promise<DesignTokens> {
  return JSON.parse(await readFile(SOURCE, 'utf8')) as DesignTokens;
}

describe('emitCss', () => {
  it('escreve cada token como custom property dentro do @theme', () => {
    const css = emitCss(sample);

    expect(css).toContain('@theme {');
    expect(css).toContain('--color-void: #07090c;');
    expect(css).toContain('--color-surface-raised: #151c24;');
    expect(css).toContain("--font-display: 'Space Grotesk', system-ui, sans-serif;");
    expect(css).toContain('--radius-card: 14px;');
    expect(css).toContain('--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);');
  });
});

describe('emitDart', () => {
  it('converte hex para o inteiro ARGB que o Flutter espera', () => {
    expect(emitDart(sample)).toContain('Color(0xFF07090C)');
  });

  it('usa camelCase nos nomes compostos', () => {
    expect(emitDart(sample)).toContain('surfaceRaised');
  });

  it('desvia de palavras reservadas do Dart', () => {
    expect(toDartIdentifier('void', 'Color')).toBe('voidColor');
    expect(toDartIdentifier('surface', 'Color')).toBe('surface');
  });

  it('tipa números como double, não como inteiro', () => {
    const dart = emitDart(sample);

    expect(dart).toContain('static const double card = 14.0;');
    expect(dart).toContain('Cubic(0.22, 1.0, 0.36, 1.0)');
  });
});

describe('tokens.json de verdade', () => {
  it('chega na web com todas as cores declaradas', async () => {
    const tokens = await loadTokens();
    const css = emitCss(tokens);

    for (const name of Object.keys(tokens.color)) {
      expect(css).toContain(`--color-${name}:`);
    }
  });

  it('chega no Flutter com todas as cores declaradas', async () => {
    const tokens = await loadTokens();
    const dart = emitDart(tokens);

    for (const hex of Object.values(tokens.color)) {
      expect(dart).toContain(`0xFF${hex.replace('#', '').toUpperCase()}`);
    }
  });
});
