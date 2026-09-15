'use client';

import { useDeferredValue, useId, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="sm:max-w-xs sm:flex-1">
          <label
            htmlFor={filterId}
            className="mb-1.5 block text-xs uppercase tracking-wide text-ink-faint"
          >
            Filtrar elenco
          </label>
          <input
            id={filterId}
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Buscar por nome…"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink transition-colors placeholder:text-ink-faint hover:border-border-strong focus:border-portal focus:outline-none"
          />
        </div>

        <p className="text-sm text-ink-muted" aria-live="polite" data-testid="cast-count">
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
