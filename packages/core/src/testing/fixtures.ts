import type { EpisodeRecord } from '../application/ports/index.ts';
import type { Character } from '../domain/index.ts';

export function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    gender: 'Male',
    origin: 'Earth (C-137)',
    location: 'Citadel of Ricks',
    imageUrl: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    ...overrides,
  };
}

export function makeEpisodeRecord(overrides: Partial<EpisodeRecord> = {}): EpisodeRecord {
  return {
    number: 1,
    name: 'Pilot',
    code: 'S01E01',
    airDate: 'December 2, 2013',
    characterIds: [1, 2],
    ...overrides,
  };
}
