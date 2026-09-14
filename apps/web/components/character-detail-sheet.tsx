'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import type { Character } from '@zrp/core';
import { StatusBadge } from './status-badge';

export interface CharacterEpisodes {
  readonly episodes: readonly { readonly number: number; readonly code: string }[];
}

export function characterEpisodesQuery(characterId: number) {
  return {
    queryKey: ['character-episodes', characterId] as const,
    queryFn: async (): Promise<CharacterEpisodes> => {
      const response = await fetch(`/api/characters/${characterId}/episodes`);
      if (!response.ok) throw new Error('Falha ao carregar episódios do personagem.');
      return response.json() as Promise<CharacterEpisodes>;
    },
  };
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-0">
      <dt className="shrink-0 text-xs uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="truncate text-right text-sm text-ink" title={value}>
        {value}
      </dd>
    </div>
  );
}

export interface CharacterDetailSheetProps {
  readonly character: Character;
  readonly onClose: () => void;
}

export function CharacterDetailSheet({ character, onClose }: CharacterDetailSheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const { data, isPending, isError } = useQuery(characterEpisodesQuery(character.id));

  useEffect(() => {
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Fechar detalhes"
        onClick={onClose}
        className="absolute inset-0 bg-void/80 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalhe-nome"
        data-testid="character-detail"
        className="rise relative z-10 max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-border bg-surface p-5 sm:rounded-2xl"
      >
        <div className="flex items-start gap-4">
          <Image
            src={character.imageUrl}
            alt=""
            width={88}
            height={88}
            className="rounded-xl border border-border"
          />
          <div className="min-w-0 flex-1">
            <h2 id="detalhe-nome" className="text-balance text-lg font-bold leading-tight">
              {character.name}
            </h2>
            <div className="mt-1.5">
              <StatusBadge status={character.status} />
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg border border-border px-2 py-1 text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
          >
            ✕
          </button>
        </div>

        <dl className="mt-5">
          <DetailRow label="Espécie" value={character.species} />
          <DetailRow label="Gênero" value={character.gender} />
          <DetailRow label="Origem" value={character.origin} />
          <DetailRow label="Localização" value={character.location} />
        </dl>

        <section className="mt-5">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-ink-faint">Aparições</h3>

          {isPending && (
            <div className="flex flex-wrap gap-1.5" aria-label="Carregando aparições">
              {Array.from({ length: 8 }, (_, index) => (
                <span key={index} className="shimmer h-6 w-14 rounded-md" />
              ))}
            </div>
          )}

          {isError && (
            <p className="text-sm text-plumbus">Não foi possível carregar as aparições.</p>
          )}

          {data && (
            <ul className="flex flex-wrap gap-1.5">
              {data.episodes.map((episode) => (
                <li key={episode.number}>
                  <span
                    data-testid="appearance"
                    className="inline-block rounded-md border border-border bg-surface-raised px-2 py-1 text-xs text-ink-muted"
                  >
                    {episode.code}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
