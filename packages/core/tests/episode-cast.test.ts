import { describe, expect, it } from 'vitest';
import { EpisodeCast, EpisodeNumber } from '../src/domain/index.ts';
import { makeCharacter } from '../src/testing/index.ts';

const episode = {
  number: EpisodeNumber.create(1),
  name: 'Pilot',
  code: 'S01E01',
  airDate: 'December 2, 2013',
};

const namesOf = (cast: EpisodeCast) => cast.characters.map((character) => character.name);

describe('EpisodeCast', () => {
  it('ordena os personagens alfabeticamente', () => {
    const cast = EpisodeCast.assemble(episode, [
      makeCharacter({ id: 1, name: 'Summer Smith' }),
      makeCharacter({ id: 2, name: 'Beth Smith' }),
      makeCharacter({ id: 3, name: 'Morty Smith' }),
    ]);

    expect(namesOf(cast)).toEqual(['Beth Smith', 'Morty Smith', 'Summer Smith']);
  });

  it('posiciona nomes acentuados junto dos equivalentes sem acento', () => {
    const cast = EpisodeCast.assemble(episode, [
      makeCharacter({ id: 1, name: 'Zeta Alpha' }),
      makeCharacter({ id: 2, name: 'Ábradolf Lincler' }),
      makeCharacter({ id: 3, name: 'Beth Smith' }),
    ]);

    expect(namesOf(cast)).toEqual(['Ábradolf Lincler', 'Beth Smith', 'Zeta Alpha']);
  });

  it('não regride ao comportamento de ordenação por code point', () => {
    const names = ['Zeta', 'Ábradolf'];
    const naive = names.toSorted();

    const cast = EpisodeCast.assemble(
      episode,
      names.map((name, index) => makeCharacter({ id: index + 1, name })),
    );

    expect(naive).toEqual(['Zeta', 'Ábradolf']);
    expect(namesOf(cast)).toEqual(['Ábradolf', 'Zeta']);
  });

  it('ordena numericamente sufixos numéricos', () => {
    const cast = EpisodeCast.assemble(episode, [
      makeCharacter({ id: 1, name: 'Rick 10' }),
      makeCharacter({ id: 2, name: 'Rick 2' }),
    ]);

    expect(namesOf(cast)).toEqual(['Rick 2', 'Rick 10']);
  });

  it('desempata nomes idênticos pelo id para manter ordem determinística', () => {
    const cast = EpisodeCast.assemble(episode, [
      makeCharacter({ id: 99, name: 'Rick Sanchez' }),
      makeCharacter({ id: 12, name: 'Rick Sanchez' }),
    ]);

    expect(cast.characters.map((character) => character.id)).toEqual([12, 99]);
  });

  it('produz a mesma saída independente da ordem de entrada', () => {
    const characters = [
      makeCharacter({ id: 3, name: 'Morty Smith' }),
      makeCharacter({ id: 1, name: 'Beth Smith' }),
      makeCharacter({ id: 2, name: 'Summer Smith' }),
    ];

    const forward = namesOf(EpisodeCast.assemble(episode, characters));
    const backward = namesOf(EpisodeCast.assemble(episode, characters.toReversed()));

    expect(forward).toEqual(backward);
  });

  it('não muta o array recebido', () => {
    const characters = [
      makeCharacter({ id: 1, name: 'Summer Smith' }),
      makeCharacter({ id: 2, name: 'Beth Smith' }),
    ];
    const snapshot = characters.map((character) => character.name);

    EpisodeCast.assemble(episode, characters);

    expect(characters.map((character) => character.name)).toEqual(snapshot);
  });

  it('reporta elenco vazio', () => {
    const cast = EpisodeCast.assemble(episode, []);

    expect(cast.isEmpty).toBe(true);
    expect(cast.size).toBe(0);
  });
});
