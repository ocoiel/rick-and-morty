import {
  GetCharacterAppearancesUseCase,
  GetEpisodeCastUseCase,
  ListEpisodeNumbersUseCase,
} from './application/index.ts';
import type { CacheStore, CharacterGateway, EpisodeGateway } from './application/ports/index.ts';
import { InMemoryCacheStore } from './infrastructure/cache/in-memory-cache-store.ts';
import { NoOpCacheStore } from './infrastructure/cache/no-op-cache-store.ts';
import { RickAndMortyHttpGateway } from './infrastructure/http/rick-and-morty-gateway.ts';

export interface ContainerConfig {
  readonly apiBaseUrl?: string;
  readonly timeoutMs?: number;
  readonly retries?: number;
  readonly maxConcurrency?: number;
  readonly backoffBaseMs?: number;
  readonly cacheEnabled?: boolean;
  readonly cacheMaxEntries?: number;
  readonly fetchFn?: typeof fetch;
  readonly episodeGateway?: EpisodeGateway;
  readonly characterGateway?: CharacterGateway;
  readonly cacheStore?: CacheStore;
}

export interface Container {
  readonly getEpisodeCast: GetEpisodeCastUseCase;
  readonly listEpisodeNumbers: ListEpisodeNumbersUseCase;
  readonly getCharacterAppearances: GetCharacterAppearancesUseCase;
  readonly episodeGateway: EpisodeGateway;
  readonly characterGateway: CharacterGateway;
  readonly cacheStore: CacheStore;
}

export function createContainer(config: ContainerConfig = {}): Container {
  const httpGateway = new RickAndMortyHttpGateway({
    ...(config.apiBaseUrl !== undefined && { baseUrl: config.apiBaseUrl }),
    ...(config.timeoutMs !== undefined && { timeoutMs: config.timeoutMs }),
    ...(config.retries !== undefined && { retries: config.retries }),
    ...(config.fetchFn !== undefined && { fetchFn: config.fetchFn }),
    ...(config.maxConcurrency !== undefined && { maxConcurrency: config.maxConcurrency }),
    ...(config.backoffBaseMs !== undefined && { backoffBaseMs: config.backoffBaseMs }),
  });

  const episodeGateway = config.episodeGateway ?? httpGateway;
  const characterGateway = config.characterGateway ?? httpGateway;

  const cacheStore =
    config.cacheStore ??
    (config.cacheEnabled === false
      ? new NoOpCacheStore()
      : new InMemoryCacheStore({
          ...(config.cacheMaxEntries !== undefined && { maxEntries: config.cacheMaxEntries }),
        }));

  return {
    episodeGateway,
    characterGateway,
    cacheStore,
    getEpisodeCast: new GetEpisodeCastUseCase(episodeGateway, cacheStore),
    getCharacterAppearances: new GetCharacterAppearancesUseCase(characterGateway, cacheStore),
    listEpisodeNumbers: new ListEpisodeNumbersUseCase(episodeGateway),
  };
}
