import { z } from 'zod';

const characterStatusSchema = z.enum(['Alive', 'Dead', 'unknown']).catch('unknown');

const namedReferenceSchema = z.object({ name: z.string() });

export const characterDtoSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  status: characterStatusSchema,
  species: z.string(),
  gender: z.string(),
  origin: namedReferenceSchema,
  location: namedReferenceSchema,
  image: z.string(),
});

export const charactersResponseSchema = z.union([characterDtoSchema, z.array(characterDtoSchema)]);

export const episodeDtoSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  air_date: z.string(),
  episode: z.string(),
  characters: z.array(z.string()),
});

export const characterEpisodesSchema = z.object({
  id: z.number().int().positive(),
  episode: z.array(z.string()),
});

export const episodeSummarySchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  episode: z.string(),
});

export const episodeSummaryResponseSchema = z.union([
  episodeSummarySchema,
  z.array(episodeSummarySchema),
]);

export const episodeIndexSchema = z.object({
  info: z.object({
    count: z.number().int().nonnegative(),
    pages: z.number().int().nonnegative(),
  }),
});

export const episodePageSchema = z.object({
  info: z.object({ pages: z.number().int().nonnegative() }),
  results: z.array(episodeDtoSchema),
});

export type CharacterDto = z.infer<typeof characterDtoSchema>;
export type EpisodeDto = z.infer<typeof episodeDtoSchema>;
