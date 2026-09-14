import type { Character } from '../../domain/index.js';
import { EpisodeCast, EpisodeNumber } from '../../domain/index.js';
import type { CacheStore, EpisodeGateway } from '../ports/index.js';

export interface GetEpisodeCastInput {
  /** Aceita valor cru (string de querystring, number de param). A validação é do domínio. */
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
    /** De onde veio a resposta. Exposto como header pelos adaptadores. */
    readonly source: 'cache' | 'origin';
  };
}

const CACHE_KEY_PREFIX = 'episode-cast';

/**
 * TTL longo por decisão consciente: a própria API de origem devolve
 * `cache-control: public, max-age=7776000, immutable`, ou seja, declara o
 * dado imutável por 90 dias. Cacheamos por 24h — ordens de grandeza abaixo
 * do que a origem autoriza, o que mantém margem para correções upstream.
 */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Caso de uso central da aplicação: dado o número de um episódio, devolver
 * seu elenco em ordem alfabética.
 *
 * Toda a orquestração vive aqui e depende apenas de portas, o que permite
 * testá-la inteira sem rede, sem HTTP e sem framework.
 */
export class GetEpisodeCastUseCase {
  constructor(
    private readonly episodes: EpisodeGateway,
    private readonly cache: CacheStore,
  ) {}

  /**
   * @throws {InvalidEpisodeNumberError} número malformado.
   * @throws {EpisodeNotFoundError} episódio inexistente.
   * @throws {UpstreamUnavailableError} falha na fonte de dados.
   */
  async execute(input: GetEpisodeCastInput): Promise<EpisodeCastPayload> {
    const episodeNumber = EpisodeNumber.create(input.episode);
    const cacheKey = `${CACHE_KEY_PREFIX}:${episodeNumber.value}`;

    const cached = await this.cache.get<EpisodeCastPayload>(cacheKey);
    if (cached) {
      return { ...cached, meta: { ...cached.meta, source: 'cache' } };
    }

    const record = await this.episodes.findEpisode(episodeNumber);

    // Uma única chamada em lote para todo o elenco: o episódio com o maior
    // elenco (S03E07) tem 65 personagens — seriam 65 requisições sem isto.
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

    await this.cache.set(cacheKey, payload, CACHE_TTL_MS);

    return payload;
  }
}
