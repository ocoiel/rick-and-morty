import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { EpisodeNotFoundError, UpstreamUnavailableError, type EpisodeGateway } from '@zrp/core';
import { buildTestServer } from './helpers.js';

let app: FastifyInstance;

afterEach(async () => {
  await app?.close();
});

describe('GET /api/episodes/:id/cast', () => {
  it('devolve o elenco ordenado alfabeticamente', async () => {
    app = await buildTestServer();

    const response = await app.inject({ method: 'GET', url: '/api/episodes/1/cast' });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.characters.map((character: { name: string }) => character.name)).toEqual([
      'Ábradolf Lincler',
      'Morty Smith',
      'Rick Sanchez',
    ]);
  });

  it('inclui os metadados do episódio e o total', async () => {
    app = await buildTestServer();

    const body = (await app.inject({ method: 'GET', url: '/api/episodes/1/cast' })).json();

    expect(body.episode).toEqual({
      number: 1,
      name: 'Pilot',
      code: 'S01E01',
      airDate: 'December 2, 2013',
    });
    expect(body.meta.total).toBe(3);
  });

  it('anuncia cacheabilidade longa, coerente com a imutabilidade da origem', async () => {
    app = await buildTestServer();

    const response = await app.inject({ method: 'GET', url: '/api/episodes/1/cast' });

    expect(response.headers['cache-control']).toContain('public');
    expect(response.headers['cache-control']).toContain('max-age=86400');
  });

  it('sinaliza no header quando a resposta veio do cache', async () => {
    app = await buildTestServer();

    const first = await app.inject({ method: 'GET', url: '/api/episodes/1/cast' });
    const second = await app.inject({ method: 'GET', url: '/api/episodes/1/cast' });

    expect(first.headers['x-cache-source']).toBe('origin');
    expect(second.headers['x-cache-source']).toBe('cache');
  });

  it('devolve elenco vazio sem erro', async () => {
    app = await buildTestServer();

    const body = (await app.inject({ method: 'GET', url: '/api/episodes/2/cast' })).json();

    expect(body.characters).toEqual([]);
    expect(body.meta.total).toBe(0);
  });

  it.each(['abc', '0', '-1', '1.5', '%20'])('responde 400 para o id inválido %s', async (id) => {
    app = await buildTestServer();

    const response = await app.inject({ method: 'GET', url: `/api/episodes/${id}/cast` });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('INVALID_EPISODE_NUMBER');
  });

  it('responde 404 para episódio inexistente', async () => {
    app = await buildTestServer();

    const response = await app.inject({ method: 'GET', url: '/api/episodes/9999/cast' });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('EPISODE_NOT_FOUND');
  });

  it('responde 502 quando a origem está indisponível', async () => {
    const failing: EpisodeGateway = {
      findEpisode: () => Promise.reject(new UpstreamUnavailableError('origem fora do ar')),
      findCharactersByIds: () => Promise.resolve([]),
      listEpisodeNumbers: () => Promise.resolve([]),
    };
    app = await buildTestServer(failing);

    const response = await app.inject({ method: 'GET', url: '/api/episodes/1/cast' });

    expect(response.statusCode).toBe(502);
    expect(response.json().error.code).toBe('UPSTREAM_UNAVAILABLE');
  });

  it('responde 500 para erro inesperado sem vazar detalhes internos', async () => {
    const exploding: EpisodeGateway = {
      findEpisode: () => Promise.reject(new Error('segredo interno: senha=123')),
      findCharactersByIds: () => Promise.resolve([]),
      listEpisodeNumbers: () => Promise.resolve([]),
    };
    app = await buildTestServer(exploding);

    const response = await app.inject({ method: 'GET', url: '/api/episodes/1/cast' });

    expect(response.statusCode).toBe(500);
    expect(response.json().error.code).toBe('INTERNAL_ERROR');
    expect(response.body).not.toContain('senha');
  });

  it('propaga erro de domínio de episódio inexistente com a mensagem correta', async () => {
    const notFound: EpisodeGateway = {
      findEpisode: () => Promise.reject(new EpisodeNotFoundError(42)),
      findCharactersByIds: () => Promise.resolve([]),
      listEpisodeNumbers: () => Promise.resolve([]),
    };
    app = await buildTestServer(notFound);

    const response = await app.inject({ method: 'GET', url: '/api/episodes/42/cast' });

    expect(response.json().error.message).toContain('42');
  });
});

describe('GET /api/episodes', () => {
  it('lista os números de episódio disponíveis', async () => {
    app = await buildTestServer();

    const response = await app.inject({ method: 'GET', url: '/api/episodes' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ episodes: [1, 2] });
  });
});

describe('infraestrutura do servidor', () => {
  it('expõe health check não cacheável', async () => {
    app = await buildTestServer();

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe('ok');
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('responde 404 estruturado para rota inexistente', async () => {
    app = await buildTestServer();

    const response = await app.inject({ method: 'GET', url: '/rota-que-nao-existe' });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('ROUTE_NOT_FOUND');
  });

  it('aplica cabeçalhos de segurança do helmet', async () => {
    app = await buildTestServer();

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('habilita CORS para consumo pelo front', async () => {
    app = await buildTestServer();

    const response = await app.inject({
      method: 'OPTIONS',
      url: '/api/episodes',
      headers: { origin: 'https://exemplo.test', 'access-control-request-method': 'GET' },
    });

    expect(response.headers['access-control-allow-origin']).toBe('*');
  });
});
