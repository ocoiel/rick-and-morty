export interface FontToken {
  readonly family: string;
  readonly fallbacks: readonly string[];
}

export type EasingToken = readonly [number, number, number, number];

export interface DesignTokens {
  readonly color: Readonly<Record<string, string>>;
  readonly font: Readonly<Record<string, FontToken>>;
  readonly radius: Readonly<Record<string, number>>;
  readonly easing: Readonly<Record<string, EasingToken>>;
}

export const GENERATED_HEADER = 'Gerado por @zrp/design-tokens a partir de tokens.json.';
