/**
 * Erros de domínio.
 *
 * São deliberadamente agnósticos de transporte: não conhecem status HTTP.
 * Cada adaptador de entrada (Route Handler, Fastify) é responsável por
 * traduzir estes erros para a semântica do seu protocolo.
 */

export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

/** O identificador informado não é um número de episódio válido. */
export class InvalidEpisodeNumberError extends DomainError {
  readonly code = 'INVALID_EPISODE_NUMBER';

  constructor(readonly received: unknown) {
    super(
      `"${String(received)}" não é um número de episódio válido. ` +
        `Informe um inteiro positivo.`,
    );
  }
}

/** O episódio é sintaticamente válido, mas não existe na fonte de dados. */
export class EpisodeNotFoundError extends DomainError {
  readonly code = 'EPISODE_NOT_FOUND';

  constructor(readonly episodeNumber: number) {
    super(`Episódio ${episodeNumber} não encontrado.`);
  }
}

/** A fonte de dados externa falhou ou respondeu de forma inesperada. */
export class UpstreamUnavailableError extends DomainError {
  readonly code = 'UPSTREAM_UNAVAILABLE';

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
  }
}
