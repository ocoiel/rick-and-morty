export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class InvalidEpisodeNumberError extends DomainError {
  readonly code = 'INVALID_EPISODE_NUMBER';

  constructor(readonly received: unknown) {
    super(`"${String(received)}" não é um número de episódio válido.`);
  }
}

export class EpisodeNotFoundError extends DomainError {
  readonly code = 'EPISODE_NOT_FOUND';

  constructor(readonly episodeNumber: number) {
    super(`Episódio ${episodeNumber} não encontrado.`);
  }
}

export class UpstreamUnavailableError extends DomainError {
  readonly code = 'UPSTREAM_UNAVAILABLE';
}
