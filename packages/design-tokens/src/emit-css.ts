import { GENERATED_HEADER } from './tokens.ts';

import type { DesignTokens } from './tokens.ts';

function fontValue({ family, fallbacks }: DesignTokens['font'][string]): string {
  return [`'${family}'`, ...fallbacks].join(', ');
}

export function emitCss(tokens: DesignTokens): string {
  const lines = [
    ...Object.entries(tokens.color).map(([name, hex]) => `  --color-${name}: ${hex};`),
    '',
    ...Object.entries(tokens.font).map(([name, font]) => `  --font-${name}: ${fontValue(font)};`),
    '',
    ...Object.entries(tokens.radius).map(([name, px]) => `  --radius-${name}: ${px}px;`),
    '',
    ...Object.entries(tokens.easing).map(
      ([name, curve]) => `  --ease-${name}: cubic-bezier(${curve.join(', ')});`,
    ),
  ];

  return `/* ${GENERATED_HEADER} Não edite à mão. */\n\n@theme {\n${lines.join('\n')}\n}\n`;
}
