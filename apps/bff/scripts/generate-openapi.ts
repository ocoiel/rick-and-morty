import { writeFile } from 'node:fs/promises';
import { loadConfig } from '../src/config.ts';
import { buildOpenApiDocument } from '../src/plugins/openapi.ts';
import { buildServer } from '../src/server.ts';

const OUTPUT = new URL('../openapi.json', import.meta.url);

const app = await buildServer({
  config: loadConfig({ LOG_LEVEL: 'silent' } as NodeJS.ProcessEnv),
});

const document = await buildOpenApiDocument(app);

await app.close();

await writeFile(OUTPUT, `${JSON.stringify(document, null, 2)}\n`, 'utf8');

process.stdout.write('Contrato OpenAPI gerado em apps/bff/openapi.json\n');
