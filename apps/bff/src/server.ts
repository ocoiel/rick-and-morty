import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify, { type FastifyInstance } from 'fastify';
import { createContainer, type Container } from '@zrp/core';
import type { AppConfig } from './config.ts';
import { registerErrorHandler } from './plugins/error-handler.ts';
import { createEpisodeRoutes } from './routes/episodes.ts';

export interface BuildServerOptions {
  readonly config: AppConfig;
  readonly container?: Container;
}

export async function buildServer({
  config,
  container,
}: BuildServerOptions): Promise<FastifyInstance> {
  const app = Fastify({
    logger: config.logLevel === 'silent' ? false : { level: config.logLevel },
  });

  const resolved =
    container ??
    createContainer({
      apiBaseUrl: config.apiBaseUrl,
      timeoutMs: config.upstreamTimeoutMs,
      retries: config.upstreamRetries,
      cacheEnabled: config.cacheEnabled,
    });

  await app.register(helmet);
  await app.register(cors, { origin: config.corsOrigin });

  registerErrorHandler(app);

  app.get('/health', (_request, reply) =>
    reply.header('cache-control', 'no-store').send({ status: 'ok', uptime: process.uptime() }),
  );

  await app.register(createEpisodeRoutes(resolved), { prefix: '/api' });

  return app;
}
