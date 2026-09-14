import { z } from 'zod';

export const characterSchema = z
  .object({
    id: z.int().positive(),
    name: z.string(),
    status: z.enum(['Alive', 'Dead', 'unknown']),
    species: z.string(),
    gender: z.string(),
    origin: z.string(),
    location: z.string(),
    imageUrl: z.url(),
  })
  .meta({ id: 'Character' });

export const episodeListSchema = z
  .object({ episodes: z.array(z.int().positive()).readonly() })
  .meta({ id: 'EpisodeList' });

export const episodeCastSchema = z
  .object({
    episode: z.object({
      number: z.int().positive(),
      name: z.string(),
      code: z.string(),
      airDate: z.string(),
    }),
    characters: z.array(characterSchema).readonly(),
    meta: z.object({
      total: z.int().nonnegative(),
      source: z.enum(['cache', 'origin']),
    }),
  })
  .meta({ id: 'EpisodeCast' });

export const characterAppearancesSchema = z
  .object({
    characterId: z.int().positive(),
    episodes: z
      .array(
        z.object({
          number: z.int().positive(),
          code: z.string(),
          name: z.string(),
        }),
      )
      .readonly(),
  })
  .meta({ id: 'CharacterAppearances' });

export const healthSchema = z
  .object({ status: z.literal('ok'), uptime: z.number() })
  .meta({ id: 'Health' });

export const errorSchema = z
  .object({
    error: z.object({
      // String, e não enum: um código novo no domínio não pode quebrar a
      // serialização da resposta de erro. Os clientes tratam o desconhecido.
      code: z
        .string()
        .describe(
          'INVALID_EPISODE_NUMBER | EPISODE_NOT_FOUND | UPSTREAM_UNAVAILABLE | ROUTE_NOT_FOUND | INTERNAL_ERROR',
        ),
      message: z.string(),
    }),
  })
  .meta({ id: 'ErrorBody' });

export const resourceIdParamsSchema = z.object({
  id: z.string().describe('Identificador numérico do recurso.'),
});
