import type { Character } from '@zrp/core';

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

export const CAST: readonly Character[] = [
  makeCharacter({ id: 35, name: 'Ábradolf Lincler', species: 'Human' }),
  makeCharacter({ id: 2, name: 'Morty Smith', status: 'Alive' }),
  makeCharacter({ id: 1, name: 'Rick Sanchez' }),
  makeCharacter({ id: 8, name: 'Adjudicator Rick', status: 'Dead' }),
];
