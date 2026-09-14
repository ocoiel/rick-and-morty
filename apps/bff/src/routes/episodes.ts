import { PUBLIC_DAY_CACHE_CONTROL } from '@zrp/core';

import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import type { Container } from '@zrp/core';

export function createEpisodeRoutes(container: Container): FastifyPluginAsync {
  return async (app: FastifyInstance) => {
    app.get('/episodes', async (_request, reply) => {
      const numbers = await container.listEpisodeNumbers.execute();

      return reply.header('cache-control', PUBLIC_DAY_CACHE_CONTROL).send({ episodes: numbers });
    });

    app.get<{ Params: { id: string } }>('/episodes/:id/cast', async (request, reply) => {
      const payload = await container.getEpisodeCast.execute({ episode: request.params.id });

      return reply
        .header('cache-control', PUBLIC_DAY_CACHE_CONTROL)
        .header('x-cache-source', payload.meta.source)
        .send(payload);
    });
  };
}
