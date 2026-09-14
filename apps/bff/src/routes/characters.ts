import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type { Container } from '@zrp/core';
import { PUBLIC_DAY_CACHE_CONTROL } from '../cache-control.ts';
import {
  characterAppearancesSchema,
  errorSchema,
  resourceIdParamsSchema,
} from '../contract/schemas.ts';

export function createCharacterRoutes(container: Container): FastifyPluginAsyncZod {
  return async (app) => {
    app.get(
      '/characters/:id/episodes',
      {
        schema: {
          operationId: 'getCharacterAppearances',
          summary: 'Episódios em que o personagem aparece.',
          tags: ['characters'],
          params: resourceIdParamsSchema,
          response: { 200: characterAppearancesSchema, 400: errorSchema, 502: errorSchema },
        },
      },
      async (request, reply) => {
        const payload = await container.getCharacterAppearances.execute({
          characterId: request.params.id,
        });

        return reply.header('cache-control', PUBLIC_DAY_CACHE_CONTROL).send(payload);
      },
    );
  };
}
