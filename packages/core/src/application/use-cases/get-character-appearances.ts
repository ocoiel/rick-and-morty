import { InvalidEpisodeNumberError } from '../../domain/index.js';
import type { CacheStore, CharacterGateway, EpisodeAppearance } from '../ports/index.js';

export interface GetCharacterAppearancesInput {
  readonly characterId: unknown;
}

export interface CharacterAppearancesPayload {
  readonly characterId: number;
  readonly episodes: readonly EpisodeAppearance[];
}

export const APPEARANCES_TTL_MS = 24 * 60 * 60 * 1000;

function parseCharacterId(input: unknown): number {
  const parsed = typeof input === 'string' ? Number(input.trim()) : input;

  if (typeof parsed !== 'number' || !Number.isSafeInteger(parsed) || parsed < 1) {
    throw new InvalidEpisodeNumberError(input);
  }

  return parsed;
}

export class GetCharacterAppearancesUseCase {
  constructor(
    private readonly characters: CharacterGateway,
    private readonly cache: CacheStore,
  ) {}

  async execute(input: GetCharacterAppearancesInput): Promise<CharacterAppearancesPayload> {
    const characterId = parseCharacterId(input.characterId);
    const cacheKey = `character-appearances:${characterId}`;

    const cached = await this.cache.get<CharacterAppearancesPayload>(cacheKey);
    if (cached) return cached;

    const episodes = await this.characters.findCharacterAppearances(characterId);
    const payload: CharacterAppearancesPayload = { characterId, episodes };

    await this.cache.set(cacheKey, payload, APPEARANCES_TTL_MS);

    return payload;
  }
}
