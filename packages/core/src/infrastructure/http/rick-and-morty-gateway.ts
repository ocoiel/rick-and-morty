import { EpisodeNotFoundError, UpstreamUnavailableError } from '../../domain/index.ts';
import { HttpClient } from './http-client.ts';
import {
  characterEpisodesSchema,
  charactersResponseSchema,
  episodeDtoSchema,
  episodeIndexSchema,
  episodeSummaryResponseSchema,
} from './schemas.ts';

import type {
  CharacterGateway,
  EpisodeAppearance,
  EpisodeGateway,
  EpisodeRecord,
} from '../../application/ports/index.ts';
import type { Character, EpisodeNumber } from '../../domain/index.ts';
import type { CharacterDto } from './schemas.ts';

export interface RickAndMortyGatewayOptions {
  readonly baseUrl?: string;
  readonly timeoutMs?: number;
  readonly retries?: number;
  readonly fetchFn?: typeof fetch;
  readonly maxConcurrency?: number;
  readonly backoffBaseMs?: number;
}

export const DEFAULT_API_BASE_URL = 'https://rickandmortyapi.com/api';
export const DEFAULT_UPSTREAM_TIMEOUT_MS = 5000;
export const DEFAULT_UPSTREAM_RETRIES = 3;

/** A origem aceita vários ids por requisição; 100 é o teto documentado. */
const CHARACTER_BATCH_SIZE = 100;

function idFromUrl(url: string): number | null {
  const id = Number(url.split('/').pop());
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function toCharacter(dto: CharacterDto): Character {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status,
    species: dto.species,
    gender: dto.gender,
    origin: dto.origin.name,
    location: dto.location.name,
    imageUrl: dto.image,
  };
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export class RickAndMortyHttpGateway implements EpisodeGateway, CharacterGateway {
  private readonly http: HttpClient;

  constructor(options: RickAndMortyGatewayOptions = {}) {
    this.http = new HttpClient({
      baseUrl: options.baseUrl ?? DEFAULT_API_BASE_URL,
      timeoutMs: options.timeoutMs ?? DEFAULT_UPSTREAM_TIMEOUT_MS,
      retries: options.retries ?? DEFAULT_UPSTREAM_RETRIES,
      fetchFn: options.fetchFn ?? globalThis.fetch,
      ...(options.maxConcurrency !== undefined && { maxConcurrency: options.maxConcurrency }),
      ...(options.backoffBaseMs !== undefined && { backoffBaseMs: options.backoffBaseMs }),
    });
  }

  async findEpisode(episodeNumber: EpisodeNumber): Promise<EpisodeRecord> {
    const { status, body } = await this.http.get(`/episode/${episodeNumber.value}`);

    if (status === 404) {
      throw new EpisodeNotFoundError(episodeNumber.value);
    }

    const parsed = episodeDtoSchema.safeParse(body);
    if (!parsed.success) {
      throw new UpstreamUnavailableError(
        `Resposta inesperada da origem para o episódio ${episodeNumber.value}.`,
        { cause: parsed.error },
      );
    }

    return {
      number: parsed.data.id,
      name: parsed.data.name,
      code: parsed.data.episode,
      airDate: parsed.data.air_date,
      characterIds: parsed.data.characters
        .map((url) => idFromUrl(url))
        .filter((id): id is number => id !== null),
    };
  }

  async findCharactersByIds(ids: readonly number[]): Promise<readonly Character[]> {
    if (ids.length === 0) return [];

    const batches = await Promise.all(
      chunk(ids, CHARACTER_BATCH_SIZE).map((batch) => this.fetchCharacterBatch(batch)),
    );

    return batches.flat();
  }

  async listEpisodeNumbers(): Promise<readonly number[]> {
    const { body } = await this.http.get('/episode');
    const parsed = episodeIndexSchema.safeParse(body);

    if (!parsed.success) {
      throw new UpstreamUnavailableError('Não foi possível listar os episódios.', {
        cause: parsed.error,
      });
    }

    return Array.from({ length: parsed.data.info.count }, (_, index) => index + 1);
  }

  async findCharacterAppearances(characterId: number): Promise<readonly EpisodeAppearance[]> {
    const character = await this.http.get(`/character/${characterId}`);

    if (character.status === 404) return [];

    const parsedCharacter = characterEpisodesSchema.safeParse(character.body);
    if (!parsedCharacter.success) {
      throw new UpstreamUnavailableError(
        `Resposta inesperada da origem para o personagem ${characterId}.`,
        { cause: parsedCharacter.error },
      );
    }

    const episodeIds = parsedCharacter.data.episode
      .map((url) => idFromUrl(url))
      .filter((id): id is number => id !== null);

    if (episodeIds.length === 0) return [];

    const episodes = await this.http.get(`/episode/${episodeIds.join(',')}`);
    const parsedEpisodes = episodeSummaryResponseSchema.safeParse(episodes.body);

    if (!parsedEpisodes.success) {
      throw new UpstreamUnavailableError('Resposta inesperada da origem para episódios.', {
        cause: parsedEpisodes.error,
      });
    }

    const summaries = Array.isArray(parsedEpisodes.data)
      ? parsedEpisodes.data
      : [parsedEpisodes.data];

    return summaries.map((summary) => ({
      number: summary.id,
      code: summary.episode,
      name: summary.name,
    }));
  }

  private async fetchCharacterBatch(ids: readonly number[]): Promise<Character[]> {
    const { status, body } = await this.http.get(`/character/${ids.join(',')}`);

    if (status === 404) return [];

    const parsed = charactersResponseSchema.safeParse(body);
    if (!parsed.success) {
      throw new UpstreamUnavailableError('Resposta inesperada da origem para personagens.', {
        cause: parsed.error,
      });
    }

    const dtos = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
    return dtos.map((dto) => toCharacter(dto));
  }
}
