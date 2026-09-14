import { ONE_DAY_MS } from '../../cache-policy.ts';
import type { Character } from '../../domain/index.ts';
import { EpisodeCast, EpisodeNumber } from '../../domain/index.ts';
import type { CacheStore, EpisodeGateway } from '../ports/index.ts';

export interface GetEpisodeCastInput {
  readonly episode: unknown;
}

export interface EpisodeCastPayload {
  readonly episode: {
    readonly number: number;
    readonly name: string;
    readonly code: string;
    readonly airDate: string;
  };
  readonly characters: readonly Character[];
  readonly meta: {
    readonly total: number;
    readonly source: 'cache' | 'origin';
  };
}

const cacheKeyFor = (episodeNumber: EpisodeNumber) => `episode-cast:${episodeNumber.value}`;

export class GetEpisodeCastUseCase {
  constructor(
    private readonly episodes: EpisodeGateway,
    private readonly cache: CacheStore,
  ) {}

  async execute(input: GetEpisodeCastInput): Promise<EpisodeCastPayload> {
    const episodeNumber = EpisodeNumber.create(input.episode);
    const cacheKey = cacheKeyFor(episodeNumber);

    const cached = await this.cache.get<EpisodeCastPayload>(cacheKey);
    if (cached) {
      return { ...cached, meta: { ...cached.meta, source: 'cache' } };
    }

    const record = await this.episodes.findEpisode(episodeNumber);
    const characters =
      record.characterIds.length > 0
        ? await this.episodes.findCharactersByIds(record.characterIds)
        : [];

    const cast = EpisodeCast.assemble(
      {
        number: episodeNumber,
        name: record.name,
        code: record.code,
        airDate: record.airDate,
      },
      characters,
    );

    const payload: EpisodeCastPayload = {
      episode: {
        number: cast.episode.number.value,
        name: cast.episode.name,
        code: cast.episode.code,
        airDate: cast.episode.airDate,
      },
      characters: cast.characters,
      meta: { total: cast.size, source: 'origin' },
    };

    await this.cache.set(cacheKey, payload, ONE_DAY_MS);

    return payload;
  }
}
