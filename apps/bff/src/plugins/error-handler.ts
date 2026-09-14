import {
  DomainError,
  EpisodeNotFoundError,
  InvalidEpisodeNumberError,
  UpstreamUnavailableError,
} from '@zrp/core';

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export interface ErrorBody {
  readonly error: { readonly code: string; readonly message: string };
}

const STATUS_BY_ERROR = new Map<new (...args: never[]) => DomainError, number>([
  [InvalidEpisodeNumberError, 400],
  [EpisodeNotFoundError, 404],
  [UpstreamUnavailableError, 502],
]);

function statusFor(error: DomainError): number {
  for (const [type, status] of STATUS_BY_ERROR) {
    if (error instanceof type) return status;
  }
  return 500;
}

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: unknown, request: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof DomainError) {
      const status = statusFor(error);

      if (status >= 500) {
        request.log.error({ err: error, code: error.code }, 'falha ao atender requisição');
      }

      return reply
        .status(status)
        .send({ error: { code: error.code, message: error.message } } satisfies ErrorBody);
    }

    request.log.error({ err: error }, 'erro não tratado');

    return reply.status(500).send({
      error: { code: 'INTERNAL_ERROR', message: 'Erro interno inesperado.' },
    } satisfies ErrorBody);
  });

  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) =>
    reply.status(404).send({
      error: { code: 'ROUTE_NOT_FOUND', message: `Rota ${request.url} não existe.` },
    } satisfies ErrorBody),
  );
}
