import type { Character, EpisodeNumber } from '../../domain/index.js';
import { EpisodeNotFoundError, UpstreamUnavailableError } from '../../domain/index.js';
import type { EpisodeGateway, EpisodeRecord } from '../../application/ports/index.js';
import { HttpClient } from './http-client.js';
import {
  charactersResponseSchema,
  episodeDtoSchema,
  episodeIndexSchema,
  type CharacterDto,
} from './schemas.js';

export interface RickAndMortyGatewayOptions {
  readonly baseUrl?: string;
  readonly timeoutMs?: number;
  readonly retries?: number;
  readonly fetchFn?: typeof fetch;
}

const DEFAULT_BASE_URL = 'https://rickandmortyapi.com/api';
const CHARACTER_BATCH_SIZE = 100;

function characterIdFromUrl(url: string): number | null {
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

export class RickAndMortyHttpGateway implements EpisodeGateway {
  private readonly http: HttpClient;

  constructor(options: RickAndMortyGatewayOptions = {}) {
    this.http = new HttpClient({
      baseUrl: options.baseUrl ?? DEFAULT_BASE_URL,
      timeoutMs: options.timeoutMs ?? 5000,
      retries: options.retries ?? 2,
      fetchFn: options.fetchFn ?? globalThis.fetch,
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
        .map((url) => characterIdFromUrl(url))
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
