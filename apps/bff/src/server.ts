import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify, { type FastifyInstance } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { createContainer, type Container } from '@zrp/core';
import type { AppConfig } from './config.ts';
import { healthSchema } from './contract/schemas.ts';
import { registerErrorHandler } from './plugins/error-handler.ts';
import { registerOpenApi } from './plugins/openapi.ts';
import { createApiRoutes } from './routes/index.ts';

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
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

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
  await registerOpenApi(app);

  registerErrorHandler(app);

  app.get(
    '/health',
    {
      schema: {
        operationId: 'getHealth',
        summary: 'Verificação de disponibilidade.',
        tags: ['health'],
        response: { 200: healthSchema },
      },
    },
    (_request, reply) => {
      reply.header('cache-control', 'no-store');

      return { status: 'ok', uptime: process.uptime() } as const;
    },
  );

  await app.register(createApiRoutes(resolved), { prefix: '/api' });

  return app;
}
