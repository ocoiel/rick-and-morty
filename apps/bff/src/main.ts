import { loadConfig } from './config.js';
import { buildServer } from './server.js';

const config = loadConfig();
const app = await buildServer({ config });

const shutdown = async (signal: string) => {
  app.log.info({ signal }, 'encerrando servidor');
  await app.close();
  process.exit(0);
};

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    void shutdown(signal);
  });
}

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.fatal({ err: error }, 'falha ao iniciar servidor');
  process.exit(1);
}
