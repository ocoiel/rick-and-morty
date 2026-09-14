import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import type { Container } from '@zrp/core';
import { PUBLIC_DAY_CACHE_CONTROL } from '../cache-control.ts';

export function createCharacterRoutes(container: Container): FastifyPluginAsync {
  return async (app: FastifyInstance) => {
    app.get<{ Params: { id: string } }>('/characters/:id/episodes', async (request, reply) => {
      const payload = await container.getCharacterAppearances.execute({
        characterId: request.params.id,
      });

      return reply.header('cache-control', PUBLIC_DAY_CACHE_CONTROL).send(payload);
    });
  };
}
