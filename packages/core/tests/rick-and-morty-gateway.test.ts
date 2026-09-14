import { describe, expect, it, vi } from 'vitest';
import {
  EpisodeNotFoundError,
  EpisodeNumber,
  RickAndMortyHttpGateway,
  UpstreamUnavailableError,
} from '../src/index.js';

const BASE_URL = 'https://api.test/api';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function characterDto(id: number, name: string) {
  return {
    id,
    name,
    status: 'Alive',
    species: 'Human',
    gender: 'Male',
    origin: { name: 'Earth (C-137)' },
    location: { name: 'Citadel of Ricks' },
    image: `https://cdn.test/${id}.jpeg`,
  };
}

const episodeDto = {
  id: 1,
  name: 'Pilot',
  air_date: 'December 2, 2013',
  episode: 'S01E01',
  characters: ['https://api.test/api/character/1', 'https://api.test/api/character/2'],
};

function buildGateway(fetchFn: typeof fetch, retries = 0) {
  return new RickAndMortyHttpGateway({ baseUrl: BASE_URL, fetchFn, retries, timeoutMs: 1000 });
}

describe('RickAndMortyHttpGateway', () => {
  describe('findEpisode', () => {
    it('mapeia o episódio e extrai os ids do elenco das URLs', async () => {
      const fetchFn = vi.fn(async () => jsonResponse(episodeDto));
      const gateway = buildGateway(fetchFn as unknown as typeof fetch);

      const record = await gateway.findEpisode(EpisodeNumber.create(1));

      expect(record).toEqual({
        number: 1,
        name: 'Pilot',
        code: 'S01E01',
        airDate: 'December 2, 2013',
        characterIds: [1, 2],
      });
      expect(fetchFn).toHaveBeenCalledWith(`${BASE_URL}/episode/1`, expect.anything());
    });

    it('traduz 404 em erro de domínio', async () => {
      const fetchFn = vi.fn(async () => jsonResponse({ error: 'not found' }, 404));
      const gateway = buildGateway(fetchFn as unknown as typeof fetch);

      await expect(gateway.findEpisode(EpisodeNumber.create(999))).rejects.toThrow(
        EpisodeNotFoundError,
      );
    });

    it('rejeita payload fora do contrato esperado', async () => {
      const fetchFn = vi.fn(async () => jsonResponse({ id: 'não é número' }));
      const gateway = buildGateway(fetchFn as unknown as typeof fetch);

      await expect(gateway.findEpisode(EpisodeNumber.create(1))).rejects.toThrow(
        UpstreamUnavailableError,
      );
    });

    it('ignora URLs de personagem malformadas', async () => {
      const fetchFn = vi.fn(async () =>
        jsonResponse({ ...episodeDto, characters: ['https://api.test/api/character/quebrado'] }),
      );
      const gateway = buildGateway(fetchFn as unknown as typeof fetch);

      const record = await gateway.findEpisode(EpisodeNumber.create(1));

      expect(record.characterIds).toEqual([]);
    });
  });

  describe('findCharactersByIds', () => {
    it('busca todos os ids em uma única requisição em lote', async () => {
      const fetchFn = vi.fn(async () =>
        jsonResponse([characterDto(1, 'Rick Sanchez'), characterDto(2, 'Morty Smith')]),
      );
      const gateway = buildGateway(fetchFn as unknown as typeof fetch);

      const characters = await gateway.findCharactersByIds([1, 2]);

      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(fetchFn).toHaveBeenCalledWith(`${BASE_URL}/character/1,2`, expect.anything());
      expect(characters).toHaveLength(2);
    });

    it('normaliza a resposta de id único, que a origem devolve como objeto', async () => {
      const fetchFn = vi.fn(async () => jsonResponse(characterDto(1, 'Rick Sanchez')));
      const gateway = buildGateway(fetchFn as unknown as typeof fetch);

      const characters = await gateway.findCharactersByIds([1]);

      expect(characters).toEqual([
        {
          id: 1,
          name: 'Rick Sanchez',
          status: 'Alive',
          species: 'Human',
          gender: 'Male',
          origin: 'Earth (C-137)',
          location: 'Citadel of Ricks',
          imageUrl: 'https://cdn.test/1.jpeg',
        },
      ]);
    });

    it('não faz requisição alguma para lista vazia', async () => {
      const fetchFn = vi.fn(async () => jsonResponse([]));
      const gateway = buildGateway(fetchFn as unknown as typeof fetch);

      await expect(gateway.findCharactersByIds([])).resolves.toEqual([]);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('divide lotes acima de 100 ids', async () => {
      const ids = Array.from({ length: 150 }, (_, index) => index + 1);
      const fetchFn = vi.fn(async (url: string) => {
        const requested = url.split('/').pop()!.split(',');
        return jsonResponse(requested.map((id) => characterDto(Number(id), `Personagem ${id}`)));
      });
      const gateway = buildGateway(fetchFn as unknown as typeof fetch);

      const characters = await gateway.findCharactersByIds(ids);

      expect(fetchFn).toHaveBeenCalledTimes(2);
      expect(characters).toHaveLength(150);
    });

    it('normaliza status desconhecido em vez de falhar', async () => {
      const fetchFn = vi.fn(async () =>
        jsonResponse([{ ...characterDto(1, 'Rick'), status: 'Zumbi' }]),
      );
      const gateway = buildGateway(fetchFn as unknown as typeof fetch);

      const characters = await gateway.findCharactersByIds([1]);

      expect(characters[0]?.status).toBe('unknown');
    });
  });

  describe('resiliência', () => {
    it('repete a requisição em falha temporária da origem', async () => {
      const fetchFn = vi
        .fn<() => Promise<Response>>()
        .mockResolvedValueOnce(jsonResponse({}, 503))
        .mockResolvedValueOnce(jsonResponse(episodeDto));
      const gateway = buildGateway(fetchFn as unknown as typeof fetch, 2);

      const record = await gateway.findEpisode(EpisodeNumber.create(1));

      expect(fetchFn).toHaveBeenCalledTimes(2);
      expect(record.name).toBe('Pilot');
    });

    it('desiste após esgotar as tentativas', async () => {
      const fetchFn = vi.fn(async () => jsonResponse({}, 503));
      const gateway = buildGateway(fetchFn as unknown as typeof fetch, 1);

      await expect(gateway.findEpisode(EpisodeNumber.create(1))).rejects.toThrow(
        UpstreamUnavailableError,
      );
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('converte falha de rede em erro de domínio', async () => {
      const fetchFn = vi.fn(async () => {
        throw new TypeError('network down');
      });
      const gateway = buildGateway(fetchFn as unknown as typeof fetch);

      await expect(gateway.findEpisode(EpisodeNumber.create(1))).rejects.toThrow(
        UpstreamUnavailableError,
      );
    });
  });

  describe('listEpisodeNumbers', () => {
    it('deriva a lista completa a partir da contagem da origem', async () => {
      const fetchFn = vi.fn(async () => jsonResponse({ info: { count: 3 }, results: [] }));
      const gateway = buildGateway(fetchFn as unknown as typeof fetch);

      await expect(gateway.listEpisodeNumbers()).resolves.toEqual([1, 2, 3]);
    });
  });
});

describe('RickAndMortyHttpGateway — bordas de protocolo', () => {
  it('trata lote de personagens inexistente como elenco vazio', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ error: 'not found' }, 404));
    const gateway = buildGateway(fetchFn as unknown as typeof fetch);

    await expect(gateway.findCharactersByIds([9999])).resolves.toEqual([]);
  });

  it('rejeita lote de personagens fora do contrato', async () => {
    const fetchFn = vi.fn(async () => jsonResponse([{ id: 'inválido' }]));
    const gateway = buildGateway(fetchFn as unknown as typeof fetch);

    await expect(gateway.findCharactersByIds([1])).rejects.toThrow(UpstreamUnavailableError);
  });

  it('rejeita índice de episódios fora do contrato', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ info: {} }));
    const gateway = buildGateway(fetchFn as unknown as typeof fetch);

    await expect(gateway.listEpisodeNumbers()).rejects.toThrow(UpstreamUnavailableError);
  });

  it('não repete requisição em erro definitivo do cliente', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ error: 'bad request' }, 400));
    const gateway = buildGateway(fetchFn as unknown as typeof fetch, 3);

    await expect(gateway.findEpisode(EpisodeNumber.create(1))).rejects.toThrow(
      UpstreamUnavailableError,
    );
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('usa a URL pública da origem quando nenhuma base é configurada', () => {
    expect(() => new RickAndMortyHttpGateway()).not.toThrow();
  });
});
