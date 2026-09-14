import { InvalidEpisodeNumberError } from './errors.ts';

function parsePositiveInteger(input: unknown): number | null {
  if (typeof input === 'number') {
    return Number.isSafeInteger(input) && input >= 1 ? input : null;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed === '') return null;

    const parsed = Number(trimmed);
    return Number.isSafeInteger(parsed) && parsed >= 1 ? parsed : null;
  }

  return null;
}

export class EpisodeNumber {
  private constructor(readonly value: number) {}

  static create(input: unknown): EpisodeNumber {
    const parsed = parsePositiveInteger(input);

    if (parsed === null) {
      throw new InvalidEpisodeNumberError(input);
    }

    return new EpisodeNumber(parsed);
  }

  static safeCreate(input: unknown): EpisodeNumber | null {
    const parsed = parsePositiveInteger(input);
    return parsed === null ? null : new EpisodeNumber(parsed);
  }

  equals(other: EpisodeNumber): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }
}
