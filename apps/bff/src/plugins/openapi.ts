import swagger from '@fastify/swagger';
import { jsonSchemaTransform, jsonSchemaTransformObject } from 'fastify-type-provider-zod';

import type { FastifyInstance } from 'fastify';

const SCHEMA_REF_PREFIX = '#/components/schemas/';

const OPENAPI_DOCUMENT = {
  openapi: '3.1.0',
  info: {
    title: 'Rick and Morty — elenco por episódio',
    description: 'Contrato consumido pelo app Flutter e por qualquer outro cliente.',
    version: '1.0.0',
  },
  tags: [
    { name: 'episodes', description: 'Episódios e seus elencos.' },
    { name: 'characters', description: 'Personagens e suas aparições.' },
    { name: 'health', description: 'Disponibilidade do serviço.' },
  ],
};

export type OpenApiDocument = Record<string, unknown>;

export async function registerOpenApi(app: FastifyInstance): Promise<void> {
  await app.register(swagger, {
    openapi: OPENAPI_DOCUMENT,
    transform: jsonSchemaTransform,
    transformObject: jsonSchemaTransformObject,
  });
}

function collectRefs(node: unknown, found: Set<string>): void {
  if (Array.isArray(node)) {
    for (const item of node) collectRefs(item, found);
    return;
  }

  if (node === null || typeof node !== 'object') return;

  for (const [key, value] of Object.entries(node)) {
    if (key === '$ref' && typeof value === 'string' && value.startsWith(SCHEMA_REF_PREFIX)) {
      found.add(value.slice(SCHEMA_REF_PREFIX.length));
    }

    collectRefs(value, found);
  }
}

/**
 * O type provider registra uma variante de entrada para cada schema, mas esta API
 * só devolve dados: sem a poda, o codegen do cliente criaria classes órfãs.
 */
function pruneUnreachableSchemas(document: OpenApiDocument): void {
  const components = document.components as { schemas?: Record<string, unknown> } | undefined;
  const schemas = components?.schemas;
  if (!schemas) return;

  const reachable = new Set<string>();
  collectRefs(document.paths, reachable);

  // Iteração de Set é viva: refs aninhadas descobertas aqui entram na mesma passada.
  for (const name of reachable) collectRefs(schemas[name], reachable);

  components.schemas = Object.fromEntries(
    Object.entries(schemas).filter(([name]) => reachable.has(name)),
  );
}

export async function buildOpenApiDocument(app: FastifyInstance): Promise<OpenApiDocument> {
  await app.ready();

  const document = app.swagger() as OpenApiDocument;
  pruneUnreachableSchemas(document);

  return document;
}
