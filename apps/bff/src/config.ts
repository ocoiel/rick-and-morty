import { z } from 'zod';

const configSchema = z.object({
  host: z.string().default('0.0.0.0'),
  port: z.coerce.number().int().positive().default(3333),
  apiBaseUrl: z.string().url().default('https://rickandmortyapi.com/api'),
  upstreamTimeoutMs: z.coerce.number().int().positive().default(5000),
  upstreamRetries: z.coerce.number().int().nonnegative().default(2),
  cacheEnabled: z
    .string()
    .default('true')
    .transform((value) => value !== 'false'),
  corsOrigin: z.string().default('*'),
  logLevel: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

export type AppConfig = z.infer<typeof configSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return configSchema.parse({
    host: env.HOST,
    port: env.PORT,
    apiBaseUrl: env.RICK_AND_MORTY_API_URL,
    upstreamTimeoutMs: env.UPSTREAM_TIMEOUT_MS,
    upstreamRetries: env.UPSTREAM_RETRIES,
    cacheEnabled: env.CACHE_ENABLED,
    corsOrigin: env.CORS_ORIGIN,
    logLevel: env.LOG_LEVEL,
  });
}
