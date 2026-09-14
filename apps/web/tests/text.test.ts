import { describe, expect, it } from 'vitest';
import { foldForSearch } from '@/lib/text';

describe('foldForSearch', () => {
  it.each([
    ['Ábradolf Lincler', 'abradolf lincler'],
    ['RICK SANCHEZ', 'rick sanchez'],
    ['Mr. Poopybutthole', 'mr. poopybutthole'],
    ['', ''],
  ])('normaliza %s', (input, expected) => {
    expect(foldForSearch(input)).toBe(expected);
  });

  it('torna equivalentes formas acentuadas e não acentuadas', () => {
    expect(foldForSearch('Ábradolf')).toBe(foldForSearch('Abradolf'));
  });
});
