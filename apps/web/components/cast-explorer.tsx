'use client';

import { useDeferredValue, useId, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { foldForSearch } from '@/lib/text';
import { CharacterCard } from './character-card';
import { CharacterDetailSheet, characterEpisodesQuery } from './character-detail-sheet';

import type { Character } from '@zrp/core';

const PRIORITY_IMAGE_COUNT = 8;

export interface CastExplorerProps {
  readonly characters: readonly Character[];
}

export function CastExplorer({ characters }: CastExplorerProps) {
  const queryClient = useQueryClient();
  const filterId = useId();
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Character | null>(null);

  const deferredFilter = useDeferredValue(filter);

  const searchIndex = useMemo(
    () => characters.map((character) => foldForSearch(character.name)),
    [characters],
  );

  const visible = useMemo(() => {
    const needle = foldForSearch(deferredFilter.trim());
    if (needle === '') return characters;

    return characters.filter((_, index) => searchIndex[index]?.includes(needle));
  }, [characters, searchIndex, deferredFilter]);

  function prefetchEpisodes(character: Character) {
    void queryClient.prefetchQuery(characterEpisodesQuery(character.id));
  }

  return (
    <>
      <div className="mb-5">
        <label htmlFor={filterId} className="sr-only">
          Filtrar elenco
        </label>
        <div className="relative">
          <Search
            aria-hidden
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
          />
          <Input
            id={filterId}
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Buscar por nome…"
            className="h-12 bg-surface pl-10 text-base md:text-base"
          />
        </div>

        <p className="mt-2 text-sm text-ink-muted" aria-live="polite" data-testid="cast-count">
          {visible.length === characters.length
            ? `${characters.length} ${characters.length === 1 ? 'personagem' : 'personagens'}`
            : `${visible.length} de ${characters.length}`}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-card border border-dashed border-border py-12 text-center text-ink-muted">
          Nenhum personagem corresponde a <span className="text-ink">“{filter}”</span>.
        </p>
      ) : (
        <ul
          data-testid="cast-grid"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {visible.map((character, index) => (
            <li key={character.id}>
              <CharacterCard
                character={character}
                priority={index < PRIORITY_IMAGE_COUNT}
                onSelect={setSelected}
                onPrefetch={prefetchEpisodes}
              />
            </li>
          ))}
        </ul>
      )}

      {selected !== null && (
        <CharacterDetailSheet character={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
