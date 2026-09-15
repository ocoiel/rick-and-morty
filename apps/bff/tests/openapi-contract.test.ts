import { readFile } from 'node:fs/promises';
import { afterEach, describe, expect, it } from 'vitest';
import { buildOpenApiDocument } from '../src/plugins/openapi.ts';
import { buildTestServer } from './helpers.ts';

import type { FastifyInstance } from 'fastify';

const COMMITTED_SPEC = new URL('../openapi.json', import.meta.url);

let app: FastifyInstance;

afterEach(async () => {
  await app?.close();
});

describe('contrato OpenAPI', () => {
  it('descreve todas as rotas consumidas pelos clientes', async () => {
    app = await buildTestServer();

    const document = await buildOpenApiDocument(app);

    expect(Object.keys(document.paths as object).toSorted()).toEqual([
      '/api/characters/{id}/episodes',
      '/api/episodes',
      '/api/episodes/{id}/cast',
      '/health',
    ]);
  });

  it('não publica schemas órfãos, que virariam classes mortas no cliente', async () => {
    app = await buildTestServer();

    const document = await buildOpenApiDocument(app);
    const { schemas } = document.components as { schemas: Record<string, unknown> };

    expect(Object.keys(schemas).toSorted()).toEqual([
      'Character',
      'CharacterAppearances',
      'EpisodeCast',
      'EpisodeList',
      'ErrorBody',
      'Health',
    ]);
  });

  it('mantém o openapi.json versionado em dia com as rotas', async () => {
    app = await buildTestServer();

    const document = await buildOpenApiDocument(app);
    const committed: unknown = JSON.parse(await readFile(COMMITTED_SPEC, 'utf8'));

    expect(document).toEqual(committed);
  });
});
