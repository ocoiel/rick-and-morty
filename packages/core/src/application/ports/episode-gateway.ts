import type { Character, EpisodeNumber } from '../../domain/index.js';

/** Episódio como vem da fonte de dados: metadados + referências para o elenco. */
export interface EpisodeRecord {
  readonly number: number;
  readonly name: string;
  readonly code: string;
  readonly airDate: string;
  readonly characterIds: readonly number[];
}

/**
 * Porta de saída para a fonte de dados de episódios.
 *
 * Deliberadamente expõe duas operações em vez de um único
 * `findEpisodeWithCast`: a orquestração entre elas é regra de aplicação e
 * pertence ao caso de uso, onde pode ser testada com dublês. Um gateway
 * "faz-tudo" esconderia essa lógica dentro do adaptador.
 *
 * Implementações conhecidas:
 *  - RickAndMortyHttpGateway (produção)
 *  - InMemoryEpisodeGateway  (testes)
 */
export interface EpisodeGateway {
  /**
   * @throws {EpisodeNotFoundError} quando o episódio não existe.
   * @throws {UpstreamUnavailableError} quando a fonte falha.
   */
  findEpisode(episodeNumber: EpisodeNumber): Promise<EpisodeRecord>;

  /**
   * Busca personagens em lote. Implementações devem evitar N+1.
   * A ordem do retorno não é garantida — quem ordena é o domínio.
   *
   * @throws {UpstreamUnavailableError} quando a fonte falha.
   */
  findCharactersByIds(ids: readonly number[]): Promise<readonly Character[]>;
}
