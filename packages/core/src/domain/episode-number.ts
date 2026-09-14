import { InvalidEpisodeNumberError } from './errors.js';

/**
 * Value Object que representa o número de um episódio.
 *
 * Existe para que a validação aconteça uma única vez, na fronteira do domínio.
 * Depois que um EpisodeNumber é construído, nenhuma camada precisa perguntar
 * de novo se o valor é um inteiro positivo — o tipo já garante isso.
 */
export class EpisodeNumber {
  private constructor(readonly value: number) {}

  /**
   * @throws {InvalidEpisodeNumberError} quando o valor não é um inteiro positivo.
   */
  static create(input: unknown): EpisodeNumber {
    const parsed = typeof input === 'string' ? Number(input.trim()) : input;

    if (
      typeof parsed !== 'number' ||
      !Number.isInteger(parsed) ||
      parsed < 1 ||
      !Number.isSafeInteger(parsed)
    ) {
      throw new InvalidEpisodeNumberError(input);
    }

    return new EpisodeNumber(parsed);
  }

  /** Variante não-lançante, para fronteiras onde o erro é fluxo esperado. */
  static safeCreate(input: unknown): EpisodeNumber | null {
    try {
      return EpisodeNumber.create(input);
    } catch {
      return null;
    }
  }

  equals(other: EpisodeNumber): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }
}
