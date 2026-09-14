import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { DomainError, type EpisodeGateway } from '@zrp/core';
import { createContainer, InMemoryCacheStore } from '@zrp/core';
import { loadConfig } from '../src/config.ts';
import { buildServer } from '../src/server.ts';

let app: FastifyInstance;

afterEach(async () => {
  await app?.close();
});

class UnmappedDomainError extends DomainError {
  readonly code = 'ALGO_INESPERADO';
}

describe('composição do servidor', () => {
  it('monta as dependências reais quando nenhum container é injetado', async () => {
    app = await buildServer({
      config: loadConfig({ LOG_LEVEL: 'silent', CACHE_ENABLED: 'false' } as NodeJS.ProcessEnv),
    });

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
  });

  it('respeita o nível de log configurado', async () => {
    app = await buildServer({
      config: loadConfig({ LOG_LEVEL: 'error' } as NodeJS.ProcessEnv),
      container: createContainer({
        episodeGateway: {
          findEpisode: () => Promise.reject(new UnmappedDomainError('sem mapeamento')),
          findCharactersByIds: () => Promise.resolve([]),
          listEpisodeNumbers: () => Promise.resolve([]),
        } satisfies EpisodeGateway,
        cacheStore: new InMemoryCacheStore(),
      }),
    });

    expect(app.log.level).toBe('error');
  });

  it('trata erro de domínio sem mapeamento explícito como falha interna', async () => {
    const unmapped: EpisodeGateway = {
      findEpisode: () => Promise.reject(new UnmappedDomainError('sem mapeamento')),
      findCharactersByIds: () => Promise.resolve([]),
      listEpisodeNumbers: () => Promise.resolve([]),
    };

    app = await buildServer({
      config: loadConfig({ LOG_LEVEL: 'silent' } as NodeJS.ProcessEnv),
      container: createContainer({
        episodeGateway: unmapped,
        cacheStore: new InMemoryCacheStore(),
      }),
    });

    const response = await app.inject({ method: 'GET', url: '/api/episodes/1/cast' });

    expect(response.statusCode).toBe(500);
    expect(response.json().error.code).toBe('ALGO_INESPERADO');
  });
});
