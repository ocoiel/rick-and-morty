import { GENERATED_HEADER } from './tokens.ts';

import type { DesignTokens } from './tokens.ts';

/** Palavras que não podem virar identificador em Dart; recebem sufixo. */
const DART_RESERVED = new Set([
  'class',
  'const',
  'default',
  'enum',
  'extends',
  'false',
  'final',
  'in',
  'is',
  'new',
  'null',
  'super',
  'switch',
  'this',
  'true',
  'var',
  'void',
]);

export function toDartIdentifier(tokenName: string, reservedSuffix: string): string {
  const [head = '', ...rest] = tokenName.split('-');
  const camel = head + rest.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');

  return DART_RESERVED.has(camel) ? camel + reservedSuffix : camel;
}

function toArgb(hex: string): string {
  return `0xFF${hex.replace('#', '').toUpperCase()}`;
}

/** Dart aceita literal inteiro onde espera double, mas o sufixo deixa o tipo explícito. */
function toDartDouble(value: number): string {
  return Number.isInteger(value) ? value.toFixed(1) : String(value);
}

function block(name: string, doc: string, members: readonly string[]): string {
  return [`/// ${doc}`, `abstract final class ${name} {`, ...members, '}'].join('\n');
}

export function emitDart(tokens: DesignTokens): string {
  const colors = Object.entries(tokens.color).map(
    ([name, hex]) =>
      `  static const Color ${toDartIdentifier(name, 'Color')} = Color(${toArgb(hex)});`,
  );

  const fonts = Object.entries(tokens.font).map(
    ([name, font]) => `  static const String ${toDartIdentifier(name, 'Font')} = '${font.family}';`,
  );

  const radii = Object.entries(tokens.radius).map(
    ([name, px]) =>
      `  static const double ${toDartIdentifier(name, 'Radius')} = ${toDartDouble(px)};`,
  );

  const curves = Object.entries(tokens.easing).map(
    ([name, curve]) =>
      `  static const Cubic ${toDartIdentifier(name, 'Curve')} = Cubic(${curve.map((value) => toDartDouble(value)).join(', ')});`,
  );

  return [
    `// ${GENERATED_HEADER} Não edite à mão.`,
    '',
    "import 'package:flutter/material.dart';",
    '',
    block('AppColors', 'Paleta compartilhada com a web.', colors),
    '',
    block('AppFonts', 'Famílias tipográficas.', fonts),
    '',
    block('AppRadius', 'Raios de canto, em pixels lógicos.', radii),
    '',
    block('AppMotion', 'Curvas de animação.', curves),
    '',
  ].join('\n');
}
