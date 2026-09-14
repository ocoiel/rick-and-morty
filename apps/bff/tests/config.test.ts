import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';

describe('loadConfig', () => {
  it('aplica padrões seguros quando o ambiente está vazio', () => {
    const config = loadConfig({} as NodeJS.ProcessEnv);

    expect(config).toMatchObject({
      host: '0.0.0.0',
      port: 3333,
      apiBaseUrl: 'https://rickandmortyapi.com/api',
      cacheEnabled: true,
      logLevel: 'info',
    });
  });

  it('converte variáveis numéricas vindas como texto', () => {
    const config = loadConfig({ PORT: '8080', UPSTREAM_TIMEOUT_MS: '250' } as NodeJS.ProcessEnv);

    expect(config.port).toBe(8080);
    expect(config.upstreamTimeoutMs).toBe(250);
  });

  it('permite desligar o cache por configuração', () => {
    expect(loadConfig({ CACHE_ENABLED: 'false' } as NodeJS.ProcessEnv).cacheEnabled).toBe(false);
    expect(loadConfig({ CACHE_ENABLED: 'true' } as NodeJS.ProcessEnv).cacheEnabled).toBe(true);
  });

  it('rejeita configuração inválida em vez de subir com valor silenciosamente errado', () => {
    expect(() => loadConfig({ PORT: 'não é porta' } as NodeJS.ProcessEnv)).toThrow();
    expect(() =>
      loadConfig({ RICK_AND_MORTY_API_URL: 'não-é-url' } as NodeJS.ProcessEnv),
    ).toThrow();
  });
});
