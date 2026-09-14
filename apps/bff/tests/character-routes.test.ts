import { afterEach, describe, expect, it } from 'vitest';
import { UpstreamUnavailableError } from '@zrp/core';
import { buildFakeGateway, buildTestServer } from './helpers.ts';

import type { FastifyInstance } from 'fastify';
import type { CharacterGateway } from '@zrp/core';

let app: FastifyInstance;

afterEach(async () => {
  await app?.close();
});

describe('GET /api/characters/:id/episodes', () => {
  it('lista os episódios em que o personagem aparece', async () => {
    app = await buildTestServer();

    const response = await app.inject({ method: 'GET', url: '/api/characters/1/episodes' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      characterId: 1,
      episodes: [{ number: 1, code: 'S01E01', name: 'Pilot' }],
    });
  });

  it('devolve lista vazia para personagem sem aparições', async () => {
    app = await buildTestServer();

    const body = (await app.inject({ method: 'GET', url: '/api/characters/999/episodes' })).json();

    expect(body).toEqual({ characterId: 999, episodes: [] });
  });

  it('anuncia cacheabilidade longa, coerente com a imutabilidade da origem', async () => {
    app = await buildTestServer();

    const response = await app.inject({ method: 'GET', url: '/api/characters/1/episodes' });

    expect(response.headers['cache-control']).toContain('public');
    expect(response.headers['cache-control']).toContain('max-age=86400');
  });

  it('consulta a origem uma única vez para o mesmo personagem', async () => {
    const characterGateway = buildFakeGateway();
    app = await buildTestServer(buildFakeGateway(), characterGateway);

    await app.inject({ method: 'GET', url: '/api/characters/1/episodes' });
    await app.inject({ method: 'GET', url: '/api/characters/1/episodes' });

    expect(characterGateway.calls.findCharacterAppearances).toBe(1);
  });

  it.each(['abc', '0', '-1', '1.5'])('responde 400 para o id inválido %s', async (id) => {
    app = await buildTestServer();

    const response = await app.inject({ method: 'GET', url: `/api/characters/${id}/episodes` });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('INVALID_EPISODE_NUMBER');
  });

  it('responde 502 quando a origem está indisponível', async () => {
    const failing: CharacterGateway = {
      findCharacterAppearances: () =>
        Promise.reject(new UpstreamUnavailableError('origem fora do ar')),
    };
    app = await buildTestServer(buildFakeGateway(), failing);

    const response = await app.inject({ method: 'GET', url: '/api/characters/1/episodes' });

    expect(response.statusCode).toBe(502);
    expect(response.json().error.code).toBe('UPSTREAM_UNAVAILABLE');
  });
});
