import { describe, expect, it, vi } from 'vitest';
import { RickAndMortyHttpGateway, UpstreamUnavailableError } from '../src/index.ts';

const BASE_URL = 'https://api.test/api';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function buildGateway(fetchFn: typeof fetch, retries = 0) {
  return new RickAndMortyHttpGateway({ baseUrl: BASE_URL, fetchFn, retries, timeoutMs: 1000 });
}

describe('RickAndMortyHttpGateway — aparições do personagem', () => {
  const characterWithEpisodes = {
    id: 1,
    episode: ['https://api.test/api/episode/1', 'https://api.test/api/episode/2'],
  };

  it('resolve os episódios do personagem em duas requisições', async () => {
    const fetchFn = vi.fn(async (url: string) =>
      url.includes('/character/')
        ? jsonResponse(characterWithEpisodes)
        : jsonResponse([
            { id: 1, name: 'Pilot', episode: 'S01E01' },
            { id: 2, name: 'Lawnmower Dog', episode: 'S01E02' },
          ]),
    );
    const gateway = buildGateway(fetchFn as unknown as typeof fetch);

    const appearances = await gateway.findCharacterAppearances(1);

    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(fetchFn).toHaveBeenLastCalledWith(`${BASE_URL}/episode/1,2`, expect.anything());
    expect(appearances).toEqual([
      { number: 1, code: 'S01E01', name: 'Pilot' },
      { number: 2, code: 'S01E02', name: 'Lawnmower Dog' },
    ]);
  });

  it('normaliza aparição única, devolvida como objeto pela origem', async () => {
    const fetchFn = vi.fn(async (url: string) =>
      url.includes('/character/')
        ? jsonResponse({ id: 1, episode: ['https://api.test/api/episode/1'] })
        : jsonResponse({ id: 1, name: 'Pilot', episode: 'S01E01' }),
    );
    const gateway = buildGateway(fetchFn as unknown as typeof fetch);

    await expect(gateway.findCharacterAppearances(1)).resolves.toEqual([
      { number: 1, code: 'S01E01', name: 'Pilot' },
    ]);
  });

  it('devolve vazio para personagem inexistente', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ error: 'not found' }, 404));
    const gateway = buildGateway(fetchFn as unknown as typeof fetch);

    await expect(gateway.findCharacterAppearances(9999)).resolves.toEqual([]);
  });

  it('devolve vazio quando o personagem não tem episódios', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ id: 1, episode: [] }));
    const gateway = buildGateway(fetchFn as unknown as typeof fetch);

    await expect(gateway.findCharacterAppearances(1)).resolves.toEqual([]);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('rejeita personagem fora do contrato', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ id: 'inválido' }));
    const gateway = buildGateway(fetchFn as unknown as typeof fetch);

    await expect(gateway.findCharacterAppearances(1)).rejects.toThrow(UpstreamUnavailableError);
  });

  it('rejeita episódios fora do contrato', async () => {
    const fetchFn = vi.fn(async (url: string) =>
      url.includes('/character/')
        ? jsonResponse(characterWithEpisodes)
        : jsonResponse([{ id: 'x' }]),
    );
    const gateway = buildGateway(fetchFn as unknown as typeof fetch);

    await expect(gateway.findCharacterAppearances(1)).rejects.toThrow(UpstreamUnavailableError);
  });
});
