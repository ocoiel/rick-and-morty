import { describe, expect, it } from 'vitest';
import { EpisodeNumber, InvalidEpisodeNumberError } from '../src/domain/index.js';

describe('EpisodeNumber', () => {
  it.each([
    ['número inteiro', 7, 7],
    ['string numérica', '7', 7],
    ['string com espaços', '  7  ', 7],
    ['primeiro episódio', 1, 1],
  ])('aceita %s', (_label, input, expected) => {
    expect(EpisodeNumber.create(input).value).toBe(expected);
  });

  it.each([
    ['zero', 0],
    ['negativo', -1],
    ['decimal', 7.5],
    ['texto', 'abc'],
    ['string vazia', ''],
    ['apenas espaços', '   '],
    ['null', null],
    ['undefined', undefined],
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['objeto', {}],
    ['array', [1]],
    ['acima do inteiro seguro', Number.MAX_SAFE_INTEGER + 2],
  ])('rejeita %s', (_label, input) => {
    expect(() => EpisodeNumber.create(input)).toThrow(InvalidEpisodeNumberError);
  });

  it('expõe o valor recebido no erro para diagnóstico', () => {
    expect(() => EpisodeNumber.create('abc')).toThrowError(
      expect.objectContaining({ code: 'INVALID_EPISODE_NUMBER', received: 'abc' }),
    );
  });

  it('safeCreate devolve null em vez de lançar', () => {
    expect(EpisodeNumber.safeCreate('abc')).toBeNull();
    expect(EpisodeNumber.safeCreate(3)?.value).toBe(3);
  });

  it('compara por valor, não por referência', () => {
    expect(EpisodeNumber.create(3).equals(EpisodeNumber.create('3'))).toBe(true);
    expect(EpisodeNumber.create(3).equals(EpisodeNumber.create(4))).toBe(false);
  });
});
