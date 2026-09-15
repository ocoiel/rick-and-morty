import { createCharacterRoutes } from './characters.ts';
import { createEpisodeRoutes } from './episodes.ts';

import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type { Container } from '@zrp/core';

export function createApiRoutes(container: Container): FastifyPluginAsyncZod {
  return async (app) => {
    await app.register(createEpisodeRoutes(container));
    await app.register(createCharacterRoutes(container));
  };
}
