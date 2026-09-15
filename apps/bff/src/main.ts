import { loadConfig } from './config.ts';
import { buildServer } from './server.ts';

const config = loadConfig();
const app = await buildServer({ config });

// `once`: um segundo Ctrl+C não dispara um encerramento concorrente.
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    app.log.info({ signal }, 'encerrando servidor');
    void app.close().then(() => process.exit(0));
  });
}

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.fatal({ err: error }, 'falha ao iniciar servidor');
  process.exit(1);
}
