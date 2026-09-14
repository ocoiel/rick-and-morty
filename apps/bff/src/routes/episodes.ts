import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import type { Container } from '@zrp/core';

const ONE_DAY_SECONDS = 86_400;
const CACHE_CONTROL = `public, max-age=${ONE_DAY_SECONDS}, stale-while-revalidate=${ONE_DAY_SECONDS}`;

export function createEpisodeRoutes(container: Container): FastifyPluginAsync {
  return async (app: FastifyInstance) => {
    app.get('/episodes', async (_request, reply) => {
      const numbers = await container.listEpisodeNumbers.execute();

      return reply.header('cache-control', CACHE_CONTROL).send({ episodes: numbers });
    });

    app.get<{ Params: { id: string } }>('/episodes/:id/cast', async (request, reply) => {
      const payload = await container.getEpisodeCast.execute({ episode: request.params.id });

      return reply
        .header('cache-control', CACHE_CONTROL)
        .header('x-cache-source', payload.meta.source)
        .send(payload);
    });
  };
}
