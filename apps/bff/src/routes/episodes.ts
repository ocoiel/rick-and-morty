import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type { Container } from '@zrp/core';
import { PUBLIC_DAY_CACHE_CONTROL } from '../cache-control.ts';
import {
  episodeCastSchema,
  episodeListSchema,
  errorSchema,
  resourceIdParamsSchema,
} from '../contract/schemas.ts';

export function createEpisodeRoutes(container: Container): FastifyPluginAsyncZod {
  return async (app) => {
    app.get(
      '/episodes',
      {
        schema: {
          operationId: 'listEpisodes',
          summary: 'Lista os números de episódio disponíveis.',
          tags: ['episodes'],
          response: { 200: episodeListSchema, 502: errorSchema },
        },
      },
      async (_request, reply) => {
        const episodes = await container.listEpisodeNumbers.execute();

        return reply.header('cache-control', PUBLIC_DAY_CACHE_CONTROL).send({ episodes });
      },
    );

    app.get(
      '/episodes/:id/cast',
      {
        schema: {
          operationId: 'getEpisodeCast',
          summary: 'Elenco do episódio, em ordem alfabética.',
          tags: ['episodes'],
          params: resourceIdParamsSchema,
          response: {
            200: episodeCastSchema,
            400: errorSchema,
            404: errorSchema,
            502: errorSchema,
          },
        },
      },
      async (request, reply) => {
        const payload = await container.getEpisodeCast.execute({ episode: request.params.id });

        return reply
          .header('cache-control', PUBLIC_DAY_CACHE_CONTROL)
          .header('x-cache-source', payload.meta.source)
          .send(payload);
      },
    );
  };
}
